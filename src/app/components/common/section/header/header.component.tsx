import Reveal from "@/app/components/common/reveal/reveal.component";
import styles from "./header.module.css";
import type { SectionHeaderProps } from "./header.schema";

export default function SectionHeader({
  number,
  title,
  eyebrow,
}: SectionHeaderProps) {
  return (
    <div className={styles["section-head"]}>
      <div>
        <span className={styles.num}>{number}</span>
        <Reveal as="div" className={styles.eyebrow}>
          {eyebrow}
        </Reveal>
      </div>
      <Reveal as="h2" className={styles["h-section"]}>
        {title}
      </Reveal>
    </div>
  );
}
