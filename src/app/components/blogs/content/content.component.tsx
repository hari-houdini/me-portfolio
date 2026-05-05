import { AnimatePresence, motion } from "motion/react";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";
import { TYPED } from "@/utils/typed/mod";
import styles from "./content.module.css";
import type { BlogContentProps } from "./content.schema";
import LeftColumn from "./left-column/left-column.component";

export default function BlogContent({
  activeIndex,
  sectionTitle,
  title,
  subtitle,
  progress,
  tag,
  description,
  next,
  prev,
}: BlogContentProps) {
  return (
    <div className={styles["main-layout"]}>
      <LeftColumn progressHeight={progress} title={sectionTitle} />

      {/* Center content */}
      <div className={styles["content-area"]}>
        {/* Tag */}
        <AnimatePresence mode="wait">
          {TYPED.isNonNullable(tag) && (
            <motion.div
              key={activeIndex}
              className={styles["badge-wrapper"]}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <span className={styles.badge}>
                <span className={styles["badge-dot"]} />
                {tag}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Description */}
        <div className={styles["quote-container"]}>
          <AnimatePresence mode="wait">
            {TYPED.isNonNullable(description) && (
              <motion.blockquote
                key={activeIndex}
                className={styles["quote-text"]}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {description.split(" ").map((word, i) => (
                  <motion.span
                    key={`${Math.random()}`}
                    className={styles["quote-word"]}
                    variants={{
                      hidden: { opacity: 0, y: 20, rotateX: 90 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        transition: {
                          duration: 0.5,
                          delay: i * 0.05,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                      exit: {
                        opacity: 0,
                        y: -10,
                        transition: { duration: 0.2, delay: i * 0.02 },
                      },
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.blockquote>
            )}
          </AnimatePresence>
        </div>

        {/* title */}
        <div className={styles["footer-row"]}>
          <AnimatePresence mode="wait">
            {TYPED.isNonNullable(title) && (
              <motion.div
                key={activeIndex}
                className={styles["author-info"]}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <motion.div
                  className={styles["accent-line"]}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  style={{ originX: 0 }}
                />
                <div>
                  <p className="author-name">{title}</p>
                  {TYPED.isNonNullable(subtitle) && (
                    <p className="author-role">{subtitle}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className={styles["nav-controls"]}>
            <motion.button
              className={styles["nav-btn"]}
              whileTap={{ scale: 0.95 }}
              onClick={prev}
            >
              <IoIosArrowDropleft />
            </motion.button>

            <motion.button
              className={styles["nav-btn"]}
              whileTap={{ scale: 0.95 }}
              onClick={next}
            >
              <IoIosArrowDropright />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
