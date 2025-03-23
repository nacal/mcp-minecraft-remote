import { ToolResponse } from '../types.js'

/**
 * Utility to generate tool response from error message
 */
export function createErrorResponse(error: unknown): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: `Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    ],
  }
}

/**
 * Error response for connection check
 */
export function createNotConnectedResponse(): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: 'Not connected to any server. Connect first.',
      },
    ],
  }
}

/**
 * Error response for when already connected
 */
export function createAlreadyConnectedResponse(): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: 'Already connected to a server. Disconnect first.',
      },
    ],
  }
}

/**
 * Utility to generate success response
 */
export function createSuccessResponse(message: string): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: message,
      },
    ],
  }
}
