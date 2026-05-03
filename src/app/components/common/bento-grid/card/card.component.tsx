import styles from "./card.module.css";
import type { BentoCardProps } from "./card.schema";


export function BentoCard({
  icon: Icon,
  name,
  description,
  cta,
  href,
}: BentoCardProps) {
  return (
    <div className={styles["bento-card"]}
  >
    {/* <slot name="background" /> */}

    <div
      className={styles["bento-card-info"]}
    >
      <Icon
          className={styles["bento-card-icon"]}
        />

      <h3 className={styles["bento-card-title"]}>
        { name }
      </h3>
      <p className={styles["bento-card-description"]}>{description }</p>
    </div>

    <div
      className={styles["bento-card-cta-container"]}
    >
      <a
        href={href}
        className={styles["bento-card-cta"]}
      >
        { cta } →
      </a>
    </div>
    <div
      className={styles["bento-card-overlay"]}
    />
  </div>
  )
}