import type { AppProps } from "next/app";
import Layout from "../lib/components/Layout";
import CtxProvider from "../lib/context";
import "../styles.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CtxProvider>
      <Layout>
        <Component {...pageProps} />;
      </Layout>
    </CtxProvider>
  );
}

export default MyApp;
