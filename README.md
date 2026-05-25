# 🎮 2048 on GenLayer

Full on-chain **2048 game** as GenLayer Intelligent Contract. Setiap tile slide, merge, dan score di-validasi oleh **Optimistic Democracy** consensus dengan AI validators.

**🔗 Live Demo: [https://frontend-two-gray-16.vercel.app](https://frontend-two-gray-16.vercel.app)**

## Cara Main

1. Buka [Live Demo](https://frontend-two-gray-16.vercel.app)
2. Klik **Connect MetaMask** → switch ke **GenLayer Testnet Chain** (otomatis)
3. Klik **New Game** → confirm transaksi MetaMask
4. Main pake ↑↓←→ atau WASD atau swipe

## 🚀 Deploy Contract ke Testnet Chain

Contract perlu di-deploy ke **GenLayer Testnet Chain** (Chain ID: 4221).

### Option A: Via MetaMask (recommended)

1. Buka [Explorer](https://explorer.testnet-chain.genlayer.com)
2. Dapatkan GEN dari faucet (via Portal/Studio)
3. Buka MetaMask → switch ke GenLayer Testnet Chain
4. Settings → Advanced → **Show hex data**
5. Kirim transaksi custom:
   - **To**: `0x0000000000000000000000000000000000000000`
   - **Data**: (generate dengan script di bawah)
   - **Value**: `0`

**Generate deploy hex data:**
```bash
cd frontend
node ../deploy/generate-deploy-hex.js --tx
```

Copy output JSON ke MetaMask.

### Option B: Via Studio + SDK

1. Upload `contracts/Game2048.py` ke [Studio](https://studio.genlayer.com/contracts)
2. Deploy di Studio (chain 61999 — testing aja)
3. Untuk produksi, deploy ulang ke Testnet Chain via script di atas

## Contract Address

| Network | Chain ID | RPC | Contract |
|---------|----------|-----|----------|
| **Studio** | 61999 | `https://studio.genlayer.com/api` | *(deploy sendiri)* |
| **Testnet Chain** | 4221 | `https://rpc.testnet-chain.genlayer.com` | `0xf74a806A9B0A03e3442c9e68218d29eF51885021` (WIP) |

> **⚠️ Contract address di atas perlu di-redeploy** — contract sebelumnya cuma ada di Studio chain.

## 🧱 Architecture

```
User → React Frontend → GenLayer Testnet Chain (4221)
                          ↓
              Game2048 Intelligent Contract
                          ↓
                Validator AI Network (OD)
                          ↓
                  Game State On-Chain
```

## 📜 Smart Contract Functions

| Function | Type | Description |
|----------|------|-------------|
| `init_game()` | write | Init grid dengan 2 tile awal |
| `move(direction)` | write | Geser tile (up/down/left/right) |
| `get_state()` | view | Grid, score, game_over, won, moves |
| `get_grid()` | view | Grid 4x4 aja |

## 🌐 Networks

- **Testnet Chain**: Chain ID 4221, RPC `https://rpc.testnet-chain.genlayer.com`
- **Bradbury (read)**: RPC `https://rpc-bradbury.genlayer.com` (supports `gen_call`)
- **Studio**: Chain ID 61999, RPC `https://studio.genlayer.com/api`

## 🚀 Submit ke GenLayer Portal

1. Buka [portal.genlayer.foundation](https://portal.genlayer.foundation)
2. Connect wallet → **Submit Contribution**
3. Isi:
   - **Kategori**: Project Contribution
   - **Link repo**: `https://github.com/0xnewbiewhermes/genlayer-2048`
   - **Deskripsi**: "2048 game as an on-chain Intelligent Contract on GenLayer. All game logic runs on-chain (slide, merge, score, win/loss detection) with Optimistic Democracy consensus. Includes React frontend."
   - **Tags**: `game` `2048` `intelligent-contract` `python` `react`

## 📝 License

MIT
