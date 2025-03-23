import { registerBlockTools } from './blocks.js'
import { registerBasicMovementTools } from './basicMovement.js'
import { registerChatTools } from './chat.js'
import { registerConnectTools } from './connect.js'
import { registerContainerInteractionTools } from './containerInteraction.js'
import { registerCraftingTools } from './crafting.js'
import { registerEntityInteractionTools } from './entityInteraction.js'
import { registerInfoTools } from './info.js'
import { registerInventoryTools } from './inventory.js'
import { registerInventoryManagementTools } from './inventoryManagement.js'
import { registerMovementTools } from './movement.js'
import { registerTradingTools } from './trading.js'

// Function to register all tools
export function registerAllTools(): void {
  // Core tools
  registerConnectTools()
  registerChatTools()
  
  // Movement tools
  registerMovementTools()
  registerBasicMovementTools()
  
  // Block interaction
  registerBlockTools()
  
  // Information tools
  registerInfoTools()
  
  // Inventory tools
  registerInventoryTools()
  registerInventoryManagementTools()
  
  // Entity interaction
  registerEntityInteractionTools()
  
  // Advanced features
  registerContainerInteractionTools()
  registerCraftingTools()
  registerTradingTools()
}
