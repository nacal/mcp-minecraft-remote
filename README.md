# MCP Minecraft Remote

> This project is inspired by [mcp-minecraft](https://github.com/arjunkmrm/mcp-minecraft) by arjunkmrm. While the original only supported local Minecraft server connections, this project was newly created from scratch to add support for connecting to remote Minecraft servers.

Minecraft Remote Control using MCP (Model Context Protocol).

## Features

- Connect to and control a Minecraft player via an AI assistant
- Navigate, mine, build, and interact with the Minecraft world
- Chat with other players on the server
- Check inventory, player position, and server information
- Advanced movement control including jumping, sneaking, and sprinting
- Entity interaction including attacking and following
- Container usage (chests, furnaces, etc.)
- Item crafting and villager trading
- Detailed inventory management

## Installation

### Quick Install (Recommended)

```bash
npx -y @smithery/cli install mcp-minecraft-remote --client claude
```

Follow the CLI prompts to complete the setup.

### Manual Installation

```bash
# Install from npm
npm install -g mcp-minecraft-remote

# Or clone the repository
git clone https://github.com/nacal/mcp-minecraft-remote.git
cd mcp-minecraft-remote

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Using with Claude Desktop

1. Navigate to Claude Desktop configuration file:

   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. Add the Minecraft Remote MCP configuration to your configuration file:

```json
{
  "mcpServers": {
    "minecraft-remote": {
      "command": "npx",
      "args": ["-y", "mcp-minecraft-remote@latest"]
    }
  }
}
```

If you've installed it globally:

```json
{
  "mcpServers": {
    "minecraft-remote": {
      "command": "mcp-minecraft-remote"
    }
  }
}
```

If you've cloned the repository locally:

```json
{
  "mcpServers": {
    "minecraft-remote": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-minecraft-remote/build/index.js"]
    }
  }
}
```

3. Save the file and restart Claude Desktop
4. Start a new conversation with Claude and begin using the Minecraft control commands

### Important Server Requirements

- **Server Online Mode**: The Minecraft server must have `online-mode=false` set in the server.properties file. This allows the bot to connect without authentication against Minecraft's session servers.
- If using a server with authentication, you'll need to provide valid premium account credentials when connecting.

### Available Tools

#### Core Functionality

- `connectToServer`: Connect to a Minecraft server with specified credentials
- `disconnectFromServer`: Disconnect from the Minecraft server
- `sendChat`: Send a chat message to the server
- `getServerInfo`: Get information about the connected server

#### Movement

- `getPosition`: Get current player position
- `moveTo`: Move to specific coordinates
- `moveControl`: Basic movement controls (forward, back, left, right, jump, sprint, sneak, stop)
- `lookAt`: Make the player look in a specific direction or at coordinates

#### World Interaction

- `digBlock`: Mine a block at specific coordinates
- `placeBlock`: Place a block at specific coordinates

#### Inventory Management

- `checkInventory`: Basic inventory check
- `inventoryDetails`: Get detailed information about inventory items
- `equipItem`: Equip an item from inventory to hand or armor slot
- `tossItem`: Throw items from inventory

#### Entity Interaction

- `getNearbyPlayers`: Get list of nearby players
- `getNearbyEntities`: Get a list of all entities nearby
- `attackEntity`: Attack a specific entity
- `useOnEntity`: Use held item on a specific entity
- `followEntity`: Follow a specific entity

#### Container Interaction

- `openContainer`: Open a container (chest, furnace, etc.) at specific coordinates
- `withdrawItem`: Take items from an open container
- `depositItem`: Put items into an open container
- `closeContainer`: Close the currently open container

#### Crafting

- `getRecipes`: Get a list of available crafting recipes
- `craftItem`: Craft an item using available materials

#### Trading

- `listTrades`: List available trades from a nearby villager
- `tradeWithVillager`: Trade with a nearby villager

### Example Prompts

#### Basic Controls

- "Connect to the Minecraft server at play.example.com with the username player1"
- "What is my current position in the game?"
- "Move me to coordinates x=100, y=64, z=-200"
- "Make me walk forward for 3 seconds"
- "Make me jump and sprint toward that mountain"

#### Inventory & Items

- "Check what's in my inventory in detail"
- "Equip my diamond sword to my hand"
- "Throw 5 dirt blocks from my inventory"

#### Block Interaction

- "Dig the block at coordinates x=10, y=65, z=20"
- "Place a stone block at coordinates x=11, y=65, z=20"

#### Entity Interaction

- "Are there any other players nearby?"
- "What entities are within 20 blocks of me?"
- "Attack the zombie with ID 12345"
- "Follow the player named Steve"

#### Container Usage

- "Open the chest at coordinates x=100, y=64, z=200"
- "Take 10 iron ingots from the chest"
- "Put 5 cobblestone in the chest"
- "Close the container"

#### Crafting & Trading

- "What recipes do I have available for a wooden pickaxe?"
- "Craft 4 sticks using the wood in my inventory"
- "Check what trades the nearby villager offers"
- "Trade with the villager to get 10 emeralds"

#### Communication

- "Send a hello message to the chat"
- "Tell everyone that I found diamonds"

## Requirements

- Node.js 18+
- An AI assistant that supports MCP (like Claude)
- A Minecraft Java Edition server (version 1.8 or later)

**Note**: This tool has been tested and verified to work specifically with vanilla Minecraft 1.21. While it may function with other versions or modded servers, compatibility is not guaranteed.

## License

MIT
