import { useUserAgent } from "../../../app/store/user-agent-provider";
import { HistoryWidget } from "../../history-widget";
import { PhoneForm } from "../../phone-form";
import { IconButton } from "../../ui/icon-button/icon-button";
import { Logout } from "../../ui/icons/logout";
import styles from "./styles.module.css";

export const HomePage = () => {
  const userAgentStore = useUserAgent();

  const handleSubmit = (calledUser) => {
    userAgentStore.clearError();

    userAgentStore.call(calledUser);
  };

  return (
    <div className={styles["container"]}>
      <IconButton
        // @ts-ignore
        title="Выйти из аккаунта"
        style={{
          width: "2.5rem",
          height: "2.5rem",
          alignSelf: "flex-start",
          margin: "0.75rem",
          padding: "0.5rem",
        }}
        icon={Logout}
        onClick={() => userAgentStore.logout()}
      />
      <p className={styles["error"]}>{userAgentStore.errorMessage}</p>
      <p className={styles["my-number"]}>
        Мой номер:{" "}
        <strong>{userAgentStore.userAgent?.get("authorization_user")}</strong>
      </p>
      <PhoneForm
        // @ts-ignore
        onSubmit={handleSubmit}
      />
      <HistoryWidget />
    </div>
  );
};
