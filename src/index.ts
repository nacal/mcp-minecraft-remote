import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import * as mineflayer from 'mineflayer'
import pkg from 'mineflayer-pathfinder'
import { Vec3 } from 'vec3'
import { z } from 'zod'
const { Movements, goals, pathfinder } = pkg

// ボットのステートを保持するオブジェクト
let bot: mineflayer.Bot | null = null
let isConnected = false

// サーバー接続情報を保持
let connectionInfo = {
  host: '',
  port: 25565,
  username: '',
  version: '',
}

// サーバーインスタンスの作成
export const server = new McpServer({
  name: 'MinecraftRemote',
  version: '0.1.0',
})

// ログイン/接続ツール
server.tool(
  'connectToServer',
  'Connect to a Minecraft server with the specified credentials',
  {
    host: z.string().describe('Minecraft server host address'),
    port: z
      .number()
      .optional()
      .default(25565)
      .describe('Minecraft server port'),
    username: z.string().describe('Minecraft username'),
    password: z
      .string()
      .optional()
      .describe('Minecraft password (if using premium account)'),
    version: z.string().optional().describe('Minecraft version'),
  },
  async ({ host, port, username, password, version }) => {
    if (isConnected && bot) {
      return {
        content: [
          {
            type: 'text',
            text: 'Already connected to a server. Disconnect first.',
          },
        ],
      }
    }

    try {
      connectionInfo = {
        host,
        port,
        username,
        version: version || 'auto',
      }

      // ボットの接続オプション
      const options: mineflayer.BotOptions = {
        host,
        port,
        username,
        password,
        version,
      }

      // ボットの作成
      bot = mineflayer.createBot(options)

      // ボットにパスファインダープラグインを追加
      bot.loadPlugin(pathfinder)

      return new Promise((resolve) => {
        // ログインに成功した場合
        bot!.once('spawn', () => {
          isConnected = true
          resolve({
            content: [
              {
                type: 'text',
                text: `Successfully connected to ${host}:${port} as ${username}`,
              },
            ],
          })
        })

        // エラーが発生した場合
        bot!.once('error', (err) => {
          bot = null
          isConnected = false
          resolve({
            content: [
              {
                type: 'text',
                text: `Failed to connect: ${err.message}`,
              },
            ],
          })
        })

        // タイムアウト処理（10秒後に接続が確立されていない場合）
        setTimeout(() => {
          if (!isConnected) {
            bot = null
            resolve({
              content: [
                {
                  type: 'text',
                  text: 'Connection timed out after 10 seconds',
                },
              ],
            })
          }
        }, 10000)
      })
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error connecting to server: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      }
    }
  }
)

