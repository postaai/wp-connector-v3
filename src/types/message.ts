import { z } from "zod";

export const MessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    userId: z.string(),
    orgId: z.string(),
    content: z.string(),
    timestamp: z.number().default(() => Date.now()),
  }),
  z.object({
    type: z.literal("audio"),
    userId: z.string(),
    orgId: z.string(),
    content: z.instanceof(Buffer),
    timestamp: z.number().default(() => Date.now()),
  }),
]);

export type BotMessage = z.infer<typeof MessageSchema>;

export const TypingPayloadSchema = z.object({
  userId: z.string(),
  orgId: z.string(),
  message: z.string(),
});

export type TypingPayload = z.infer<typeof TypingPayloadSchema>;
