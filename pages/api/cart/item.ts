import { ObjectId } from "mongoose";
import { NC } from "../../../lib/constants";
import { cors, isAuth } from "../../../lib/middleware";
import Order from "../../../lib/mongo/models/Order";
import OrderItem from "../../../lib/mongo/models/OrderItem";
import { TOrderItem } from "../../../lib/types";
import { getResponse } from "../../../lib/utils";

export default NC()
  .use(cors)
  .use(isAuth)
  .post(async (req, res) => {
    const { pid } = req.body;
    const item = await OrderItem.create({ product: pid });

    let cart = await Order.findOne({ user: req.uid, ordered: false })
      .populate("items", "product", OrderItem)
      .exec();
    if (!cart) {
      cart = await Order.create({ user: req.uid, items: [item] });
      return res.json(getResponse(200, { cart }));
    } else {
      cart.items.push(item.id);
      await cart.save();
    }
    return res.json(getResponse(200, { item }));
  })
  .delete(async (req, res) => {
    const { pid } = req.body;
    const cart = await Order.findOne({ user: req.uid, ordered: false })
      .populate("items", "product", OrderItem)
      .exec();

    if (!cart) return res.json(getResponse(404));

    await OrderItem.deleteOne({ product: pid });
    cart.items = cart.items.filter((i: any) => i.product.toHexString() !== pid);
    await cart.save();

    return res.json(getResponse(200));
  })
  .put(async (req, res) => {
    const { iid, value } = req.body;
    const item = await OrderItem.findById(iid).exec();
    if (!item) return res.json(getResponse(404));

    item.quantity += value;
    if (item.quantity === 0) {
      await OrderItem.deleteOne({ id: iid });
      const cart = await Order.findOne({
        user: req.uid,
        ordered: false,
      }).exec();
      cart.items = cart.items.filter((i: any) => i.toHexString() !== iid);
      await cart.save();
    } else await item.save();

    return res.json(getResponse(200));
  });
