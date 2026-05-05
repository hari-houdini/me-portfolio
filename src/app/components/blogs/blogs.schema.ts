import { z } from "zod";

export const BlogSchema = z.object({
  title: z.string(),
  subtitle: z.string().nullable(),
  tag: z.string(),
  description: z.string(),
});

export type Blog= z.infer<typeof BlogSchema>;

export const BlogsSchema = z.object({
  title: z.string(),
  /**
   * @TODO : Replace this with actual blog content
   */
  blogs: z.array(BlogSchema),
  duration: z.number().optional(),
});

export type BlogsProps = z.infer<typeof BlogsSchema>;

export const BlogsControllerSchema = z.object({
  duration: z.number().optional(),
  blogs: z.array(BlogSchema),
});

export type BlogsControllerProps = z.infer<typeof BlogsControllerSchema>;