import BentoGrid from "@/app/components/common/bento-grid/bento-grid.component";
import BentoCard from "@/app/components/common/bento-grid/card/card.component";
import SectionHeader from "@/app/components/common/section/header/header.component";
import Status from "@/app/components/common/status/status.component";
import styles from "./snapshot.module.css";

const items = [
    {
        id: 1,
        glyph: () => (<Status text="Building" />),
        name: "Work",
        desc: "A WebGPU-backed dashboard for a climate-data startup. Volumetric clouds rendered live from satellite tiles.",
        span: 4,
    },
    {
        id: 2,
        glyph: () => (<Status text="Reading" />),
        name: "Reading",
        desc: "The Architecture of Concurrency, Verlyn Klinkenborg’s Several Short Sentences About Writing, and an embarrassing pile of Three.js release notes.",
        span: 4,
    },
    {
        id: 3,
        glyph: () => (<Status text="Open to" />),
        name: "Connect",
        desc: "Senior IC roles. Embedded engagements with design-led studios. The occasional speaking slot if the room is small and curious.",
        span: 4 ,
    },
];

export default function Snapshot() {
  return (
    <section data-screen-label="04 Snapshot" className={styles.snapshot}>
      <SectionHeader
        eyebrow="Currently"
        title="A snapshot of this season"
        number="04"
      />
      {/* <div className={styles["cap-grid"]}>
        {items.map((Item, i) => (
          <Reveal
            key={Item.id}
            className={cx(styles["cap-item"], styles[`cap-${Item.span}`])}
            delay={(i % 3) + 1}
          >
            <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
            <span className={styles.glyph}>
              <Item.glyph />
            </span>
            <span className={styles.name}>{Item.name}</span>
            <span className={styles.desc}>{Item.desc}</span>
          </Reveal>
        ))}
      </div> */}
      <BentoGrid className={styles["cap-grid"]}>
        {items.map((item) => (
          // <Reveal key={item.id} delay={(index % 3) + 1}>
          <BentoCard
            key={item.id}
            header={item.glyph}
            colSpan={item.span}
            name={item.name}
            description={item.desc}
            href="#"
          />
          // {/* </Reveal> */}
        ))}
      </BentoGrid>
    </section>
  );
}
