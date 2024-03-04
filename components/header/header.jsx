"use client";

import { observer } from "mobx-react-lite";
import { useUserAgent } from "../../app/store/user-agent-provider";
import styles from "./styles.module.css";
import {
  ConnectionStatus,
  STATUS_MAP,
} from "../../app/store/connection-status";
import clsx from "clsx";

export const Header = observer(() => {
  const userAgentStore = useUserAgent();

  return (
    <div className={styles.header}>
      <p
        className={clsx(styles["status"], {
          [styles["connected"]]:
            userAgentStore.connectionStatus === ConnectionStatus.CONNECTED,
          [styles["disconnected"]]:
            userAgentStore.connectionStatus === ConnectionStatus.DISCONNECTED,
        })}
      >
        {STATUS_MAP[userAgentStore.connectionStatus]}
      </p>
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
