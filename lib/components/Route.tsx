import { useRouter } from "next/router";
import { FC, Fragment } from "react";
import { useGCtx } from "../context";

export const PrivateRoute: FC = ({ children }) => {
  const { user } = useGCtx();
  const router = useRouter();
  if (!user) {
    router.replace("/");
    return null;
  }
  return <Fragment>{children}</Fragment>;
};

export const PublicRoute: FC = ({ children }) => {
  const { user } = useGCtx();
  const router = useRouter();
  if (user) {
    router.replace("/home");
    return null;
  }
  return <Fragment>{children}</Fragment>;
};
