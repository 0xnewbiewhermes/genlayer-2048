# 🎮 2048 on GenLayer

Full on-chain **2048 game** sebagai GenLayer Intelligent Contract. Setiap tile slide, merge, dan score di-validasi oleh **Optimistic Democracy** consensus dengan AI validators.

> ⚠️ **Educational Project** — Dibuat untuk GenLayer Builder Program. Setiap move adalah blockchain transaction (~2-3 detik per move selama validators mencapai consensus).

---

## 📋 Step-by-Step Guide

### Step 1: Buka GenLayer Studio

1. Buka [studio.genlayer.com/contracts](https://studio.genlayer.com/contracts)
2. Wallet akan otomatis tergenerate (random address)
3. **Backup private key** jika ingin menyimpan account

---

### Step 2: Fund Account (Faucet)

Sebelum deploy, butuh GEN token buat gas fee. Studio punya built-in faucet:

1. Klik icon wallet di pojok kanan atas
2. Di panel yang muncul, klik **Fund**
3. Balance akan terisi **10 GEN** ✅

---

### Step 3: Upload Contract `Game2048.py`

**Via upload file:**
1. Di sidebar kiri, klik tombol **Upload** (icon ↑)
2. Pilih file `contracts/Game2048.py` dari repo ini
3. File akan muncul di daftar contract

**Via copy-paste (alternatif):**
1. Klik tombol **"+"** atau **"New Contract"**
2. Paste kode dari `contracts/Game2048.py`
3. Beri nama file: `Game2048.py`

> 📁 File contract ada di repo: [`contracts/Game2048.py`](contracts/Game2048.py)

---

### Step 4: Deploy Contract

1. Di sidebar kiri, klik **Run & Debug** (icon ❔, urutan ke-2 dari atas)
2. Di panel Run & Debug, atur:
   - **Execution Mode**: "Normal (Full Consensus)"
   - **Contract**: Pilih `Game2048.py`
   - Status akan menunjukkan "Not deployed yet."
   - **Constructor Inputs**: kosong (`__init__()` tanpa parameter)
3. Klik **Deploy Game2048.py**

**Proses validasi:**
```
Pending → Proposing → Committing → Revealing → Accepted
```
Jika status **ACCEPTED**, contract berhasil di-deploy! 🎉

---

### Step 5: Catat Contract Address

Setelah deploy sukses, contract address akan muncul di panel. **Copy address 0x...** — lo butuh ini buat frontend.

Contoh: `0x1234...abcd`

---

### Step 6: Test Contract di Studio

Sebelum pake frontend, test dulu via Studio:

**Test `init_game`:**
1. Pilih method: `init_game`
2. Klik **Execute**
3. Lihat result — akan return game_id (contoh: `2048_abcd1234_1`)

**Test `get_game`:**
1. Pilih method: `get_game`
2. Isi `game_id` dengan ID dari init_game
3. Klik **Execute**
4. Hasil: grid 4x4, score 0, game_over false

**Test `move`:**
1. Pilih method: `move`
2. Isi `game_id` dan `direction` (contoh: "left")
3. Klik **Execute**
4. Cek `get_game` lagi — grid harus berubah

---

### Step 7: Setup & Jalankan Frontend

#### Prerequisites
- Node.js 18+ 
- npm atau pnpm
- MetaMask (untuk wallet connection penuh)

#### Install & Run

```bash
# Clone repo
git clone https://github.com/0xnewbiewhermes/genlayer-2048.git
cd genlayer-2048/frontend

# Install dependencies
npm install

# Set contract address (ganti dengan address lo)
export NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS_HERE

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

#### Cara Main
1. **Connect** — Paste contract address di input "Contract address (0x...)" → klik **Connect**
2. **Wallet (opsional)** — Klik **🦊 Wallet** untuk connect MetaMask (biar transaksi lebih real)
3. **New Game** — Klik **New Game** → tunggu ~3 detik
4. **Main** — Pake **arrow keys** (↑↓←→) atau **WASD** atau **swipe** di HP
5. Setiap move butuh ~2-3 detik — validators lagi voting!
6. **Leaderboard** — Score tertinggi otomatis tersimpan di on-chain

---

### Step 8: Deploy ke Bradbury Testnet (Production)

Biar app lo bisa dipake orang lain, deploy ke Bradbury Testnet:

**Setup MetaMask:**
| Field | Value |
|-------|-------|
| Network Name | GenLayer Bradbury |
| RPC URL | `https://rpc-bradbury.genlayer.com` |
| Chain ID | `4221` |
| Currency Symbol | `GEN` |
| Block Explorer | `https://explorer-bradbury.genlayer.com` |

Bisa juga via "Add to Wallet" di [docs.genlayer.com/developers/networks](https://docs.genlayer.com/developers/networks)

**Claim Testnet GEN:**
1. Buka [testnet-faucet.genlayer.foundation](https://testnet-faucet.genlayer.foundation)
2. Sign in with GitHub
3. Masukkan address MetaMask lo
4. Klik **Request**

**Deploy ke Bradbury via Studio:**
1. Di Studio, connect MetaMask
2. Switch network ke **GenLayer Bradbury**
3. Fund wallet (via faucet di atas)
4. Upload `Game2048.py` → Deploy (sama kayak Step 4)

**Atau via CLI:**
```bash
cd genlayer-2048
pip install -r requirements.txt
python deploy/deploy.py --network bradbury --sender 0xWALLET_ADDRESS
```

**Update frontend:**
```bash
export NEXT_PUBLIC_CONTRACT_ADDRESS=0xNEW_BRADBURY_ADDRESS
npm run dev
```

---

### Step 9: Submit ke GenLayer Portal

1. Buka [portal.genlayer.foundation](https://portal.genlayer.foundation)
2. Connect wallet (MetaMask dengan Bradbury network)
3. Klik **Submit a contribution**
4. Pilih kategori **Educational Content**
5. Upload:
   - **Link artikel**: URL repo GitHub lo: `https://github.com/0xnewbiewhermes/genlayer-2048`
   - **Deskripsi**: "2048 game implemented as on-chain Intelligent Contract on GenLayer. Game logic (slide, merge, spawn, score, game-over) runs entirely on-chain with Optimistic Democracy consensus. Includes React frontend with genlayer-js integration."
   - **Tags**: `game`, `2048`, `intelligent-contract`, `python`, `react`, `genlayer-js`
6. Klik **Submit** 🚀

---

## 🎮 Cara Main 2048

- Swipe/arrow untuk slide semua tile ke satu arah
- Tile dengan nilai sama akan merge (nilai double)
- Tile baru (90% = 2, 10% = 4) spawn setiap move
- **Buat tile 2048** untuk menang!
- Game over kalo grid penuh & gak ada tile yang bisa merge

## 📜 Smart Contract Functions

| Function | Type | Description |
|----------|------|-------------|
| `init_game()` | write | Start new game, returns game_id |
| `move(game_id, direction)` | write | Make a move (up/down/left/right) |
| `get_game(game_id)` | view | Get full game state (grid, score, status) |
| `get_grid(game_id)` | view | Get current 4x4 grid |
| `get_score(game_id)` | view | Get current score |
| `get_game_status(game_id)` | view | Check game_over/won/moves |
| `get_player_games()` | view | List player's game IDs |
| `get_high_score(player)` | view | Get player's highest score |
| `get_leaderboard()` | view | Top 10 scores on-chain |

## 🧪 Testing

```bash
python tests/test_game2048.py
```

10 test cases: slide left/right/up/down, merge, gap handling, triple tiles, game-over detection, win detection.

## 🏗 Architecture

```
User → MetaMask → Bradbury Testnet (Chain ID 4221)
                        ↓
          Game2048 Intelligent Contract (Python)
                        ↓
          Validator AI Network (Optimistic Democracy)
                        ↓
             Game State On-Chain (4x4 Grid, Score)
                        ↓
             React Frontend (genlayer-js + Wagmi)
```

## 🌐 Networks

| Network | Chain ID | RPC | Faucet |
|---------|----------|-----|--------|
| **Studio** | 61999 | `https://studio.genlayer.com/api` | Built-in (10 GEN) |
| **Bradbury** | 4221 | `https://rpc-bradbury.genlayer.com` | [Faucet](https://testnet-faucet.genlayer.foundation) |

## 🧠 Kenapa GenLayer?

- **State on-chain** — 4x4 grid sebagai GameState, transparan
- **Equivalence Principle** — Strict equality memastikan semua validator setuju
- **Random tile spawn** — Pake non-deterministic execution buat fair randomness
- **Leaderboard on-chain** — Semua score verifiable

## 📝 License

MIT
