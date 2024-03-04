import { CallType } from "../../../../app/store/call-type";
import { getFormattedDuration } from "../../../../utils/getFormattedDuration";
import styles from "./styles.module.css";

export const CallCard = ({ user, duration, date, type, onClick }) => {
  return (
    <button onClick={onClick} className={styles["card-button"]}>
      <div className={styles["login-duration-container"]}>
        <p className={styles["user"]}>{user}</p>
        <p className={styles["type"]}>{type === CallType.INCOMING ? "входящий" : "исходящий"}</p>
        <p className={styles["duration"]}>
          Длительность: {getFormattedDuration(duration)}
        </p>
      </div>
      <p>{date.toLocaleString("ru-RU").slice(0, -3)}</p>
    </button>
  );
};
