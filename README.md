# 🎮 2048 on GenLayer

Full on-chain **2048 game** built as a GenLayer Intelligent Contract. Every tile slide, merge, and score update is validated by **Optimistic Democracy** consensus with AI validators.

> ⚠️ **Educational Project** — Built for the GenLayer Builder Program. Each move is a blockchain transaction, so there's ~2-3 second latency per move while validators reach consensus.

## 🏗 Architecture

```
User → MetaMask → Bradbury Testnet (Chain ID 4221)
                        ↓
          Game2048 Intelligent Contract (Python)
                        ↓
          Validator AI Network (Optimistic Democracy)
                        ↓
             Game State On-Chain (4x4 Grid)
                        ↓
             React Frontend (genlayer-js SDK)
```

### Components

| Component | Tech | Description |
|-----------|------|-------------|
| **Contract** | Python + genlayer-py | Full game logic: slide, merge, spawn, score, game-over detection |
| **Frontend** | Next.js 15 + genlayer-js | 4x4 grid UI, keyboard/touch controls, wallet connection |
| **Consensus** | Optimistic Democracy | Every move is validated by multiple AI validators |
| **Storage** | GenLayer TreeMap | Game state, high scores, leaderboard |

## 🚀 Quick Start

### 1. Deploy Contract

**Via Studio (fastest):**
```bash
# Go to studio.genlayer.com
# Upload contracts/Game2048.py
# Fund with faucet → Deploy
```

**Via CLI:**
```bash
pip install -r requirements.txt
python deploy/deploy.py --network studio
```

**Via Bradbury Testnet:**
```bash
python deploy/deploy.py --network bradbury --sender 0xYOUR_ADDRESS
```

### 2. Frontend

```bash
cd frontend
npm install

# Set contract address
export NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS

npm run dev
# Open http://localhost:3000
```

## 🎮 How to Play

1. **Connect** — Enter contract address and connect wallet
2. **New Game** — Click "New Game" to start on-chain
3. **Play** — Use arrow keys, WASD, or swipe on mobile
4. **Score** — Each merge adds to your score on-chain
5. **Leaderboard** — Top 10 scores stored transparently

### Rules

- Swipe to slide all tiles in one direction
- Same-value tiles merge into one (value doubles)
- New tile (90% = 2, 10% = 4) spawns after each move
- Create a **2048 tile** to win!
- Game ends when grid is full with no possible merges

## 📜 Smart Contract Functions

| Function | Type | Description |
|----------|------|-------------|
| `init_game()` | write | Start new game, returns game_id |
| `move(game_id, direction)` | write | Make a move (up/down/left/right) |
| `get_game(game_id)` | view | Get full game state |
| `get_grid(game_id)` | view | Get current 4x4 grid |
| `get_score(game_id)` | view | Get current score |
| `get_game_status(game_id)` | view | Check game_over/won/moves |
| `get_player_games()` | view | List your game IDs |
| `get_high_score(player)` | view | Get player's best score |
| `get_leaderboard()` | view | Top 10 scores |

## 🔧 Testing

```bash
python tests/test_game2048.py
```

Tests cover: left/right/up/down slides, merges, gap handling, triple tiles, game-over detection, win detection.

## 🌐 Networks

| Network | Chain ID | RPC | Faucet |
|---------|----------|-----|--------|
| **Studio** | 61999 | `https://studio.genlayer.com/api` | Built-in (10 GEN) |
| **Bradbury Testnet** | 4221 | `https://rpc-bradbury.genlayer.com` | [Faucet](https://testnet-faucet.genlayer.foundation) |

## 🧠 Why GenLayer?

2048 on GenLayer showcases:
- **State management** — 4x4 grid stored as on-chain state
- **Deterministic game logic** — Pure Python functions with predictable output
- **Equivalence Principle** — Strict equality consensus ensures all validators agree on game state
- **Random tile spawning** — Uses GenLayer's non-deterministic execution for fair randomness
- **Transparent leaderboard** — All scores verifiable on-chain

## 📝 License

MIT
