/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
import { useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BlogsControllerProps } from "./blogs.schema";

export default function useBlogsController({
  duration,
  blogs,
}: BlogsControllerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse position for magnetic effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Parallax transforms
  const numberX = useTransform(x, [-200, 200], [-20, 20]);
  const numberY = useTransform(y, [-200, 200], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % blogs.length);
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + blogs.length) % blogs.length);
  };

  useEffect(
    function blogTimerFn() {
      const timer = window.setInterval(goNext, duration);
      return () => window.clearInterval(timer);
    },
    [duration],
  );

  const current = useMemo(() => blogs[activeIndex], [activeIndex, blogs]);
  const paddedIndex = useMemo(
    () => String(activeIndex + 1).padStart(2, "0"),
    [activeIndex],
  );
  const progressHeight = useMemo(
    () => ((activeIndex + 1) / blogs.length) * 100,
    [activeIndex, blogs],
  );

  return {
    x,
    y,
    numberX,
    numberY,
    handleMouseMove,
    goNext,
    goPrev,
    current,
    activeIndex,
    paddedIndex,
    progressHeight,
  };
}
