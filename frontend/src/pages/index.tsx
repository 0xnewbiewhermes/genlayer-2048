import { useState, useEffect } from 'react';
import GameBoard from '../components/GameBoard';

// Minimal genlayer-js client setup
// In production, use full genlayer-js SDK
function createMinimalClient(contractAddr, rpc) {
  return {
    contractAddress: contractAddr,
    rpc: rpc || 'https://rpc-bradbury.genlayer.com',
    async call(method, args = []) {
      const res = await fetch(this.rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: this.contractAddress,
            data: this._encode(method, args),
          }, 'latest'],
          id: 1,
        }),
      });
      const data = await res.json();
      return this._decode(data.result);
    },
    _encode(method, args) {
      // Simplified encoding - in production use genlayer-js SDK
      return '0x' + method.split('').map(c => c.charCodeAt(0).toString(16)).join('');
    },
    _decode(hex) {
      if (!hex) return null;
      try {
        return JSON.parse(Buffer.from(hex.slice(2), 'hex').toString());
      } catch { return hex; }
    },
    // Direct genlayer-js style methods
    async initGame() {
      return this.call('init_game');
    },
    async move(gameId, direction) {
      return this.call('move', [gameId, direction]);
    },
    async getGame(gameId) {
      return this.call('get_game', [gameId]);
    },
    async getPlayerGames() {
      return this.call('get_player_games');
    },
    async getLeaderboard() {
      return this.call('get_leaderboard');
    },
  };
}

export default function Home() {
  const [contractAddr, setContractAddr] = useState('');
  const [client, setClient] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState('');

  // Try reading from env / localStorage
  useEffect(() => {
    const saved = localStorage.getItem('genlayer2048_contract');
    if (saved) setContractAddr(saved);
  }, []);

  const connectContract = () => {
    if (!contractAddr || !contractAddr.startsWith('0x')) {
      alert('Enter a valid contract address (0x...)');
      return;
    }
    const c = createMinimalClient(contractAddr);
    setClient(c);
    localStorage.setItem('genlayer2048_contract', contractAddr);
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setWalletConnected(true);
      } catch (e) {
        alert('Wallet connection failed');
      }
    } else {
      alert('Install MetaMask to use full features');
      setWalletConnected(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>2048</h1>
        <div className="scores">
          <span style={{ fontSize: 13, color: '#cdc1b4' }}>on GenLayer</span>
        </div>
      </div>

      {/* Contract Setup */}
      <div className="wallet-section">
        <input
          placeholder="Contract address (0x...)"
          value={contractAddr}
          onChange={(e) => setContractAddr(e.target.value)}
        />
        <button className="btn" onClick={connectContract}>
          Connect
        </button>
        <button className="btn" onClick={connectWallet} style={{ background: walletConnected ? '#22c55e' : '#8f7a66' }}>
          {walletConnected ? `✓ ${account.slice(0,6)}...` : '🦊 Wallet'}
        </button>
      </div>

      {client ? (
        <GameBoard contract={client} />
      ) : (
        <div style={{
          background: '#bbada0', borderRadius: 8, padding: 48,
          textAlign: 'center', color: 'white', marginTop: 16,
        }}>
          <h2 style={{ fontSize: 24, marginBottom: 12 }}>🎮 2048 on GenLayer</h2>
          <p>Enter the contract address above to start playing</p>
          <p style={{ fontSize: 13, marginTop: 8, opacity: 0.7 }}>
            Deploy Game2048.py to Bradbury Testnet first
          </p>
        </div>
      )}

      <div style={{ marginTop: 20, fontSize: 12, color: '#cdc1b4', textAlign: 'center' }}>
        <p>Built with GenLayer Intelligent Contracts + React</p>
        <p>Each move is validated by Optimistic Democracy consensus</p>
      </div>
    </div>
  );
}
