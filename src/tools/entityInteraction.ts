import { z } from 'zod'
import { botState, server } from '../server'
import { ToolResponse } from '../types'
import {
  createErrorResponse,
  createNotConnectedResponse,
  createSuccessResponse,
} from '../utils/error-handler'

// Function to register entity interaction tools
export function registerEntityInteractionTools() {
  // Tool to get all nearby entities
  server.tool(
    'getNearbyEntities',
    'Get a list of all entities nearby',
    {
      range: z
        .number()
        .optional()
        .default(10)
        .describe('Range in blocks to search for entities'),
    },
    async ({ range }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        // Get all entities within range
        const nearbyEntities = Object.values(botState.bot.entities).filter(
          (entity) => {
            if (!entity || !entity.position || !botState.bot) return false
            const distance = entity.position.distanceTo(
              botState.bot.entity.position
            )
            return distance <= range && entity.id !== botState.bot.entity.id
          }
        )

        if (nearbyEntities.length === 0) {
          return createSuccessResponse('No entities found nearby.')
        }

        // Group entities by type
        const groupedEntities: Record<string, any[]> = {}
        nearbyEntities.forEach((entity) => {
          const type = String(entity.type || 'unknown')
          if (!groupedEntities[type]) {
            groupedEntities[type] = []
          }
          groupedEntities[type].push(entity)
        })

        // Format the response
        let response = `Entities within ${range} blocks:\n\n`

        for (const [type, entities] of Object.entries(groupedEntities)) {
          response += `${type.toUpperCase()} (${entities.length}):\n`
          entities.forEach((entity: any) => {
            const distance = entity.position
              .distanceTo(botState.bot!.entity.position)
              .toFixed(1)
            const name =
              entity.name ||
              entity.username ||
              entity.displayName ||
              `Entity #${entity.id}`
            response += `- ${name} (${distance} blocks away, ID: ${entity.id})\n`
          })
          response += '\n'
        }

        return createSuccessResponse(response)
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )

  // Tool to attack an entity
  server.tool(
    'attackEntity',
    'Attack a specific entity',
    {
      entityId: z.number().describe('ID of the entity to attack'),
    },
    async ({ entityId }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        // Find the entity by ID
        const entity = botState.bot.entities[entityId]
        if (!entity) {
          return createSuccessResponse(`Entity with ID ${entityId} not found.`)
        }

        // Attack the entity
        await botState.bot.attack(entity)
        return createSuccessResponse(
          `Attacked entity: ${
            entity.name || entity.username || 'Unknown entity'
          } (ID: ${entityId})`
        )
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )

  // Tool to use held item on an entity
  server.tool(
    'useOnEntity',
    'Use held item on a specific entity',
    {
      entityId: z.number().describe('ID of the entity to use item on'),
    },
    async ({ entityId }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        // Find the entity by ID
        const entity = botState.bot.entities[entityId]
        if (!entity) {
          return createSuccessResponse(`Entity with ID ${entityId} not found.`)
        }

        // Use current item on the entity
        await botState.bot.useOn(entity)
        const heldItem = botState.bot.heldItem
          ? botState.bot.heldItem.name
          : 'hand'

        return createSuccessResponse(
          `Used ${heldItem} on entity: ${
            entity.name || entity.username || 'Unknown entity'
          } (ID: ${entityId})`
        )
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )

  // Tool to follow an entity
  server.tool(
    'followEntity',
    'Follow a specific entity',
    {
      entityId: z.number().describe('ID of the entity to follow'),
      distance: z
        .number()
        .optional()
        .default(2)
        .describe('Distance to maintain while following'),
    },
    async ({ entityId, distance }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        // Find the entity by ID
        const entity = botState.bot.entities[entityId]
        if (!entity) {
          return createSuccessResponse(`Entity with ID ${entityId} not found.`)
        }

        // Start following the entity
        return new Promise<ToolResponse>((resolve) => {
          // Import pathfinder goals
          const { goals } = require('mineflayer-pathfinder')

          // Start following the entity
          botState.bot!.pathfinder.setGoal(
            new goals.GoalFollow(entity, distance)
          )

          resolve(
            createSuccessResponse(
              `Following entity: ${
                entity.name || entity.username || 'Unknown entity'
              } (ID: ${entityId}) with distance of ${distance} blocks`
            )
          )
        })
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )
}
