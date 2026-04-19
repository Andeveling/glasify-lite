import { z } from "zod";

import { adminProcedure, createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { deleteChat, listChats } from "@/lib/chat/chat-store";

const chatIdSchema = z.object({
  id: z.string().min(1, { message: "ID de chat requerido" }),
});

export const chatRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    const chats = await listChats();
    return chats;
  }),

  delete: adminProcedure.input(chatIdSchema).mutation(async ({ input }) => {
    const result = await deleteChat(input.id);
    return { success: result };
  }),
});
