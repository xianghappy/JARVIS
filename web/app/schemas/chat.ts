import { z } from "zod";

export const ChatMessageRoleSchema = z.enum(["user", "assistant"]);

export const ChatMessageReadSchema = z.object({
  id: z.string(),
  role: ChatMessageRoleSchema,
  content: z.string(),
  reasoningContent: z.string().optional(),
});

export type ChatMessageRead = z.infer<typeof ChatMessageReadSchema>;
export type ChatMessageRole = z.infer<typeof ChatMessageRoleSchema>;
