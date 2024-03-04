"use client";

import { observer } from "mobx-react-lite";
import { useUserAgent } from "../../app/store/user-agent-provider";
import styles from "./styles.module.css";
import {
  ConnectionStatus,
  STATUS_MAP,
} from "../../app/store/connection-status";
import clsx from "clsx";
import { IconButton } from "../ui/icon-button/icon-button";
import { ExternalLink } from "../ui/icons/external-link";

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

      <IconButton
        // @ts-ignore
        title="Открыть в новой вкладке"
        style={{ width: "2rem", height: "2rem" }}
        icon={ExternalLink}
        onClick={() =>
          // @ts-ignore
          chrome.tabs.create({ url: chrome.runtime.getURL("index.html") })
        }
      />
    </div>
  );
});
