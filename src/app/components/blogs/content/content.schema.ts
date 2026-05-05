import { z } from "zod";

export const BlogContentSchema = z.object({
  activeIndex: z.number(),
  title: z.string(),
  subtitle: z.string().nullable(),
  tag: z.string(),
  description: z.string(),
  sectionTitle: z.string(),
  progress: z.number(),
  next: z.function(),
  prev: z.function(),
});

export type BlogContentProps = z.infer<typeof BlogContentSchema>;