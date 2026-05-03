// import cx from "classix";
import { AiFillLayout } from "react-icons/ai";
import { CgDesignmodo, CgPerformance } from "react-icons/cg";
import { DiReact } from "react-icons/di";
import { FaAccessibleIcon } from "react-icons/fa";
import { SiGsap, SiTypescript } from "react-icons/si";
import { TbBrandThreejs } from "react-icons/tb";
import BentoGrid from "../common/bento-grid/bento-grid.component";
import BentoCard from "../common/bento-grid/card/card.component";
// import Reveal from "@/app/components/common/reveal/reveal.component";
import SectionHeader from "../common/section/header/header.component";
import styles from "./tech-stack.module.css";

const items = [
  {
    id: 1,
    span: 5,
    glyph: TbBrandThreejs,
    name: "WebGL & Shaders",
    desc: "Three.js, R3F, GLSL, custom post-processing pipelines, and instanced geometry that ships at 60fps on a Pro-Display.",
  },
  {
    id: 2,
    span: 4,
    glyph: DiReact,
    name: "React Architecture",
    desc: "Server components, suspense boundaries, query layers, design-system level state.",
  },
  {
    id: 3,
    span: 3,
    glyph: SiGsap,
    name: "Motion",
    desc: "GSAP, Framer Motion, scroll choreography, micro-interactions.",
  },
  {
    id: 4,
    span: 4,
    glyph: AiFillLayout,
    name: "Type & Layout",
    desc: "Editorial systems, variable fonts, OpenType features, fluid grids.",
  },
  {
    id: 5,
    span: 4,
    glyph: FaAccessibleIcon,
    name: "Accessibility",
    desc: "WCAG AAA defaults, keyboard parity, screen-reader narratives, respect for reduced-motion.",
  },
  {
    id: 6,
    span: 4,
    glyph: CgPerformance,
    name: "Performance",
    desc: "Core Web Vitals as a budget. Bundle audits. Critical-path obsession.",
  },
  {
    id: 7,
    span: 6,
    glyph: SiTypescript,
    name: "Stack",
    desc: "TypeScript · React · Next.js · Three.js · GSAP · Lenis · Framer Motion · Tailwind · Postgres · tRPC · Cloudflare.",
  },
  {
    id: 8,
    span: 6,
    glyph: CgDesignmodo,
    name: "Design partnership",
    desc: "I work upstream of design — co-authoring systems, prototyping in code, translating between intent and implementation.",
  },
];

export default function TechStack() {
  return (
    <section
      data-screen-label="03 Capabilities"
      className={styles["tech-stack"]}
    >
      <SectionHeader
        eyebrow="What I work with"
        title="A focused stack, deeply."
        number="03"
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
            icon={item.glyph}
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
