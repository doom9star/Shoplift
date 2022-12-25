import { NC } from "../../../lib/constants";
import { cors, isAuth } from "../../../lib/middleware";
import Image from "../../../lib/mongo/models/Image";
import Order from "../../../lib/mongo/models/Order";
import OrderItem from "../../../lib/mongo/models/OrderItem";
import Product from "../../../lib/mongo/models/Product";
import { getResponse } from "../../../lib/utils";

export default NC()
  .use(cors)
  .use(isAuth)
  .get(async (req, res) => {
    const orders = await Order.find({ user: req.uid, ordered: true })
      .populate({
        path: "items",
        select: "product quantity",
        model: OrderItem,
        populate: {
          path: "product",
          select: "name price images",
          model: Product,
          populate: {
            path: "images",
            select: "url",
            model: Image,
          },
        },
      })
      .exec();
    return res.json(getResponse(200, orders));
  });
