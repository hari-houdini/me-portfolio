import { z } from "zod";

export const statusSchema = z.object({
  text: z.string(),
});

export type StatusProps = z.infer<typeof statusSchema>;
