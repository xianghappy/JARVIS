import { z } from "zod";

export const StreamingItemSchema = z.object({
  content: z.string().optional(),
  reasoningContent: z.string().optional(),
});

export type StreamingItem = z.infer<typeof StreamingItemSchema>;
