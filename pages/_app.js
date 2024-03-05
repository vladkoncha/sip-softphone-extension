import '../styles/globals.css';

import Head from 'next/head';

import { RouterProvider } from '../app/router/router';
import { UserAgentProvider } from '../app/store/user-agent-provider';
import { Header } from '../components/header';

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
