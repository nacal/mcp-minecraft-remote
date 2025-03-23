#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { server } from './server.js'
import { registerAllTools } from './tools/index.js'

// Register all tools
registerAllTools()

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  // Using standard error output because standard output would be interpreted as a server response
  console.error('MCP Minecraft Remote Server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error in main():', error)
  process.exit(1)
})
