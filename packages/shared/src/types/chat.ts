import { z } from "zod";

export const chatMessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
  createdAt: z.string().datetime(),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatConversationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().optional(),
  createdAt: z.string().datetime(),
});
export type ChatConversation = z.infer<typeof chatConversationSchema>;

export const sendChatMessageSchema = z.object({
  conversationId: z.string().optional(),
  content: z.string().min(1).max(8000),
});
export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
