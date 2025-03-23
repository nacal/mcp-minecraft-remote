import * as mineflayer from 'mineflayer'

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
}

// Type for tool response content element
export interface TextContent {
  [x: string]: unknown
  type: "text"
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
