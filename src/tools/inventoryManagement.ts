import { z } from 'zod'
import { botState, server } from '../server.js'
import {
  createErrorResponse,
  createNotConnectedResponse,
  createSuccessResponse,
} from '../utils/error-handler.js'

// Function to register advanced inventory management tools
export function registerInventoryManagementTools() {
  // Tool to equip an item
  server.tool(
    'equipItem',
    'Equip an item from inventory to hand or armor slot',
    {
      itemName: z.string().describe('Name of the item to equip'),
      destination: z
        .enum(['hand', 'head', 'torso', 'legs', 'feet'])
        .default('hand')
        .describe('Slot to equip the item to'),
    },
    async ({ itemName, destination }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        // Find the item in inventory
        const item = botState.bot.inventory
          .items()
          .find((item) => item.name.toLowerCase() === itemName.toLowerCase())

        if (!item) {
          return createSuccessResponse(
            `Item "${itemName}" not found in inventory.`
          )
        }

        // Equip the item to the specified destination
        await botState.bot.equip(item, destination)
        return createSuccessResponse(
          `Successfully equipped ${itemName} to ${destination}`
        )
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )

  // Tool to list inventory details with more information
  server.tool(
    'inventoryDetails',
    'Get detailed information about inventory items',
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

        // Get equipped items
        const helmet = botState.bot.inventory.slots[5]
        const chestplate = botState.bot.inventory.slots[6]
        const leggings = botState.bot.inventory.slots[7]
        const boots = botState.bot.inventory.slots[8]
        const heldItem = botState.bot.heldItem

        // Create detailed item list with full info
        const itemsDetailed = items.map((item) => {
          return {
            name: item.name,
            displayName: item.displayName,
            count: item.count,
            type: item.type,
            durability: item.maxDurability
              ? `${item.durabilityUsed || 0}/${item.maxDurability}`
              : 'N/A',
            enchantments: item.enchants
              ? Object.keys(item.enchants).join(', ')
              : 'None',
          }
        })

        // Create a formatted text output
        let response = 'Inventory Contents:\n\n'

        if (heldItem) {
          response += `Held Item: ${heldItem.displayName || heldItem.name} (x${
            heldItem.count
          })\n`
        } else {
          response += 'Held Item: None\n'
        }

        response += '\nEquipped Armor:\n'
        response += `Helmet: ${
          helmet ? helmet.displayName || helmet.name : 'None'
        }\n`
        response += `Chestplate: ${
          chestplate ? chestplate.displayName || chestplate.name : 'None'
        }\n`
        response += `Leggings: ${
          leggings ? leggings.displayName || leggings.name : 'None'
        }\n`
        response += `Boots: ${
          boots ? boots.displayName || boots.name : 'None'
        }\n`

        response += '\nAll Items:\n'
        itemsDetailed.forEach((item, i) => {
          response += `${i + 1}. ${item.displayName} (x${item.count})`
          if (item.durability !== 'N/A') {
            response += ` - Durability: ${item.durability}`
          }
          if (item.enchantments !== 'None') {
            response += ` - Enchantments: ${item.enchantments}`
          }
          response += '\n'
        })

        return createSuccessResponse(response)
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )

  // Tool to toss/throw items from inventory
  server.tool(
    'tossItem',
    'Throw items from inventory',
    {
      itemName: z.string().describe('Name of the item to throw'),
      amount: z
        .number()
        .optional()
        .default(1)
        .describe('Amount of items to throw'),
    },
    async ({ itemName, amount }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        // Find the item in inventory
        const item = botState.bot.inventory
          .items()
          .find((item) => item.name.toLowerCase() === itemName.toLowerCase())

        if (!item) {
          return createSuccessResponse(
            `Item "${itemName}" not found in inventory.`
          )
        }

        // Since tossItem doesn't exist in the API, we have a few alternatives:
        // 1. Drop the item at the bot's current position
        await botState.bot.toss(item.type, null, amount)
        return createSuccessResponse(`Successfully threw ${amount} ${itemName}`)
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )
}
