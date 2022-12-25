import type { NextPage } from "next";
import Link from "next/link";
import { useGCtx } from "../lib/context";

const Index: NextPage = () => {
  const { user } = useGCtx();
  return (
    <>
      <div className="h-[10%] flex justify-end items-center pr-10">
        {!user ? (
          <>
            <Link href={"/login"}>
              <a className="mr-2 btn">Login</a>
            </Link>
            <Link href={"/register"}>
              <a className="btn">Register</a>
            </Link>
          </>
        ) : (
          <Link href={"/home"}>
            <a className="btn">Home</a>
          </Link>
        )}
      </div>
      <div className="h-[90%] flex flex-col justify-center items-center">
        <span className="text-9xl font-bold">SHOP-LIFT</span>
      </div>
    </>
  );
};

export default Index;
