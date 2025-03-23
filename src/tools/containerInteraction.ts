import { Vec3 } from 'vec3'
import { z } from 'zod'
import { botState, server } from '../server.js'
import { Container } from '../types.js'

import {
  createErrorResponse,
  createNotConnectedResponse,
  createSuccessResponse,
} from '../utils/error-handler.js'

// Function to register container interaction tools
export function registerContainerInteractionTools() {
  // Tool to open a container at coordinates
  server.tool(
    'openContainer',
    'Open a container (chest, furnace, etc.) at specific coordinates',
    {
      x: z.number().describe('X coordinate of the container'),
      y: z.number().describe('Y coordinate of the container'),
      z: z.number().describe('Z coordinate of the container'),
    },
    async ({ x, y, z }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        // Get the block at the coordinates
        const block = botState.bot.blockAt(new Vec3(x, y, z))

        if (!block) {
          return createSuccessResponse(
            `No block found at coordinates X=${x}, Y=${y}, Z=${z}`
          )
        }

        // Check if the block is a container
        if (
          !block.name.includes('chest') &&
          !block.name.includes('furnace') &&
          !block.name.includes('barrel') &&
          !block.name.includes('shulker') &&
          !block.name.includes('dispenser') &&
          !block.name.includes('dropper') &&
          !block.name.includes('hopper')
        ) {
          return createSuccessResponse(
            `Block at X=${x}, Y=${y}, Z=${z} is not a container (found: ${block.name})`
          )
        }

        // Open the container
        const container = await botState.bot.openContainer(block)

        // Store container reference as our Container type with withdraw/deposit methods
        botState.currentContainer = container as unknown as Container

        // Get container contents
        const items = container.slots
          .filter((item): item is NonNullable<typeof item> => item !== null)
          .map((item) => {
            if (!item) return null
            return {
              name: item.name,
              displayName: item.displayName || item.name,
              count: item.count || 1,
              slot: container.slots.indexOf(item),
            }
          })
          .filter((item) => item !== null)

        // Format the response
        let response = `Opened ${block.name} at X=${x}, Y=${y}, Z=${z}\n\n`

        if (items.length === 0) {
          response += 'Container is empty.'
        } else {
          response += `Container contains ${items.length} items:\n`
          items.forEach((item) => {
            response += `- ${item.displayName} (x${item.count}) in slot ${item.slot}\n`
          })
        }

        return createSuccessResponse(response)
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )

  // Tool to withdraw items from a container
  server.tool(
    'withdrawItem',
    'Take items from an open container',
    {
      itemName: z.string().describe('Name of the item to withdraw'),
      amount: z
        .number()
        .optional()
        .default(1)
        .describe('Amount of items to withdraw'),
    },
    async ({ itemName, amount }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        // Check if a container is open
        if (!botState.currentContainer) {
          return createSuccessResponse(
            'No container is currently open. Use openContainer first.'
          )
        }

        // Find the item in the container
        const container = botState.currentContainer
        const matchingItems = container.slots
          .filter((item): item is NonNullable<typeof item> =>
            Boolean(
              item !== null &&
                item.name &&
                item.name.toLowerCase() === itemName.toLowerCase()
            )
          )
          .map((item, slotIndex) => ({ item, slotIndex }))

        if (matchingItems.length === 0) {
          return createSuccessResponse(
            `Item "${itemName}" not found in the container.`
          )
        }

        // Calculate how many items to withdraw
        let remainingAmount = amount
        let withdrawnAmount = 0

        // Withdraw items from each matching slot until we have enough
        for (const { item, slotIndex } of matchingItems) {
          if (remainingAmount <= 0) break

          const amountFromThisSlot = Math.min(remainingAmount, item.count)
          // In mineflayer, withdraw takes itemType, metadata, count
          await container.withdraw(item.type, null, amountFromThisSlot)

          remainingAmount -= amountFromThisSlot
          withdrawnAmount += amountFromThisSlot
        }

        return createSuccessResponse(
          `Withdrew ${withdrawnAmount} x ${itemName} from the container.`
        )
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )

  // Tool to deposit items to a container
  server.tool(
    'depositItem',
    'Put items into an open container',
    {
      itemName: z.string().describe('Name of the item to deposit'),
      amount: z
        .number()
        .optional()
        .default(1)
        .describe('Amount of items to deposit'),
    },
    async ({ itemName, amount }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        // Check if a container is open
        if (!botState.currentContainer) {
          return createSuccessResponse(
            'No container is currently open. Use openContainer first.'
          )
        }

        // Find the item in inventory
        const matchingItems = botState.bot.inventory
          .items()
          .filter(
            (item) =>
              item !== null &&
              item.name &&
              item.name.toLowerCase() === itemName.toLowerCase()
          )

        if (matchingItems.length === 0) {
          return createSuccessResponse(
            `Item "${itemName}" not found in your inventory.`
          )
        }

        // Calculate how many items to deposit
        let remainingAmount = amount
        let depositedAmount = 0

        // Deposit items from each matching slot until we've deposited enough
        for (const item of matchingItems) {
          if (remainingAmount <= 0) break

          const amountFromThisItem = Math.min(remainingAmount, item.count)

          // Ensure item.type exists
          if (typeof item.type !== 'number') {
            continue // Skip this item if type is not available
          }

          await botState.currentContainer.deposit(
            item.type,
            null,
            amountFromThisItem
          )

          remainingAmount -= amountFromThisItem
          depositedAmount += amountFromThisItem
        }

        return createSuccessResponse(
          `Deposited ${depositedAmount} x ${itemName} into the container.`
        )
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )

  // Tool to close the current container
  server.tool(
    'closeContainer',
    'Close the currently open container',
    {},
    async () => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        // Check if a container is open
        if (!botState.currentContainer) {
          return createSuccessResponse('No container is currently open.')
        }

        // Close the container
        if (botState.bot.currentWindow) {
          await botState.bot.closeWindow(botState.bot.currentWindow)
        }
        botState.currentContainer = null

        return createSuccessResponse('Container closed successfully.')
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )
}
