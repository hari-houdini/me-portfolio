"use client";

import cx from "classix";
import Image from "next/image";
import { H } from "react-accessible-headings";
import Reveal from "@/app/components/common/reveal/reveal.component";
import Status from "@/app/components/common/status/status.component";
import styles from "./hero.module.css";
import type { HeroProps } from "./hero.schema";

export default function Hero({
  jobTitle,
  tagline,
  // imageUrl,
  // since,
  // location,
  // date,
}: HeroProps) {
  return (
    <section className={styles.hero} data-screen-label="01 Hero">
      <div className={styles["hero-portrait-wrap"]} data-reveal>
        <div className={styles["portrait-stack"]}>
          <Image
            className={cx(styles["portrait-img"], styles["portrait-bw"])}
            alt="Portrait placeholder"
            src="/background/above-the-fold-bw.jpg"
            loading="eager"
            width={1800}
            height={2700}
          />
          <Image
            className={cx(styles["portrait-img"], styles["portrait-color"])}
            alt=""
            src="/background/above-the-fold-colored.jpg"
            loading="eager"
            width={1800}
            height={2700}
          />
        </div>
      </div>

      <div className={styles["hero-grid"]}>
        <div className={styles["hero-meta-tl"]}>
          <Reveal>
            <Status text="Since · 1996" />
          </Reveal>
        </div>
        <div className={styles["hero-meta-tr"]}>
          <Reveal delay={1}>
            <div className={styles["mono-tag"]} style={{ marginTop: 6 }}>
              London / Hybrid
            </div>
          </Reveal>
        </div>

        <div className={styles["hero-meta-bl"]}>
          <Reveal delay={2}>
            <div className={styles["mono-tag"]}>{jobTitle}</div>
            <div
              className={styles.lede}
              style={{ marginTop: 14, maxWidth: "24ch" }}
            >
              {tagline}
            </div>
          </Reveal>
        </div>
        <div className={styles["hero-meta-br"]}>
          <Reveal delay={3}>
            <div className={styles["mono-tag"]}>Active</div>
            <div
              className={styles["mono-tag"]}
              style={{ marginTop: 6, color: "var(--fg)" }}
            >
              2018 — Present
            </div>
          </Reveal>
        </div>

        <H className={cx(styles["hero-name"], styles["h-display"])}>
          <Reveal as="span" className={styles.firstName}>
            Hariharasudhan
          </Reveal>
          <Reveal as="span" delay={1} className={styles.surname}>
            Shaktivel
          </Reveal>
        </H>
      </div>

      <div className={styles["scroll-cue"]}>
        <span>Scroll</span>
        <div className={styles["scroll-cue-line"]} />
      </div>
    </section>
  );
}
