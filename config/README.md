# Configuration

## Networks

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Studio | 61999 | https://studio.genlayer.com/api | - |
| Bradbury Testnet | 4221 | https://rpc.testnet-chain.genlayer.com | https://explorer.testnet-chain.genlayer.com |

## Contract

Game2048 — Full on-chain 2048 game logic.

### Functions

| Function | Type | Description |
|----------|------|-------------|
| `init_game()` | write | Start new game, returns game_id |
| `move(game_id, direction)` | write | Make a move (up/down/left/right) |
| `get_game(game_id)` | view | Get full game state |
| `get_grid(game_id)` | view | Get current grid as 4x4 array |
| `get_score(game_id)` | view | Get current score |
| `get_game_status(game_id)` | view | Check game_over/won/moves |
| `get_player_games()` | view | List player's game IDs |
| `get_high_score(player)` | view | Get player's highest score |
| `get_leaderboard()` | view | Top 10 scores |
