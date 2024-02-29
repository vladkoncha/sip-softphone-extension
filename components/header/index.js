import styles from "./styles.module.css";

export function Header() {
  return (
    <div className={styles.header}>
      <p>SIP Softphone</p>
      <button
        className={styles.button}
        onClick={() =>
          // @ts-ignore
          chrome.tabs.create({ url: chrome.runtime.getURL("index.html") })
        }
      >
        Открыть в новой вкладке
      </button>
    </div>
  );
}
