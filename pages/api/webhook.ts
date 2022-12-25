import Stripe from "stripe";
import { PageConfig } from "next";
import { NC } from "../../lib/constants";
import { buffer } from "micro";
import { getResponse } from "../../lib/utils";
import connectDB from "../../lib/mongo";
import Order from "../../lib/mongo/models/Order";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
  apiVersion: "2020-08-27",
});

export default NC().post(async (req, res) => {
  let event;
  try {
    const rawBody = await buffer(req);
    const signature = req.headers["stripe-signature"] as string;
    const secret = process.env.STRIPE_WEBHOOK_SECRET as string;
    event = stripe.webhooks.constructEvent(
      rawBody.toString(),
      signature,
      secret
    );
  } catch {
    return res.json(getResponse(500));
  }

  if (event.type !== "checkout.session.completed")
    return res.json(getResponse(500));

  await connectDB();

  const success_url = (event.data.object as any).success_url + "";
  const order_id = success_url
    .slice(success_url.search("order_id"))
    .split("=")[1];

  await Order.updateOne({ _id: order_id }, { $set: { ordered: true } });
  return res.json(getResponse(200));
});

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
