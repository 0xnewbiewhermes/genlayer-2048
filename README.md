# 🎮 2048 on GenLayer

Full on-chain **2048 game** sebagai GenLayer Intelligent Contract. Setiap tile slide, merge, dan score di-validasi oleh **Optimistic Democracy** consensus dengan AI validators.

Contract terdeploy di **Studio**: `0xf74a806A9B0A03e3442c9e68218d29eF51885021`

---

## 📋 Step-by-Step Guide

### Step 1: Deploy Contract ke Studio

1. Buka [studio.genlayer.com/contracts](https://studio.genlayer.com/contracts)
2. Upload `contracts/Game2048.py`
3. Klik **Deploy** → tunggu status **ACCEPTED**
4. Catat contract address yang muncul

---

### Step 2: Test Contract di Studio

**Test `init_game`:** Atur grid awal dengan tile [2] di (0,0) dan (1,1)
**Test `get_state`:** Lihat grid, score, game_over status
**Test `move("left")`:** Tile geser ke kiri, merge
**Test `get_state` lagi:** Cek perubahan grid & score

---

### Step 3: Jalankan Frontend

```bash
cd frontend
npm install
export NEXT_PUBLIC_CONTRACT_ADDRESS=0xf74a806A9B0A03e3442c9e68218d29eF51885021
npm run dev
```

Buka http://localhost:3000 — langsung Connect & main!

---

## 📜 Smart Contract Functions

| Function | Type | Description |
|----------|------|-------------|
| `init_game()` | write | Init grid dengan 2 tile awal |
| `move(direction)` | write | Geser tile (up/down/left/right) |
| `get_state()` | view | Grid, score, game_over, won, moves |
| `get_grid()` | view | Grid 4x4 aja |

## 🧪 Testing

```bash
python tests/test_game2048.py
```
10 test cases: slide left/right/up/down, merge, gap, triple, game-over, win.

## 🏗 Architecture

```
User → React Frontend → GenLayer Studio (Chain 61999)
                          ↓
              Game2048 Intelligent Contract
                          ↓
                Validator AI Network (OD)
                          ↓
                  Game State On-Chain
```

## 🌐 Networks

| Network | Chain ID | RPC | Contract |
|---------|----------|-----|----------|
| **Studio** | 61999 | `https://studio.genlayer.com/api` | `0xf74a806A9B0A03e3442c9e68218d29eF51885021` |
| **Bradbury** | 4221 | `https://rpc-bradbury.genlayer.com` | *(deploy sendiri)* |

---

## 🚀 Submit ke GenLayer Portal

1. Buka [portal.genlayer.foundation](https://portal.genlayer.foundation)
2. Connect wallet → **Submit a contribution**
3. Pilih kategori:
   - **Project Contribution** → link repo GitHub
   - **Deskripsi**: "2048 game as an on-chain Intelligent Contract on GenLayer. All game logic runs on-chain (slide, merge, score, win/loss detection) with Optimistic Democracy consensus. Includes React frontend."
   - **Tags**: `game`, `2048`, `intelligent-contract`, `python`, `react`

## 📝 License

MIT
