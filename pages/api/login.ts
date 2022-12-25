import { compare } from "bcryptjs";
import Cookies from "cookies";
import { NC } from "../../lib/constants";
import { cors, isNotAuth } from "../../lib/middleware";
import connectDB from "../../lib/mongo";
import User from "../../lib/mongo/models/User";
import { getResponse, setAuthPayload } from "../../lib/utils";

export default NC()
  .use(cors)
  .use(isNotAuth)
  .post(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !email.includes("@") || !password)
      return res.json(getResponse(422));

    await connectDB();

    const user = await User.findOne({ email }).exec();
    if (!user) return res.json(getResponse(404));

    if (!(await compare(password, user.password)))
      return res.json(getResponse(422));

    const token = setAuthPayload({ uid: user._id });
    const cookies = new Cookies(req, res, {
      secure: true,
    });
    try {
      cookies.set("token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: "none",
        secure: true,
      });
    } catch (err) {
      console.log(err);
    }
    return res.json(getResponse(200, user));
  });
