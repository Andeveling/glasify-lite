import { tool } from "ai"
import { z } from "zod"

export const mockTool = tool({
  description: "Returns a mock response for testing",
  inputSchema: z.object({
    message: z.string().describe("The message to echo back"),
  }),
  execute: async ({ message }) => {
    return { echo: message, timestamp: Date.now() }
  },
})

export type MockToolInvocation = {
  input: { message: string }
  output: { echo: string; timestamp: number }
  state: "input-available" | "output-available"
}
