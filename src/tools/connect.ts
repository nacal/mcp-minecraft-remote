import { pathfinder } from 'mineflayer-pathfinder'
import { z } from 'zod'
import {
  botState,
  createBot,
  server,
  updateConnectionInfo,
  updateConnectionState,
} from '../server.js'
import { ToolResponse } from '../types.js'
import {
  createAlreadyConnectedResponse,
  createErrorResponse,
  createNotConnectedResponse,
  createSuccessResponse,
} from '../utils/error-handler.js'

// Login/connection tool
export function registerConnectTools() {
  server.tool(
    'connectToServer',
    'Connect to a Minecraft server with the specified credentials',
    {
      host: z.string().describe('Minecraft server host address'),
      port: z
        .number()
        .optional()
        .default(25565)
        .describe('Minecraft server port'),
      username: z.string().describe('Minecraft username'),
      password: z
        .string()
        .optional()
        .describe('Minecraft password (if using premium account)'),
      version: z.string().optional().describe('Minecraft version'),
    },
    async ({ host, port, username, password, version }) => {
      if (botState.isConnected && botState.bot) {
        return createAlreadyConnectedResponse()
      }

      try {
        updateConnectionInfo({
          host,
          port,
          username,
          version: version || 'auto',
        })

        // Bot connection options
        const options = {
          host,
          port,
          username,
          password,
          version,
        }

        // Create the bot
        const bot = createBot(options)

        // Add pathfinder plugin to the bot
        bot.loadPlugin(pathfinder)

        return new Promise<ToolResponse>((resolve) => {
          // When login is successful
          bot.once('spawn', () => {
            updateConnectionState(true, bot)
            resolve(
              createSuccessResponse(
                `Successfully connected to ${host}:${port} as ${username}`
              )
            )
          })

          // When an error occurs
          bot.once('error', (err) => {
            updateConnectionState(false, null)
            resolve(createErrorResponse(err))
          })

          // Timeout handling (if connection is not established after 10 seconds)
          setTimeout(() => {
            if (!botState.isConnected) {
              updateConnectionState(false, null)
              resolve(
                createSuccessResponse('Connection timed out after 10 seconds')
              )
            }
          }, 10000)
        })
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )

  // Disconnection tool
  server.tool(
    'disconnectFromServer',
    'Disconnect from the Minecraft server',
    {},
    async () => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        botState.bot.quit()
        updateConnectionState(false, null)
        return createSuccessResponse(
          'Successfully disconnected from the server.'
        )
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )
}
