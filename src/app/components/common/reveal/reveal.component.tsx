"use client";

import { useEffect, useRef } from "react";
import { TYPED } from "@/app/utils/typed/mod";
import styles from "./reveal.module.css";
import type { RevealProps } from "./reveal.schema";

export default function Reveal({
  children,
  delay = 0,
  className = "",
  as: As = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (TYPED.isNullish(el)) return;

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add(styles.in);
            io.unobserve(el);
          }
        }),
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <As
      ref={ref}
      className={`${styles.reveal} ${delay ? `reveal-delay-${delay}` : ""} ${className}`}
    >
      {children}
    </As>
  );
}
