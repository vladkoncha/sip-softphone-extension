import { observer } from "mobx-react-lite";
import { useUserAgent } from "../../app/store/user-agent-provider";
import { IconButton } from "../ui/icon-button/icon-button";
import { Phone } from "../ui/icons/phone";
import { Cross } from "../ui/icons/cross";
import styles from "./styles.module.css";

export const IncomingCallWidget = observer(() => {
  const userAgentStore = useUserAgent();

  return (
    <div className={styles["container"]}>
      <h1>{userAgentStore.callStatus.user}</h1>
      <div className={styles["buttons-container"]}>
        <IconButton
          // @ts-ignore
          title="Ответить"
          onClick={() => userAgentStore.acceptIncomingCall()}
          icon={Phone}
          style={{ width: "4rem", height: "4rem", backgroundColor: "var(--green)" }}
        />
        <IconButton
          // @ts-ignore
          title="Сбросить"
          onClick={() => userAgentStore.terminateCall()}
          icon={Cross}
          style={{ width: "4rem", height: "4rem", backgroundColor: "var(--decline-red)" }}
        />
      </div>
    </div>
  );
});
