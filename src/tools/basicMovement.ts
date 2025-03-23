import { Vec3 } from 'vec3'
import { z } from 'zod'
import { botState, server } from '../server'
import {
  createErrorResponse,
  createNotConnectedResponse,
  createSuccessResponse,
} from '../utils/error-handler'

// Define control state type explicitly to match what mineflayer expects
type ControlState =
  | 'forward'
  | 'back'
  | 'left'
  | 'right'
  | 'jump'
  | 'sprint'
  | 'sneak'

// Function to register basic movement tools
export function registerBasicMovementTools() {
  // Tool for basic movement control
  server.tool(
    'moveControl',
    'Control the player with basic movement commands',
    {
      action: z
        .enum([
          'forward',
          'back',
          'left',
          'right',
          'jump',
          'sprint',
          'sneak',
          'stop',
        ] as const)
        .describe('Movement action to perform'),
      duration: z
        .number()
        .optional()
        .default(1)
        .describe('Duration to perform the action in seconds'),
    },
    async ({ action, duration }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        // Convert duration to milliseconds
        const durationMs = duration * 1000

        // Execute the requested movement action
        if (action === 'stop') {
          // Stop all movement
          botState.bot.clearControlStates()
          return createSuccessResponse(`All movement stopped`)
        } else {
          // Handle movement actions
          // We know that the action is a valid control state at this point (not 'stop')
          const controlState = action as ControlState
          botState.bot.setControlState(controlState, true)

          // After specified duration, stop the action
          setTimeout(() => {
            if (botState.bot) {
              botState.bot.setControlState(controlState, false)
            }
          }, durationMs)

          return createSuccessResponse(
            `Performing action: ${action} for ${duration} seconds`
          )
        }
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )

  // Tool for looking in a direction
  server.tool(
    'lookAt',
    'Make the player look in a specific direction or at coordinates',
    {
      x: z.number().describe('X coordinate to look at'),
      y: z.number().describe('Y coordinate to look at'),
      z: z.number().describe('Z coordinate to look at'),
    },
    async ({ x, y, z }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        await botState.bot.lookAt(new Vec3(x, y, z))
        return createSuccessResponse(
          `Looking at coordinates: X=${x}, Y=${y}, Z=${z}`
        )
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )
}
