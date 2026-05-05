import { motion } from "motion/react";
import styles from "./left-column.module.css";
import type { LeftColumnProps } from "./left-column.schema";

export default function LeftColumn({ title, progressHeight }: LeftColumnProps) {
  return (
    <div className={styles.sidebar}>
      <motion.span
        className={styles["sidebar-title"]}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {title}
      </motion.span>

      <div className={styles["progress-track"]}>
        <motion.div
          className={styles["progress-fill"]}
          animate={{ height: progressHeight }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
