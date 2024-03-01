"use client";

import styles from "./styles.module.css";
import { RegistrationPage } from "../components/pages/registration-page";
import { useRouter } from "../app/router/router";
import { CALL_PAGE, HOME_PAGE, REGISTRATION_PAGE } from "../app/router/routes";
import { HomePage } from "../components/pages/home-page";
import { useEffect } from "react";
import { useUserAgent } from "../app/store/user-agent-provider";
import { CallPage } from "../components/pages/call-page";
import { CONFIRMED, IN_PROGRESS } from "../app/store/call-status";
import { observer } from "mobx-react-lite";

function Home() {
  const router = useRouter();
  const userAgentStore = useUserAgent();

  useEffect(() => {
    // @ts-ignore
    const userLoginInfoString = sessionStorage.getItem("userLoginInfo");
    if (userLoginInfoString) {
      const userLoginInfo = JSON.parse(userLoginInfoString);
      // Use the retrieved user login info as needed
      userAgentStore.registerUserAgent(userLoginInfo);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      [IN_PROGRESS, CONFIRMED].includes(
        userAgentStore.callStatus.connectionStatus
      )
    ) {
      router.navigateTo(CALL_PAGE);
    } else {
      router.navigateTo(HOME_PAGE);
    }
  }, [router, userAgentStore.callStatus.connectionStatus]);

  return (
    <div className={styles["page-container"]}>
      {router.currentRoute === REGISTRATION_PAGE && <RegistrationPage />}
      {router.currentRoute === HOME_PAGE && <HomePage />}
      {router.currentRoute === CALL_PAGE && <CallPage />}
    </div>
  );
}

export default observer(Home);
