import { forwardRef } from "react";
import styles from "./styles.module.css";
import clsx from "clsx";

// @ts-ignore
const IconButton = forwardRef(
  // @ts-ignore
  ({ icon: Icon, onClick, ...rest }, ref) => {
    return (
      <button
        type="button"
        // @ts-ignore
        className={styles["icon-button"]}
        ref={ref}
        onClick={onClick}
        {...rest}
      >
        <Icon />
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
export { IconButton };
