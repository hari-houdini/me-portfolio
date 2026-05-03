import styles from "./bento-grid.module.css";
import type { BentoGridProps } from "./bento-grid.schema";

export default function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={`${styles["bento-grid"]} ${className}`}>
      {children}
    </div>
  );
}