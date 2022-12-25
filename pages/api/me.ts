import { NC } from "../../lib/constants";
import { cors, isAuth } from "../../lib/middleware";
import connectDB from "../../lib/mongo";
import Image from "../../lib/mongo/models/Image";
import User from "../../lib/mongo/models/User";
import { getResponse } from "../../lib/utils";

export default NC()
  .use(cors)
  .use(isAuth)
  .get(async (req, res) => {
    await connectDB();
    const user = await User.findById(req.uid)
      .populate("avatar", "url", Image)
      .exec();
    return res.json(getResponse(200, user));
  });
