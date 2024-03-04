import { observer } from "mobx-react-lite";
import { useUserAgent } from "../../app/store/user-agent-provider";
import { CallCard } from "./ui/call-card";
import styles from "./styles.module.css";

export const HistoryWidget = observer(() => {
  const userAgentStore = useUserAgent();

  return (
    <div className={styles["history-container"]}>
      <h2 className={styles["title"]}>История звонков</h2>
      <div className={styles["cards-container"]}>
        {userAgentStore.getCallHistory().map((call) => (
          <CallCard
            key={call.date.getTime()}
            {...call}
            onClick={() => userAgentStore.call(call.user)}
          />
        ))}
      </div>
    </div>
  );
});
