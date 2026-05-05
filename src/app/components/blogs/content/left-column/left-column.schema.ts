import { z } from "zod";

export const LeftColumnSchema = z.object({
  title: z.string(),
  progressHeight: z.number(),
});

export type LeftColumnProps = z.infer<typeof LeftColumnSchema>;
