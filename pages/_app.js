import Head from "next/head";
import { Header } from "../components/header";
import { RouterProvider } from "../app/router/router";
import { UserAgentProvider } from "../app/store/user-agent-provider";

import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="main-container">
        <UserAgentProvider>
          <RouterProvider>
            <Header />
            <Component {...pageProps} />
          </RouterProvider>
        </UserAgentProvider>
      </div>
    </>
  );
}
