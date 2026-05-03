import styles from "./status.module.css";
import type { StatusProps } from "./status.schema";

export default function Status({ text }: StatusProps) {
  return (
    <div className={styles["status-pill"]}>
      <span className={styles["status-dot"]} />
      <span>{text}</span>
    </div>
  );
}