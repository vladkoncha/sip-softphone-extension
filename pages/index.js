"use client";

import { useState } from "react";
import { Index } from "../components/index";
import New from "../components/new";
import styles from "./styles.module.css";

export default function Home() {
  const [activePage, setActivePage] = useState("index");

  const navigateToPage = (page) => {
    setActivePage(page);
  };

  return (
    <div className={styles["page-container"]}>
      {activePage === "index" && <Index />}
      {activePage === "new" && <New navigateToPage={navigateToPage} />}
    </div>
  );
}
