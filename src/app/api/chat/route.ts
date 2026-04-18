import {
  convertToModelMessages,
  ToolLoopAgent,
  tool,
  type UIMessage,
  createIdGenerator,
} from "ai";
import { minimax } from "vercel-minimax-ai-provider";
import { z } from "zod";
import { loadChat, saveChat, deleteChat } from "./_util/chat-store";

export const maxDuration = 30;

const mockTool = tool({
  description: "Returns a mock response for testing",
  inputSchema: z.object({
    message: z.string().describe("The message to echo back"),
  }),
  execute: async ({ message }) => {
    return { echo: message, timestamp: Date.now() };
  },
});

export async function POST(request: Request) {
  const body = await request.json();

  const {
    messages,
    id,
    trigger,
  }: {
    id: string;
    trigger: string;
    messages: UIMessage[];
  } = body;

  const agent = new ToolLoopAgent({
    model: minimax("MiniMax-M2.7"),
    instructions:
      "Eres un asistente amigable que ayuda al usuario, cuando te pida que uses la tool de mock usala.",
    tools: {
      mock: mockTool,
    },
  });

  const result = await agent.stream({
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: createIdGenerator({
      prefix: "msg",
      size: 16,
    }),
    onFinish: ({ messages }) => {
      saveChat({ chatId: id, messages });
    },
  });
}
