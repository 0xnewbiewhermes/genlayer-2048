import { useState, useEffect } from 'react';
import GameBoard from '../components/GameBoard';

const DEFAULT_CONTRACT = '0xf74a806A9B0A03e3442c9e68218d29eF51885021';

function createMinimalClient(contractAddr, rpc) {
  return {
    contractAddress: contractAddr,
    rpc: rpc || 'https://rpc-bradbury.genlayer.com',
    async read(method, args = []) {
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
    async write(method, args = []) {
      const res = await fetch(this.rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_sendTransaction',
          params: [{
            to: this.contractAddress,
            data: this._encode(method, args),
          }],
          id: 1,
        }),
      });
      const data = await res.json();
      return data.result;
    },
    _encode(method, args) {
      return '0x' + method.split('').map(c => c.charCodeAt(0).toString(16)).join('');
    },
    _decode(hex) {
      if (!hex) return null;
      try {
        return JSON.parse(Buffer.from(hex.slice(2), 'hex').toString());
      } catch { return hex; }
    },
    async initGame() {
      return this.write('init_game');
    },
    async move(direction) {
      return this.write('move', [direction]);
    },
    async getState() {
      return this.read('get_state');
    },
    async getGrid() {
      return this.read('get_grid');
    },
  };
}

export default function Home() {
  const [contractAddr, setContractAddr] = useState(DEFAULT_CONTRACT);
  const [client, setClient] = useState(null);

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

  // Auto-connect on load if default address is set
  useEffect(() => {
    if (contractAddr && !client) {
      const c = createMinimalClient(contractAddr);
      setClient(c);
    }
  }, []);

  return (
    <div className="container">
      <div className="header">
        <h1>2048</h1>
        <div className="scores">
          <span style={{ fontSize: 13, color: '#cdc1b4' }}>on GenLayer Bradbury</span>
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
      </div>

      {client ? (
        <GameBoard contract={client} />
      ) : (
        <div style={{
          background: '#bbada0', borderRadius: 8, padding: 48,
          textAlign: 'center', color: 'white', marginTop: 16,
        }}>
          <h2 style={{ fontSize: 24, marginBottom: 12 }}>🎮 2048 on GenLayer</h2>
          <p>Deployed at <code>{DEFAULT_CONTRACT.slice(0,10)}...{DEFAULT_CONTRACT.slice(-6)}</code></p>
          <p style={{ fontSize: 13, marginTop: 8, opacity: 0.7 }}>
            Connect to start playing
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
