"use client";

import { observer } from "mobx-react-lite";
import { useUserAgent } from "../../app/store/user-agent-provider";
import { getFormattedDuration } from "../../utils/getFormattedDuration";
import { IconButton } from "../ui/icon-button/icon-button";
import { Cross } from "../ui/icons/cross";
import styles from "./styles.module.css";
import { AgentStatus, CALL_STATUS_MAP } from "../../app/store/agent-status";
import clsx from "clsx";

export const CallStatus = observer(() => {
  const userAgentStore = useUserAgent();

  const duration = userAgentStore.callStatus.duration;

  return (
    <div className={styles["container"]}>
      <div
        className={clsx(styles["status-bar"], {
          [styles["yellow"]]: [
            AgentStatus.CALL_CONNECTING,
            AgentStatus.CALL_IN_PROGRESS,
          ].includes(userAgentStore.agentStatus),
          [styles["green"]]:
            userAgentStore.agentStatus === AgentStatus.CALL_CONFIRMED,
          [styles["red"]]:
            userAgentStore.agentStatus === AgentStatus.CALL_TERMINATED,
        })}
      />
      <h1>{userAgentStore.callStatus.user}</h1>
      <p>{CALL_STATUS_MAP[userAgentStore.agentStatus]}</p>
      <p>{getFormattedDuration(duration)}</p>

      <IconButton
        // @ts-ignore
        title="Сбросить"
        onClick={() => userAgentStore.terminateCall()}
        icon={Cross}
        style={{
          width: "4rem",
          height: "4rem",
          backgroundColor: "var(--decline-red)",
          marginBottom: "3rem",
        }}
      />
    </div>
  );
});
