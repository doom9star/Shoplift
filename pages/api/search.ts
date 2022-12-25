import { NC } from "../../lib/constants";
import { cors, isAuth } from "../../lib/middleware";
import Image from "../../lib/mongo/models/Image";
import Product from "../../lib/mongo/models/Product";
import { getResponse } from "../../lib/utils";

export default NC()
  .use(cors)
  .use(isAuth)
  .post(async (req, res) => {
    const { query } = req.body;

    const products = await Product.find({
      $or: [
        {
          name: { $regex: `.*${query}.*`, $options: "i" },
        },
        {
          description: { $regex: `.*${query}.*`, $options: "i" },
        },
      ],
    })
      .populate("images", "url", Image)
      .exec();

    return res.json(getResponse(200, products));
  });
