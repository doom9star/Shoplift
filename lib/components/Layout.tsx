import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import React from "react";
import useMe from "../hooks/useMe";
import Navbar from "./Navbar";
import Spinner from "./Spinner";

const Layout: React.FC = ({ children }) => {
  const [loading] = useMe();
  const router = useRouter();
  if (loading) return <Spinner />;

  return (
    <React.Fragment>
      <Head>
        <title>ShopLift</title>
        <meta name="description" content="Global Emerging E-Commerce Store!" />
      </Head>
      <Script
        src="https://kit.fontawesome.com/d75646cf0c.js"
        crossOrigin="anonymous"
      />
      <div className="w-[100vw] h-[100vh]">
        {router.pathname.includes("home") && <Navbar />}
        {children}
      </div>
    </React.Fragment>
  );
};

export default Layout;
