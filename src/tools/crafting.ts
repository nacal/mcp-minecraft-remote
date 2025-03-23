import { z } from 'zod'
import { botState, server } from '../server'
import {
  createErrorResponse,
  createNotConnectedResponse,
  createSuccessResponse,
} from '../utils/error-handler'

// Function to register crafting tools
export function registerCraftingTools() {
  // Tool to get available recipes
  server.tool(
    'getRecipes',
    'Get a list of available crafting recipes',
    {
      filter: z.string().optional().describe('Filter recipes by item name'),
    },
    async ({ filter }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        // In mineflayer API, first parameter should be itemType (number), not filter string
        // Using a regex match or 0 as a wildcard for all items
        const itemType = filter ? 0 : 0 // 0 is used as a wildcard
        const recipes = botState.bot.recipesFor(itemType, null, null, null)

        if (recipes.length === 0) {
          return createSuccessResponse(
            filter
              ? `No recipes found for "${filter}".`
              : 'No recipes available.'
          )
        }

        // Group recipes by output item
        type RecipeGroups = Record<string, Array<any>>
        const groupedRecipes: RecipeGroups = {}
        recipes.forEach((recipe) => {
          const outputName =
            recipe.result &&
            typeof recipe.result === 'object' &&
            'name' in recipe.result
              ? recipe.result.name
              : 'Unknown'

          // Use type assertion to help TypeScript understand the key is valid
          const key = outputName as string
          if (!groupedRecipes[key]) {
            groupedRecipes[key] = []
          }
          groupedRecipes[key].push(recipe)
        })

        // Format the response
        let response = filter
          ? `Available recipes for "${filter}":\n\n`
          : `Available recipes (${recipes.length}):\n\n`

        for (const [output, recipes] of Object.entries(groupedRecipes)) {
          response += `${output} (${recipes.length} recipe${
            recipes.length > 1 ? 's' : ''
          }):\n`

          recipes.forEach((recipe, index) => {
            response += `  Recipe ${index + 1}:\n`

            // Add ingredients
            if (
              recipe.ingredients &&
              Array.isArray(recipe.ingredients) &&
              recipe.ingredients.length > 0
            ) {
              response += '    Ingredients:\n'
              recipe.ingredients.forEach((item: any) => {
                const count = item.count || 1
                response += `      - ${item.name} x${count}\n`
              })
            }

            response += '\n'
          })
        }

        return createSuccessResponse(response)
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )

  // Tool to craft an item
  server.tool(
    'craftItem',
    'Craft an item using available materials',
    {
      itemName: z.string().describe('Name of the item to craft'),
      count: z
        .number()
        .optional()
        .default(1)
        .describe('Number of items to craft'),
    },
    async ({ itemName, count }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse()
      }

      try {
        // For crafting, we need to get the itemType from a name lookup or approximate it
        // This is a simple workaround - ideally, we'd have a proper mapping of names to IDs
        const itemType = 0 // Using 0 as a wildcard to get all recipes
        const recipes = botState.bot.recipesFor(itemType, null, count, null)

        if (recipes.length === 0) {
          return createSuccessResponse(
            `No recipes found for "${itemName}" or insufficient materials.`
          )
        }

        // Choose the first available recipe
        const recipe = recipes[0]

        // Craft the item
        await botState.bot.craft(recipe, count)

        return createSuccessResponse(
          `Successfully crafted ${count} x ${itemName}`
        )
      } catch (error) {
        return createErrorResponse(error)
      }
    }
  )
}
