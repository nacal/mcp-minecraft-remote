import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import * as mineflayer from 'mineflayer'
import { BotState, ConnectionInfo } from './types'

// Object to maintain bot state (global state)
export const botState: BotState = {
  bot: null,
  isConnected: false,
  connectionInfo: {
    host: '',
    port: 25565,
    username: '',
    version: '',
  },
  currentContainer: null,
}

// Create server instance
export const server = new McpServer({
  name: 'MinecraftRemote',
  version: '0.1.0',
})

// Function to initialize the bot
export function createBot(options: mineflayer.BotOptions): mineflayer.Bot {
  const bot = mineflayer.createBot(options)
  return bot
}

// Function to update bot state
export function updateConnectionInfo(info: Partial<ConnectionInfo>): void {
  botState.connectionInfo = {
    ...botState.connectionInfo,
    ...info,
  }
}

// Function to update bot connection state
export function updateConnectionState(
  connected: boolean,
  bot: mineflayer.Bot | null = null
): void {
  botState.isConnected = connected
  if (bot !== undefined) {
    botState.bot = bot
  }
}
