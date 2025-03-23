import { registerBlockTools } from './blocks'
import { registerChatTools } from './chat'
import { registerConnectTools } from './connect'
import { registerInfoTools } from './info'
import { registerInventoryTools } from './inventory'
import { registerMovementTools } from './movement'

// Function to register all tools
export function registerAllTools(): void {
  registerConnectTools()
  registerChatTools()
  registerMovementTools()
  registerBlockTools()
  registerInfoTools()
  registerInventoryTools()
}
