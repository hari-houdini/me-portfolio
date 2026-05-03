import z from "zod";

export const sectionHeaderSchema = z.object({
  number: z.string(),
  title: z.string(),
  eyebrow: z.string(),
});

export type SectionHeaderProps = z.infer<typeof sectionHeaderSchema>;
