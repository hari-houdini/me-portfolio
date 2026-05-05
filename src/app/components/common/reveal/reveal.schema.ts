import { z } from "zod";

export const RevealSchema = z.object({
  delay: z.number().optional(),
  className: z.string().optional(),
  as: z.custom<React.ElementType>().optional(),
  children: z.custom<React.ReactNode>(),
});

export type RevealProps = z.infer<typeof RevealSchema>;
