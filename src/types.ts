import * as mineflayer from 'mineflayer'
import { Window } from 'prismarine-windows'

// Combine Window with withdraw/deposit methods from Chest/Dispenser
export interface Container extends Window {
  withdraw(
    itemType: number,
    metadata: number | null,
    count: number | null
  ): Promise<void>
  deposit(
    itemType: number,
    metadata: number | null,
    count: number
  ): Promise<void>
}

// Type for server connection information
export interface ConnectionInfo {
  host: string
  port: number
  username: string
  version: string
}

// Type for managing bot state
export interface BotState {
  bot: mineflayer.Bot | null
  isConnected: boolean
  connectionInfo: ConnectionInfo
  currentContainer: Container | null

  // Added properties to extend bot state tracking
  [key: string]: any // Allow dynamic properties for extended functionality
}

// Type for tool response content element
export interface TextContent {
  [x: string]: unknown
  type: 'text'
  text: string
}

// Type for tool response
export interface ToolResponse {
  [x: string]: unknown
  content: TextContent[]
  _meta?: Record<string, unknown>
  isError?: boolean
}

// Helper type for error handling
export interface ErrorResponse {
  message: string
}
