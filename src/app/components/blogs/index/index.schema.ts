import type { MotionValue } from "motion/react";
import { z } from "zod";

export const blogIndexSchema = z.object({
  x: z.custom<MotionValue<number>>(),
  y: z.custom<MotionValue<number>>(),
  paddedIndex: z.string(),
});

export type BlogIndexProps = z.infer<typeof blogIndexSchema>;
