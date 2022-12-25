import Stripe from "stripe";
import { NC } from "../../lib/constants";
import { cors, isAuth } from "../../lib/middleware";
import { getResponse } from "../../lib/utils";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
  apiVersion: "2020-08-27",
});

export default NC()
  .use(cors)
  .use(isAuth)
  .get(async (req, res) => {
    try {
      const session_id = req.query.session_id;
      const session = await stripe.checkout.sessions.retrieve(
        session_id as string
      );
      return res.json(getResponse(200, session));
    } catch {
      return res.json(getResponse(500));
    }
  })
  .post(async (req, res) => {
    const { items, order_id } = req.body;
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: items,
        cancel_url: process.env.PROXY_SERVER + "/home/cart",
        success_url:
          process.env.PROXY_SERVER +
          "/home/checkout-success?session_id={CHECKOUT_SESSION_ID}" +
          `&order_id=${order_id}`,
      });
      return res.json(getResponse(200, session.id));
    } catch (err) {
      console.log(err);
      return res.json(getResponse(500));
    }
  });
