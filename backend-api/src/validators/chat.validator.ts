import { z } from 'zod';

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system', 'data']),
  content: z.string(),
});

export const sendChatSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, 'Messages array cannot be empty'),
  conversationId: z.string().optional().nullable(),
});
