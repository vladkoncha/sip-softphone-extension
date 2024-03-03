import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { Input } from "../ui/input";
import { observer } from "mobx-react-lite";
import { useUserAgent } from "../../app/store/user-agent-provider";

export const PhoneForm = observer(() => {
  const [calledUser, setCalledUser] = useState("");

  const userAgentStore = useUserAgent();

  const handleSubmit = (event) => {
    event.preventDefault();
    userAgentStore.clearError();

    userAgentStore.call(calledUser);
  };

  return (
    <div className={styles["container"]}>
      <p className={styles["error"]}>{userAgentStore.errorMessage}</p>
      <p className={styles["my-number"]}>
        Мой номер:{" "}
        <strong>{userAgentStore.userAgent.get("authorization_user")}</strong>
      </p>
      <form className={styles["form"]} onSubmit={handleSubmit}>
        <div className={styles["form-items-container"]}>
          <div className={styles["form-item"]}>
            <label htmlFor="phone">Вызываемый:</label>
            <Input
              // @ts-ignore
              type="text"
              id="phone"
              name="phone"
              value={calledUser}
              onChange={(e) => setCalledUser(e.target.value)}
              required
            />
          </div>
        </div>
        <button className={styles["button"]} type="submit">
          Позвонить
        </button>
      </form>
    </div>
  );
});
