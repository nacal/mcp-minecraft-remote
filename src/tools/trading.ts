import { z } from 'zod'
import { botState, server } from '../server'
import {
  createErrorResponse,
  createNotConnectedResponse,
  createSuccessResponse,
} from '../utils/error-handler'

// Function to register trading tools
export function registerTradingTools() {
  // Tool to list trades from nearby villager
  server.tool(
    'listTrades',
    'List available trades from a nearby villager',
    {
      villagerName: z
        .string()
        .optional()
        .describe('Name or identifier of the villager (optional)'),
      range: z
        .number()
        .optional()
        .default(4)
        .describe('Range to search for villagers'),
    },
    async ({ villagerName, range }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        // Find villagers in range
        const villagers = Object.values(botState.bot.entities).filter(
          (entity) => {
            if (!entity || !entity.position || !botState.bot) return false
            const distance = entity.position.distanceTo(
              botState.bot.entity.position
            )
            return (
              distance <= range &&
              String(entity.type) === 'villager' &&
              (!villagerName ||
                (entity.name &&
                  entity.name
                    .toLowerCase()
                    .includes(villagerName.toLowerCase())))
            )
          }
        )

        if (villagers.length === 0) {
          return createSuccessResponse(
            villagerName
              ? `No villager named "${villagerName}" found nearby.`
              : 'No villagers found nearby.'
          )
        }

        // Choose the closest villager if multiple are found
        const villager = villagers.reduce((closest, current) => {
          if (!closest.position || !current.position || !botState.bot)
            return current
          const distClosest = closest.position.distanceTo(
            botState.bot.entity.position
          )
          const distCurrent = current.position.distanceTo(
            botState.bot.entity.position
          )
          return distCurrent < distClosest ? current : closest
        })

        // We need to use the real Villager class
        // First step is to use openVillager method
        const villagerEntity = await botState.bot.openVillager(villager as any)

        await botState.bot.trade(villagerEntity, 1, 1) // Just to open the window, numbers don't matter

        // Check if window is open before accessing properties
        if (!botState.bot.currentWindow) {
          return createSuccessResponse(
            `Could not open trading window with villager.`
          )
        }

        const trades = botState.bot.currentWindow.slots
          .filter((item) => item !== null && item !== undefined)
          .map((item) => {
            if (!item) return null
            // Try to extract trade details
            return {
              name: item.name,
              displayName: item.displayName || item.name,
              count: item.count || 1,
              // Add more properties as needed
            }
          })
          .filter((trade) => trade !== null)

        // Close the trading window if open
        if (botState.bot.currentWindow) {
          await botState.bot.closeWindow(botState.bot.currentWindow)
        }

        if (trades.length === 0) {
          return createSuccessResponse(
            `Villager found, but no trades are available.`
          )
        }

        // Format the response
        let response = `Available trades from villager ${
          villager.name || 'Unknown'
        } (${villager.position
          .distanceTo(botState.bot.entity.position)
          .toFixed(1)} blocks away):\n\n`

        trades.forEach((trade, index) => {
          response += `${index + 1}. ${trade.displayName} (x${trade.count})\n`
        })

        return createSuccessResponse(response)
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )

  // Tool to trade with a villager
  server.tool(
    'tradeWithVillager',
    'Trade with a nearby villager',
    {
      villagerName: z
        .string()
        .optional()
        .describe('Name or identifier of the villager (optional)'),
      tradeIndex: z
        .number()
        .describe('Index of the trade from listTrades (1-based)'),
      count: z
        .number()
        .optional()
        .default(1)
        .describe('Number of times to perform the trade'),
    },
    async ({ villagerName, tradeIndex, count }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        // Find villagers in range (using a default range of 4 blocks)
        const villagers = Object.values(botState.bot.entities).filter(
          (entity) => {
            if (!entity || !entity.position || !botState.bot) return false
            const distance = entity.position.distanceTo(
              botState.bot.entity.position
            )
            return (
              distance <= 4 &&
              String(entity.type) === 'villager' &&
              (!villagerName ||
                (entity.name &&
                  entity.name
                    .toLowerCase()
                    .includes(villagerName.toLowerCase())))
            )
          }
        )

        if (villagers.length === 0) {
          return createSuccessResponse(
            villagerName
              ? `No villager named "${villagerName}" found nearby.`
              : 'No villagers found nearby.'
          )
        }

        // Choose the closest villager if multiple are found
        const villager = villagers.reduce((closest, current) => {
          if (!closest.position || !current.position || !botState.bot)
            return current
          const distClosest = closest.position.distanceTo(
            botState.bot.entity.position
          )
          const distCurrent = current.position.distanceTo(
            botState.bot.entity.position
          )
          return distCurrent < distClosest ? current : closest
        })

        // We need to use the real Villager class
        // First step is to use openVillager method
        const villagerEntity = await botState.bot.openVillager(villager as any)

        await botState.bot.trade(villagerEntity, tradeIndex - 1, count)

        // Close the trading window if open
        if (botState.bot.currentWindow) {
          await botState.bot.closeWindow(botState.bot.currentWindow)
        }

        return createSuccessResponse(
          `Successfully traded with villager ${
            villager.name || 'Unknown'
          }, trade #${tradeIndex} (x${count})`
        )
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )
}
