import { registerBlockTools } from './blocks'
import { registerBasicMovementTools } from './basicMovement'
import { registerChatTools } from './chat'
import { registerConnectTools } from './connect'
import { registerContainerInteractionTools } from './containerInteraction'
import { registerCraftingTools } from './crafting'
import { registerEntityInteractionTools } from './entityInteraction'
import { registerInfoTools } from './info'
import { registerInventoryTools } from './inventory'
import { registerInventoryManagementTools } from './inventoryManagement'
import { registerMovementTools } from './movement'
import { registerTradingTools } from './trading'

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
