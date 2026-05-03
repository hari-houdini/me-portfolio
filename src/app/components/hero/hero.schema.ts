import { z } from "zod";

export const HeroSectionSchema = z.object({
  jobTitle: z.string(),
  tagline: z.string(),
  imageUrl: z.url(),
  since: z.string(),
  location: z.string(),
  date: z.string(),
});

export type HeroProps = z.infer<typeof HeroSectionSchema>;
