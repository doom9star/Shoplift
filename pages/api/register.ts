import { hash } from "bcryptjs";
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
    const { name, email, password } = req.body;
    if (!name || !email || !email.includes("@") || !password)
      return res.json(getResponse(422));

    await connectDB();

    const emailExists = await User.findOne({ email }).exec();
    if (emailExists) return res.json(getResponse(422));

    const user = await User.create({
      name,
      email,
      password: await hash(password, 12),
    });
    const token = setAuthPayload({ uid: user._id });
    const cookies = new Cookies(req, res);
    cookies.set("token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "none",
      secure: true,
    });

    return res.json(getResponse(200));
  });
