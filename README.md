# MCP Minecraft Remote

> This project is inspired by [mcp-minecraft](https://github.com/arjunkmrm/mcp-minecraft) by arjunkmrm. While the original only supported local Minecraft server connections, this project was newly created from scratch to add support for connecting to remote Minecraft servers.

Minecraft Remote Control using MCP (Model Context Protocol).

## Features

- Connect to and control a Minecraft player via an AI assistant
- Navigate, mine, build, and interact with the Minecraft world
- Chat with other players on the server
- Check inventory, player position, and server information

## Installation

```bash
# Clone the repository
git clone https://github.com/nacal/mcp-minecraft-remote.git
cd mcp-minecraft-remote

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Using with Claude Desktop

1. Open Claude Desktop application
2. Navigate to the settings directory:
   - Windows: `%APPDATA%\Claude\settings.json`
   - macOS: `~/Library/Application Support/Claude/settings.json`
   - Linux: `~/.config/Claude/settings.json`
3. Add the Minecraft Remote MCP configuration to your `settings.json`:

```json
{
  "mcpServers": {
    "minecraft-remote": {
      "command": "node",
      "args": ["file:///path/to/your/mcp-minecraft-remote"]
    }
  }
}
```

4. Replace `/path/to/your/mcp-minecraft-remote` with the actual path to the cloned repository
5. Save the file and restart Claude Desktop
6. Start a new conversation with Claude and begin using the Minecraft control commands

### Important Server Requirements

- **Server Online Mode**: The Minecraft server must have `online-mode=false` set in the server.properties file. This allows the bot to connect without authentication against Minecraft's session servers.
- If using a server with authentication, you'll need to provide valid premium account credentials when connecting.

### Available Tools

- `connectToServer`: Connect to a Minecraft server with specified credentials
- `disconnectFromServer`: Disconnect from the Minecraft server
- `sendChat`: Send a chat message to the server
- `getPosition`: Get current player position
- `moveTo`: Move to specific coordinates
- `checkInventory`: Check player inventory
- `digBlock`: Mine a block at specific coordinates
- `placeBlock`: Place a block at specific coordinates
- `getNearbyPlayers`: Get list of nearby players
- `getServerInfo`: Get information about the connected server

### Example Prompts

- "Connect to the Minecraft server at play.example.com with the username player1"
- "What is my current position in the game?"
- "Move me to coordinates x=100, y=64, z=-200"
- "Check what's in my inventory"
- "Dig the block at coordinates x=10, y=65, z=20"
- "Place a stone block at coordinates x=11, y=65, z=20"
- "Are there any other players nearby?"
- "Send a hello message to the chat"

## Requirements

- Node.js 18+
- An AI assistant that supports MCP (like Claude)
- A Minecraft Java Edition server (version 1.8 or later)

**Note**: This tool has been tested and verified to work specifically with vanilla Minecraft 1.21. While it may function with other versions or modded servers, compatibility is not guaranteed.

## License

MIT
