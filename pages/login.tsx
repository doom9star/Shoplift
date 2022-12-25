import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import classNames from "classnames";
import { cAxios } from "../lib/constants";
import { useRouter } from "next/router";
import { PublicRoute } from "../lib/components/Route";
import { TServerResponse } from "../lib/types";
import { useGCtx } from "../lib/context";

type TInfo = {
  email: string;
  password: string;
};

type TErrors = TInfo & { server: string };

function Login() {
  const [info, setInfo] = useState<TInfo>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<TErrors>({
    email: "",
    password: "",
    server: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useGCtx();

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setInfo((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }, []);

  const handleRegister = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const _errors = {} as TErrors;
      if (!info.email.includes("@")) _errors.email = "Please provide an email!";
      if (info.password.trim() === "")
        _errors.password = "Please provide a password!";

      setErrors(_errors);

      if (JSON.stringify(_errors) === "{}") {
        setLoading(true);
        cAxios.post<TServerResponse>("/login", info).then((res) => {
          if (res.data.status === 200) {
            setUser(res.data.data);
            router.replace("/home");
            return;
          }
          setErrors((prev) => ({ ...prev, server: res.data.message }));
          setLoading(false);
        });
      }
    },
    [info, router, setUser]
  );

  return (
    <PublicRoute>
      <div className="flex justify-center items-center h-full">
        <form
          className="bg-white border min-w-[500px] px-8 pt-6 pb-8"
          onSubmit={handleRegister}
        >
          {errors.server && (
            <div className="bg-red-100 flex justify-between items-center border border-red-400 text-red-700 px-4 py-3 rounded">
              <span className="text-sm">{errors.server}</span>
              <i
                className="fas fa-times text-red-500 cursor-pointer"
                onClick={() => {
                  setErrors((prev) => ({ ...prev, server: "" }));
                }}
              ></i>
            </div>
          )}
          <p className="text-xl my-4 font-bold text-gray-700 text-center">
            E-Commerce
          </p>
          <div className="mb-4">
            <input
              className={
                "border mb-3 appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none " +
                classNames({ "border-red-500": errors.email })
              }
              type="text"
              placeholder="Email"
              name="email"
              value={info.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-red-500 text-xs italic">{errors.email}</p>
            )}
          </div>
          <div className="mb-6">
            <input
              className={
                "mb-3 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline " +
                classNames({ "border-red-500": errors.password })
              }
              type="password"
              placeholder="Password"
              name="password"
              value={info.password}
              onChange={handleChange}
            />
            {errors.password && (
              <p className="text-red-500 text-xs italic">{errors.password}</p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <button
              className={"btn" + classNames({ " bg-gray-500": loading })}
              type="submit"
              disabled={loading}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-b-0 animate-spin absolute rounded-full left-6 top-2 border-white"></div>
              )}
              Login
            </button>
          </div>
        </form>
      </div>
    </PublicRoute>
  );
}

export default Login;
