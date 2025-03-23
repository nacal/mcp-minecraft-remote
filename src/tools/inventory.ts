import { botState, server } from '../server.js'
import {
  createErrorResponse,
  createNotConnectedResponse,
  createSuccessResponse,
} from '../utils/error-handler.js'

// Function to register inventory-related tools
export function registerInventoryTools() {
  // Tool to check inventory
  server.tool(
    'checkInventory',
    'Check the items in the player inventory',
    {},
    async () => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        const items = botState.bot.inventory.items()
        if (items.length === 0) {
          return createSuccessResponse('Inventory is empty.')
        }

        const itemList = items
          .map((item) => `${item.name} x${item.count}`)
          .join(', ')

        return createSuccessResponse(`Inventory contains: ${itemList}`)
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )
}
