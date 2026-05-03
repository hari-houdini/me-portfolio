import type { IconType } from "react-icons";
import { z } from "zod";

export const BentoCardSchema = z.object({
  name: z.string(),
  description: z.string(),
  href: z.string(),
  icon: z.custom<IconType>().optional(),
  header: z.custom<React.ElementType>().optional(),
  colSpan: z.number().optional(),
});

export type BentoCardProps = z.infer<typeof BentoCardSchema>;
