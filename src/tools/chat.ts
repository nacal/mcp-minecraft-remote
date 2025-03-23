import { z } from 'zod'
import { botState, server } from '../server.js'
import {
  createErrorResponse,
  createNotConnectedResponse,
  createSuccessResponse,
} from '../utils/error-handler.js'

// Function to register chat-related tools
export function registerChatTools() {
  // Tool for sending chat messages
  server.tool(
    'sendChat',
    'Send a chat message to the Minecraft server',
    {
      message: z.string().describe('Message to send to the server'),
    },
    async ({ message }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        botState.bot.chat(message)
        return createSuccessResponse(`Message sent: ${message}`)
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )
}
