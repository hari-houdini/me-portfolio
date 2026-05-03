import cx from "classix";
import { About } from "./components/about/about.component";
import Hero from "./components/hero/hero.component";
import Snapshot from "./components/snapshot/snapshot.component";
import TechStack from "./components/tech-stack/tech-stack.component";
import styles from "./page.module.css";

export default function App() {
  return (
    <div
      className={cx(styles.main, styles["bg-vignette"], styles["smooth-wrap"])}
    >
      <Hero
        jobTitle={"Senior Web Engineer"}
        tagline={`Frontend roots.\n Full-stack reach.`}
        imageUrl={""}
        since={""}
        location={""}
        date={""}
      />
      <About />
      <TechStack />
      <Snapshot />
    </div>
  );
}
