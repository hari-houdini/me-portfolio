import { z } from "zod";

export const BottomTickerSchema = z.object({
  descriptions: z.array(z.string()),
});

export type BottomTickerProps = z.infer<typeof BottomTickerSchema>;
