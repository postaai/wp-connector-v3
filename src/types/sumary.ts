import { z } from "zod";

export const SumarySchema = z.object({
  orgId: z.string(),
  userId: z.string(),
  responseObject: z.record(z.any()),
  finishMessage: z.string().optional(),
  text: z.string(),
});

export type Sumary = z.infer<typeof SumarySchema>;
