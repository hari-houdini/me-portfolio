import { z } from "zod";

export const BentoGridSchema = z.object({
  className: z.string().optional(),
  children: z.custom<React.ReactNode>(),
});

export type BentoGridProps = z.infer<typeof BentoGridSchema>;
