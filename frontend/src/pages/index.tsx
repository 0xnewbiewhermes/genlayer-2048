import { useState, useEffect, useCallback, useRef } from 'react';
import { encodeFunctionCall, readContract, CONTRACT_ADDRESS } from '../lib/genlayer';

declare const ethereum: any;

const GEN_WRITE_RPC = 'https://rpc.testnet-chain.genlayer.com';

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [grid, setGrid] = useState<number[][]>([[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const touchStart = useRef<{x: number; y: number} | null>(null);

  const connectWallet = async () => {
    if (typeof ethereum === 'undefined') {
      setMessage('Install MetaMask to play!');
      return;
    }
    try {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1079' }],
        });
      } catch (e: any) {
        if (e.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x1079',
              chainName: 'GenLayer Testnet Chain',
              nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
              rpcUrls: [GEN_WRITE_RPC],
              blockExplorerUrls: ['https://explorer.testnet-chain.genlayer.com'],
            }],
          });
        }
      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setMessage(`Connected: ${accounts[0].slice(0,6)}...${accounts[0].slice(-4)}`);
    } catch (e: any) {
      setMessage('Connection failed: ' + (e.message || e));
    }
  };

  const fetchState = useCallback(async () => {
    try {
      const state = await readContract('get_state');
      if (state && typeof state === 'object') {
        // genlayer-js SDK decode returns {grid, score, game_over, won, moves}
        if (state.grid && Array.isArray(state.grid)) {
          setGrid(state.grid);
        }
        if (typeof state.score === 'number') setScore(state.score);
        if (typeof state.game_over === 'boolean') setGameOver(state.game_over);
        if (typeof state.won === 'boolean') setWon(state.won);
        if (typeof state.moves === 'number') setMoves(state.moves);
      }
    } catch (e) {
      console.error('fetch error', e);
    }
  }, []);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 4000);
    return () => clearInterval(interval);
  }, [fetchState]);

  const sendTx = async (functionName: string, args: any[] = []) => {
    if (!ethereum || !account) { setMessage('Connect wallet first'); return; }
    try {
      const serializedData = encodeFunctionCall(functionName, args);
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ to: CONTRACT_ADDRESS, from: account, data: serializedData }],
      });
      setMessage(`Tx sent: ${txHash.slice(0,10)}... Waiting for consensus...`);
      // Wait for consensus before refreshing state
      await new Promise(r => setTimeout(r, functionName === 'init_game' ? 10000 : 5000));
      await fetchState();
      return txHash;
    } catch (e: any) {
      setMessage('Error: ' + (e.message || e));
      throw e;
    }
  };

  const startNewGame = async () => {
    setLoading(true);
    setMessage('');
    try {
      await sendTx('init_game');
      setMessage('🎮 Game started! Use arrow keys or swipe.');
    } catch (e) {
      setMessage('Error: ' + ((e as any).message || e));
    }
    setLoading(false);
  };

  const makeMove = async (direction: string) => {
    if (gameOver) { setMessage('Game over! Start a new game.'); return; }
    setLoading(true);
    try { await sendTx('move', [direction]); }
    catch (e) { /* message set by sendTx */ }
    setLoading(false);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, string> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right',
      };
      if (map[e.key]) { e.preventDefault(); makeMove(map[e.key]); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameOver, account]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) makeMove(dx > 0 ? 'right' : 'left');
    } else {
      if (Math.abs(dy) > 30) makeMove(dy > 0 ? 'down' : 'up');
    }
    touchStart.current = null;
  };

  const tileColor = (v: number) => {
    const c: Record<number, string> = {
      0: 'rgba(238,228,218,0.35)', 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179',
      16: '#f59563', 32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72',
      256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e',
    };
    return c[v] || '#3c3a32';
  };

  return (
    <div className="container">
      <div className="header">
        <h1>2048</h1>
        <span style={{ fontSize: 13, color: '#cdc1b4' }}>on GenLayer Testnet Chain</span>
        <div className="scores" style={{ marginTop: 8 }}>
          <div className="score-box">
            <div className="label">Score</div>
            <div className="value">{score}</div>
          </div>
          <div className="score-box">
            <div className="label">Moves</div>
            <div className="value">{moves}</div>
          </div>
        </div>
      </div>

      <div className="wallet-section">
        {!account ? (
          <button className="btn" onClick={connectWallet} style={{ width: '100%', background: '#8f7a66' }}>
            🦊 Connect MetaMask
          </button>
        ) : (
          <>
            <span style={{ fontSize: 12, color: '#cdc1b4', marginRight: 8 }}>
              {account.slice(0,6)}...{account.slice(-4)}
            </span>
            <button className="btn" onClick={startNewGame} disabled={loading} style={{ flex: 1 }}>
              {loading ? '⏳ Processing...' : '🎮 New Game'}
            </button>
          </>
        )}
      </div>

      {message && <p style={{ fontSize: 13, color: '#666', marginBottom: 8, textAlign: 'center' }}>{message}</p>}

      <div className="board" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ touchAction: 'none' }}>
        {grid.flat().map((val, i) => (
          <div key={i} className="cell" style={{ background: tileColor(val), color: val <= 4 ? '#776e65' : '#f9f6f2' }}>
            {val > 0 ? val : ''}
          </div>
        ))}
        {gameOver && (
          <div className="game-over-overlay">
            <h2>{won ? '🎉 You Win!' : '💀 Game Over'}</h2>
            <p>Score: {score} | Moves: {moves}</p>
            <button className="btn" onClick={startNewGame} style={{ marginTop: 12 }}>Try Again</button>
          </div>
        )}
      </div>

      <p style={{ fontSize: 12, color: '#cdc1b4', textAlign: 'center', margin: '12px 0' }}>
        ↑↓←→ or WASD or swipe · {CONTRACT_ADDRESS.slice(0,10)}...{CONTRACT_ADDRESS.slice(-6)}
      </p>
      <div style={{ fontSize: 12, color: '#cdc1b4', textAlign: 'center' }}>
        <p>Built with GenLayer Intelligent Contracts + React</p>
        <p>Add GenLayer Testnet Chain to MetaMask to play</p>
      </div>
    </div>
  );
}
