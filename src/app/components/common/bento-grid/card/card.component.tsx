import cx from "classix";
import Link from "next/link";
import styles from "./card.module.css";
import type { BentoCardProps } from "./card.schema";

export default function BentoCard({
  icon: Icon,
  header: Header,
  name,
  description,
  colSpan = 1,
  href,
}: BentoCardProps) {
  return (
    <div className={cx(styles["bento-card"], styles[`bento-span-${colSpan}`])}>
      <div className={styles["bento-card-info"]}>
        {Icon && <Icon className={styles["bento-card-icon"]} size={36} />}
        {Header && <Header className={styles["bento-card-icon"]} />}

        <h3 className={styles["bento-card-title"]}>{name}</h3>
        <p className={styles["bento-card-description"]}>{description}</p>
      </div>
      <div className={styles["bento-card-overlay"]}>
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        />
      </div>
    </div>
  );
}
