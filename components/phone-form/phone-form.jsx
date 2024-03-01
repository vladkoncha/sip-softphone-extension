import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { Input } from "../ui/input";
import { observer } from "mobx-react-lite";
import { useUserAgent } from "../../app/store/user-agent-provider";

export const PhoneForm = observer(() => {
  const [calledUser, setCalledUser] = useState("");
  const [error, setError] = useState("");
  const [isCalling, setIsCalling] = useState(false);

  const userAgentStore = useUserAgent();

  useEffect(() => {
    if (userAgentStore.errorMessage) {
      setError(userAgentStore.errorMessage);
    } else {
      setError("");
    }
    setIsCalling(false);
  }, [userAgentStore.errorMessage]);

  const handleSubmit = (event) => {
    event.preventDefault();
    userAgentStore.clearError();
    setIsCalling(true);

    userAgentStore.call(calledUser);
  };

  return (
    <div className={styles["container"]}>
      <p className={styles["error"]}>{error}</p>
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
        <button className={styles["button"]} type="submit" disabled={isCalling}>
          Позвонить
        </button>
      </form>
    </div>
  );
});
