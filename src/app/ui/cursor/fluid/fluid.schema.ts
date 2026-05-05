import { z } from "zod";

export const FluidCursorSchema = z.object({
  simResolution: z.number().optional(),
  dyeResolution: z.number().optional(),
  densityDissipation: z.number().optional(),
  velocityDissipation: z.number().optional(),
  pressure: z.number().optional(),
  pressureIterations: z.number().optional(),
  curl: z.number().optional(),
  splatRadius: z.number().optional(),
  splatForce: z.number().optional(),
  shading: z.boolean().optional(),
  colorUpdateSpeed: z.number().optional(),
  className: z.string().optional(),
});

export type FluidCursorProps = z.infer<typeof FluidCursorSchema>;
