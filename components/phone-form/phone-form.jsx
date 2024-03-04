import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { Input } from "../ui/input";
import { observer } from "mobx-react-lite";
import { useUserAgent } from "../../app/store/user-agent-provider";
import { IconButton } from "../ui/icon-button/icon-button";
import { Phone } from "../ui/icons/phone";

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
            <label htmlFor="phone">Номер или логин вызываемого</label>
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
        <IconButton
          // @ts-ignore
          title="Позвонить"
          style={{ width: "3rem", height: "3rem", backgroundColor: "#01d316" }}
          icon={Phone}
          type="submit"
        />
      </form>
    </div>
  );
});
