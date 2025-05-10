import { z } from "zod";

export const MessageSchema = z.object({
  userId: z.string(),
  orgId: z.string(),
  content: z.string(),
  contactName: z.string().optional(),
  timestamp: z.number().default(() => Date.now()),
});

export type Message = z.infer<typeof MessageSchema>;

export type BotMessage = z.infer<typeof MessageSchema>;

export const TypingPayloadSchema = z.object({
  userId: z.string(),
  orgId: z.string(),
  message: z.string(),
});

export type TypingPayload = z.infer<typeof TypingPayloadSchema>;
