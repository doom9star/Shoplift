import { v2 } from "cloudinary";
import type { PageConfig } from "next";
import { NC } from "../../lib/constants";
import { addCloudinary, cors, isAuth } from "../../lib/middleware";
import connectDB from "../../lib/mongo";
import Image from "../../lib/mongo/models/Image";
import User from "../../lib/mongo/models/User";
import { TImageState } from "../../lib/types";
import { getResponse } from "../../lib/utils";

export default NC()
  .use(cors)
  .use(isAuth)
  .use(addCloudinary)
  .put(async (req, res) => {
    await connectDB();

    const { avatar, avatarState } = req.body;
    const user = await User.findById(req.uid)
      .populate("avatar", "url cid", Image)
      .exec();

    if (user.avatar) {
      await v2.uploader.destroy(user.avatar.cid);
      await Image.deleteOne({ _id: user.avatar._id });
      user.avatar = undefined;
    }
    if (avatarState === TImageState.CHANGE) {
      const { public_id, secure_url } = await v2.uploader.upload(avatar);
      const newAvatar = await Image.create({ url: secure_url, cid: public_id });
      user.avatar = newAvatar;
    }
    await user.save();
    return res.json(getResponse(200, user.avatar));
  });

export const config: PageConfig = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};
