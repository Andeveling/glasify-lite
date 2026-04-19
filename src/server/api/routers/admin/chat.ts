import { z } from "zod";

import { createChat, deleteChat, listChats, loadChat } from "@/lib/chat/chat-store";
import {
	adminProcedure,
	createTRPCRouter,
} from "@/server/api/trpc";

const chatIdSchema = z.object({
  id: z.string().min(1, { message: "ID de chat requerido" }),
});

export const chatRouter = createTRPCRouter({
  create: adminProcedure.mutation(async () => {
    const id = await createChat();
    return { id };
  }),

  list: adminProcedure.query(async () => {
    const chats = await listChats();
    return chats;
  }),

  byId: adminProcedure.input(chatIdSchema).query(async ({ input }) => {
    const chat = await loadChat(input.id);
    return chat;
  }),

  delete: adminProcedure.input(chatIdSchema).mutation(async ({ input }) => {
    const result = await deleteChat(input.id);
    return { success: result };
  }),
});
