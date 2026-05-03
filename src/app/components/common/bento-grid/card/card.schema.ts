import type { IconType } from "react-icons";
import { z } from "zod";

export const BentoCardSchema = z.object({
  name: z.string(),
  description: z.string(),
  href: z.string(),
  cta: z.string(),
  icon: z.custom<IconType>(),
});

export type BentoCardProps = z.infer<typeof BentoCardSchema>;
