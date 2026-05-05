import { motion } from "motion/react";
import styles from "./bottom-ticker.module.css";
import type { BottomTickerProps } from "./bottom-ticker.schema";

export default function BottomTicker({ descriptions }: BottomTickerProps) {
  return (
    <div className={styles["ticker-wrapper"]}>
      <motion.div
        className={styles["ticker-content"]}
        animate={{ x: [0, -1000] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(10)].map((_, i) => (
          <span key={`${descriptions[0]}-${i}`} className="ticker-item">
            {descriptions.join(" • ")} •
          </span>
        ))}
      </motion.div>
    </div>
  );
}
