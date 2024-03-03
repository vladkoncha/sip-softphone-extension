"use client";

import { observer } from "mobx-react-lite";
import { useUserAgent } from "../../app/store/user-agent-provider";
import styles from "./styles.module.css";

export const Header = observer(() => {
  const userAgentStore = useUserAgent();

  return (
    <div className={styles.header}>
      <p>Status: {userAgentStore.connectionStatus}</p>
      <button
        className={styles.button}
        onClick={() =>
          // @ts-ignore
          chrome.tabs.create({ url: chrome.runtime.getURL("index.html") })
        }
      >
        Открыть в новой вкладке
      </button>
    </div>
  );
});
