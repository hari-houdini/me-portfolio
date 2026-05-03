import Reveal from "@/app/components/common/reveal/reveal.component";
import SectionHeader from "@/app/components/common/section/header/header.component";
import styles from "./about.module.css";

export function About() {
  return (
    <section data-screen-label="02 About" className={styles.about}>
      <SectionHeader
        number="02 / About"
        title="A senior engineer who treats interfaces as cinema."
        eyebrow="The engineer behind the pixel"
      />
      <div className={styles["about-grid"]}>
        <Reveal className={styles["about-paragraphs"]}>
          <p>
            I&rsquo;ve spent the last <em>seven years</em> shipping interfaces
            for products that ask for more than buttons and forms — flagship
            marketing sites, data tools, real-time editors, and the kind of
            internal apps senior leaders demo on stage.
          </p>
          <span className={styles.pull}>
            Performance is a feature. Restraint is a craft.
          </span>
          <p>
            My work lives at the seam where engineering and motion design meet:
            shaders that don&rsquo;t hurt time-to-interactive, choreography you
            feel before you notice, and accessible frontends that pass{" "}
            <em>WCAG&nbsp;AAA</em> without looking like they were built for a
            checklist.
          </p>
          <p>
            I write production-grade React, TypeScript and WebGL. I read every
            PR like it&rsquo;ll be on the front page tomorrow.
          </p>
        </Reveal>
        <Reveal delay={1} className={styles["about-stats"]}>
          <div className={styles["about-stat"]}>
            <div className={styles.v}>7+</div>
            <div className={styles.l}>Years shipping</div>
          </div>
          <div className={styles["about-stat"]}>
            <div className={styles.v}>38</div>
            <div className={styles.l}>Production systems</div>
          </div>
          <div className={styles["about-stat"]}>
            <div className={styles.v}>11</div>
            <div className={styles.l}>Awwwards / FWA</div>
          </div>
          <div className={styles["about-stat"]}>
            <div className={styles.v}>~94</div>
            <div className={styles.l}>Avg. Lighthouse</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
