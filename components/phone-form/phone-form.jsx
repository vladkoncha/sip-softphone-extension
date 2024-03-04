import { useState } from "react";
import styles from "./styles.module.css";
import { Input } from "../ui/input";
import { observer } from "mobx-react-lite";
import { IconButton } from "../ui/icon-button/icon-button";
import { Phone } from "../ui/icons/phone";

// @ts-ignore
export const PhoneForm = observer(({ onSubmit }) => {
  const [calledUser, setCalledUser] = useState("");

  return (
    <form
      className={styles["form"]}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(calledUser);
      }}
    >
      <div className={styles["form-items-container"]}>
        <div className={styles["form-item"]}>
          <label htmlFor="phone">Номер или логин вызываемого абонента</label>
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
  );
});
