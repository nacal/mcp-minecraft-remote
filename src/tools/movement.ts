import pkg from 'mineflayer-pathfinder';
const { Movements, goals } = pkg;
import { z } from 'zod'
import { botState, server } from '../server.js'
import { ToolResponse } from '../types.js'
import {
  createErrorResponse,
  createNotConnectedResponse,
  createSuccessResponse,
} from '../utils/error-handler.js'

// Function to register movement-related tools
export function registerMovementTools() {
  // Tool to get current position information
  server.tool(
    'getPosition',
    'Get the current position of the player in the Minecraft world',
    {},
    async () => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        const position = botState.bot.entity.position
        return createSuccessResponse(
          `Current position: X=${position.x.toFixed(2)}, Y=${position.y.toFixed(
            2
          )}, Z=${position.z.toFixed(2)}`
        )
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )

  // Tool to move to a specified location
  server.tool(
    'moveTo',
    'Move the player to a specific location',
    {
      x: z.number().describe('X coordinate'),
      y: z.number().describe('Y coordinate'),
      z: z.number().describe('Z coordinate'),
    },
    async ({ x, y, z }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        // Set pathfinder Movements
        const movements = new Movements(botState.bot)
        botState.bot.pathfinder.setMovements(movements)

        // Set target position
        const goal = new goals.GoalBlock(x, y, z)

        return new Promise<ToolResponse>((resolve) => {
          // Start movement
          botState
            .bot!.pathfinder.goto(goal)
            .then(() => {
              resolve(
                createSuccessResponse(
                  `Successfully moved to X=${x}, Y=${y}, Z=${z}`
                )
              )
            })
            .catch((err) => {
              resolve(createErrorResponse(err))
            })

          // Timeout handling (if still moving after 1 minute)
          setTimeout(() => {
            resolve(
              createSuccessResponse(
                'Movement is taking longer than expected. Still trying to reach the destination...'
              )
            )
          }, 60000)
        })
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )
}
