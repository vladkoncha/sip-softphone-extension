"use client";

import styles from "./styles.module.css";
import { RegistrationPage } from "../components/pages/registration-page";
import { useRouter } from "../app/router/router";
import { HOME_PAGE, REGISTRATION_PAGE } from "../app/router/routes";
import { HomePage } from "../components/pages/home-page";

export default function Home() {
  const router = useRouter();

  return (
    <div className={styles["page-container"]}>
      {router.currentRoute === REGISTRATION_PAGE && <RegistrationPage />}
      {router.currentRoute === HOME_PAGE && <HomePage />}
    </div>
  );
}
