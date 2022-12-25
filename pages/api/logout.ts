import Cookies from "cookies";
import { NC } from "../../lib/constants";
import { cors, isAuth } from "../../lib/middleware";
import { getResponse } from "../../lib/utils";

export default NC()
  .use(cors)
  .use(isAuth)
  .delete(async (req, res) => {
    const cookies = new Cookies(req, res, { secure: true });
    cookies.set("token", "", { maxAge: 0 });
    return res.json(getResponse(200));
  });
