"use client";

import useBlogsController from "./blogs.controller";
import styles from "./blogs.module.css";
import type { BlogsProps } from "./blogs.schema";
import BottomTicker from "./content/bottom-ticker/bottom-ticker.component";
import BlogContent from "./content/content.component";
import BlogIndex from "./index/index.component";

export default function Blogs({ title, blogs, duration = 6000 }: BlogsProps) {
  const {
    numberX,
    numberY,
    activeIndex,
    paddedIndex,
    progressHeight,
    goNext,
    goPrev,
    current,
  } = useBlogsController({
    duration,
    blogs,
  });

  /**
   * @TODO: Make it mobile responsive and adjust styling
   */
  return (
    <section className={styles.blogs}>
      <BlogIndex x={numberX} y={numberY} paddedIndex={paddedIndex} />
      <BlogContent
        sectionTitle={title}
        next={goNext}
        prev={goPrev}
        activeIndex={activeIndex}
        progress={progressHeight}
        {...current}
      />
      <BottomTicker descriptions={blogs.map((blog) => blog.title)} />
    </section>
  );
}