// 切断ツール
server.tool(
  'disconnectFromServer',
  'Disconnect from the Minecraft server',
  {},
  async () => {
    if (!isConnected || !bot) {
      return {
        content: [
          {
            type: 'text',
            text: 'Not connected to any server.',
          },
        ],
      }
    }

    try {
      bot.quit()
      bot = null
      isConnected = false
      return {
        content: [
          {
            type: 'text',
            text: 'Successfully disconnected from the server.',
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error disconnecting: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      }
    }
  }
)

// チャットメッセージを送信するツール
server.tool(
  'sendChat',
  'Send a chat message to the Minecraft server',
  {
    message: z.string().describe('Message to send to the server'),
  },
  async ({ message }) => {
    if (!isConnected || !bot) {
      return {
        content: [
          {
            type: 'text',
            text: 'Not connected to any server. Connect first.',
          },
        ],
      }
    }

    try {
      bot.chat(message)
      return {
        content: [
          {
            type: 'text',
            text: `Message sent: ${message}`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error sending message: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      }
    }
  }
)

// 現在位置情報を取得するツール
server.tool(
  'getPosition',
  'Get the current position of the player in the Minecraft world',
  {},
  async () => {
    if (!isConnected || !bot) {
      return {
        content: [
          {
            type: 'text',
            text: 'Not connected to any server. Connect first.',
          },
        ],
      }
    }

    try {
      const position = bot.entity.position
      return {
        content: [
          {
            type: 'text',
            text: `Current position: X=${position.x.toFixed(
              2
            )}, Y=${position.y.toFixed(2)}, Z=${position.z.toFixed(2)}`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting position: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      }
    }
  }
)

// 指定した場所に移動するツール
server.tool(
  'moveTo',
  'Move the player to a specific location',
  {
    x: z.number().describe('X coordinate'),
    y: z.number().describe('Y coordinate'),
    z: z.number().describe('Z coordinate'),
  },
  async ({ x, y, z }) => {
    if (!isConnected || !bot) {
      return {
        content: [
          {
            type: 'text',
            text: 'Not connected to any server. Connect first.',
          },
        ],
      }
    }

    try {
      // pathfinderのMovementsを設定
      const movements = new Movements(bot)
      bot.pathfinder.setMovements(movements)

      // 目標位置を設定
      const goal = new goals.GoalBlock(x, y, z)

      return new Promise((resolve) => {
        // 移動開始
        bot!.pathfinder
          .goto(goal)
          .then(() => {
            resolve({
              content: [
                {
                  type: 'text',
                  text: `Successfully moved to X=${x}, Y=${y}, Z=${z}`,
                },
              ],
            })
          })
          .catch((err) => {
            resolve({
              content: [
                {
                  type: 'text',
                  text: `Failed to move: ${err.message}`,
                },
              ],
            })
          })

        // タイムアウト処理（1分後にまだ移動中の場合）
        setTimeout(() => {
          resolve({
            content: [
              {
                type: 'text',
                text: 'Movement is taking longer than expected. Still trying to reach the destination...',
              },
            ],
          })
        }, 60000)
      })
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error during movement: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      }
    }
  }
)

// インベントリを確認するツール
server.tool(
  'checkInventory',
  'Check the items in the player inventory',
  {},
  async () => {
    if (!isConnected || !bot) {
      return {
        content: [
          {
            type: 'text',
            text: 'Not connected to any server. Connect first.',
          },
        ],
      }
    }

    try {
      const items = bot.inventory.items()
      if (items.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'Inventory is empty.',
            },
          ],
        }
      }

      const itemList = items
        .map((item) => `${item.name} x${item.count}`)
        .join(', ')

      return {
        content: [
          {
            type: 'text',
            text: `Inventory contains: ${itemList}`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error checking inventory: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      }
    }
  }
)

// ブロックを掘るツール
server.tool(
  'digBlock',
  'Dig a block at the specified coordinates',
  {
    x: z.number().describe('X coordinate'),
    y: z.number().describe('Y coordinate'),
    z: z.number().describe('Z coordinate'),
  },
  async ({ x, y, z }) => {
    if (!isConnected || !bot) {
      return {
        content: [
          {
            type: 'text',
            text: 'Not connected to any server. Connect first.',
          },
        ],
      }
    }

    try {
      // 指定座標のブロックを取得
      const block = bot.blockAt(new Vec3(x, y, z))

      if (!block || block.name === 'air') {
        return {
          content: [
            {
              type: 'text',
              text: 'No block found at the specified coordinates.',
            },
          ],
        }
      }

      return new Promise((resolve) => {
        // ブロックを掘る
        bot!
          .dig(block)
          .then(() => {
            resolve({
              content: [
                {
                  type: 'text',
                  text: `Successfully dug ${block.name} at X=${x}, Y=${y}, Z=${z}`,
                },
              ],
            })
          })
          .catch((err) => {
            resolve({
              content: [
                {
                  type: 'text',
                  text: `Failed to dig block: ${err.message}`,
                },
              ],
            })
          })

        // タイムアウト処理（30秒後にまだ掘っている場合）
        setTimeout(() => {
          resolve({
            content: [
              {
                type: 'text',
                text: 'Digging is taking longer than expected. Still trying...',
              },
            ],
          })
        }, 30000)
      })
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error digging block: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      }
    }
  }
)

// ブロックを設置するツール
server.tool(
  'placeBlock',
  'Place a block at the specified location',
  {
    x: z.number().describe('X coordinate'),
    y: z.number().describe('Y coordinate'),
    z: z.number().describe('Z coordinate'),
    itemName: z.string().describe('Name of the item to place'),
  },
  async ({ x, y, z, itemName }) => {
    if (!isConnected || !bot) {
      return {
        content: [
          {
            type: 'text',
            text: 'Not connected to any server. Connect first.',
          },
        ],
      }
    }

    try {
      // インベントリからアイテムを探す
      const item = bot.inventory
        .items()
        .find((item) => item.name.toLowerCase() === itemName.toLowerCase())

      if (!item) {
        return {
          content: [
            {
              type: 'text',
              text: `Item "${itemName}" not found in inventory.`,
            },
          ],
        }
      }

      // アイテムを手に持つ
      await bot.equip(item, 'hand')

      // 設置先の参照ブロックと設置面を取得
      const targetPos = { x, y, z }
      const faceVectors = [
        { x: 0, y: 1, z: 0 }, // 上
        { x: 0, y: -1, z: 0 }, // 下
        { x: 1, y: 0, z: 0 }, // 東
        { x: -1, y: 0, z: 0 }, // 西
        { x: 0, y: 0, z: 1 }, // 南
        { x: 0, y: 0, z: -1 }, // 北
      ]

      // 各面を試して設置できるかチェック
      for (const faceVector of faceVectors) {
        const referencePos = {
          x: targetPos.x - faceVector.x,
          y: targetPos.y - faceVector.y,
          z: targetPos.z - faceVector.z,
        }

        const referenceBlock = bot.blockAt(
          new Vec3(referencePos.x, referencePos.y, referencePos.z)
        )

        if (referenceBlock && referenceBlock.name !== 'air') {
          try {
            // ブロックを設置
            await bot.placeBlock(
              referenceBlock,
              new Vec3(faceVector.x, faceVector.y, faceVector.z)
            )

            return {
              content: [
                {
                  type: 'text',
                  text: `Successfully placed ${itemName} at X=${x}, Y=${y}, Z=${z}`,
                },
              ],
            }
          } catch (err) {
            // この面での設置に失敗したら次の面を試す
            continue
          }
        }
      }

      // すべての面で設置に失敗した場合
      return {
        content: [
          {
            type: 'text',
            text: `Failed to place ${itemName}. No suitable surface found or not enough space.`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error placing block: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      }
    }
  }
)

// 周囲のプレイヤーを取得するツール
server.tool(
  'getNearbyPlayers',
  'Get a list of players nearby',
  {},
  async () => {
    if (!isConnected || !bot) {
      return {
        content: [
          {
            type: 'text',
            text: 'Not connected to any server. Connect first.',
          },
        ],
      }
    }

    try {
      const players = Object.values(bot.players)
        .filter((player) => player.entity && player.username !== bot?.username)
        .map((player) => {
          if (!bot) return ''
          const pos = player.entity!.position
          const distance = pos.distanceTo(bot.entity.position)
          return `${player.username} (${distance.toFixed(2)} blocks away)`
        })

      if (players.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No other players nearby.',
            },
          ],
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `Nearby players: ${players.join(', ')}`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting nearby players: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      }
    }
  }
)

// サーバー情報を取得するツール
server.tool(
  'getServerInfo',
  'Get information about the currently connected server',
  {},
  async () => {
    if (!isConnected || !bot) {
      return {
        content: [
          {
            type: 'text',
            text: 'Not connected to any server. Connect first.',
          },
        ],
      }
    }

    try {
      return {
        content: [
          {
            type: 'text',
            text: `Server Info:
Host: ${connectionInfo.host}
Port: ${connectionInfo.port}
Version: ${bot.version}
Game Mode: ${bot.game.gameMode}
Difficulty: ${bot.game.difficulty}
Time: ${bot.time.timeOfDay}
Players Online: ${Object.keys(bot.players).length}
Your Health: ${bot.health ? bot.health.toFixed(1) : 'N/A'}
Your Food: ${bot.food ? bot.food.toFixed(1) : 'N/A'}`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting server info: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      }
    }
  }
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  // 標準出力をするとサーバーのレスポンスとして解釈されてしまうので、標準エラー出力に出力する
  console.error('MCP Minecraft Remote Server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error in main():', error)
  process.exit(1)
})
