import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 4;
const TILE_COLORS = {
  0: 'rgba(238,228,218,0.35)',
  2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
  32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
  512: '#edc850', 1024: '#edc53f', 2048: '#edc22e',
};

export default function GameBoard({ contract }) {
  const [gameId, setGameId] = useState(null);
  const [grid, setGrid] = useState([[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [leaderboard, setLeaderboard] = useState({});
  const [contractAddress, setContractAddress] = useState(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''
  );
  const gameIdInput = useRef(null);

  const fetchGame = useCallback(async (gid) => {
    if (!contract || !gid) return;
    try {
      const data = await contract.getGame(gid);
      if (data && data.grid) {
        setGrid(data.grid);
        setScore(data.score);
        setGameOver(data.game_over);
        setWon(data.won);
        setMoves(data.moves);
      }
    } catch (e) {
      console.error('fetch error', e);
    }
  }, [contract]);

  // Poll game state every 3 seconds if game is active
  useEffect(() => {
    if (!gameId || !contract) return;
    const interval = setInterval(() => fetchGame(gameId), 3000);
    return () => clearInterval(interval);
  }, [gameId, contract, fetchGame]);

  const startNewGame = async () => {
    if (!contract) {
      setMessage('Connect wallet or set contract address first');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const result = await contract.initGame();
      // Wait for tx to confirm, then fetch game id
      await new Promise(r => setTimeout(r, 3000));
      // Get player games to find latest
      const games = await contract.getPlayerGames();
      if (games && games.length > 0) {
        const latest = games[games.length - 1];
        setGameId(latest);
        gameIdInput.current.value = latest;
        await fetchGame(latest);
        setMessage('New game started!');
      }
    } catch (e) {
      setMessage('Error: ' + (e.message || e));
    }
    setLoading(false);
  };

  const makeMove = async (direction) => {
    if (!gameId || !contract) {
      setMessage('Start a game first');
      return;
    }
    if (gameOver) {
      setMessage('Game over! Start a new game.');
      return;
    }
    setLoading(true);
    try {
      await contract.move(gameId, direction);
      await new Promise(r => setTimeout(r, 2000)); // wait for consensus
      await fetchGame(gameId);

      // Refresh leaderboard
      try {
        const lb = await contract.getLeaderboard();
        setLeaderboard(lb || {});
      } catch (_) {}
    } catch (e) {
      setMessage('Error: ' + (e.message || e));
    }
    setLoading(false);
  };

  const loadGame = async () => {
    const gid = gameIdInput.current?.value;
    if (!gid) return;
    setGameId(gid);
    await fetchGame(gid);
    setMessage('Game loaded!');
  };

  const refreshLeaderboard = async () => {
    if (!contract) return;
    try {
      const lb = await contract.getLeaderboard();
      setLeaderboard(lb || {});
    } catch (e) {
      console.error(e);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handler = (e) => {
      const dirMap = {
        ArrowUp: 'up', ArrowDown: 'down',
        ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right',
      };
      if (dirMap[e.key]) {
        e.preventDefault();
        makeMove(dirMap[e.key]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameId, gameOver, contract, loading]);

  // Touch/swipe support
  const touchStart = useRef(null);
  const handleTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const minDist = 30;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > minDist) makeMove(dx > 0 ? 'right' : 'left');
    } else {
      if (Math.abs(dy) > minDist) makeMove(dy > 0 ? 'down' : 'up');
    }
    touchStart.current = null;
  };

  return (
    <div>
      {/* Contract Address */}
      <div className="wallet-section">
        <input
          ref={gameIdInput}
          placeholder="Game ID (optional)"
          style={{ flex: '0 0 auto', width: '160px' }}
        />
        <button className="btn" onClick={loadGame}>Load</button>
        <button className="btn" onClick={startNewGame} disabled={loading}>
          {loading ? 'Processing...' : 'New Game'}
        </button>
      </div>

      {/* Score + Moves */}
      <div className="scores" style={{ marginBottom: 12 }}>
        <div className="score-box">
          <div className="label">Score</div>
          <div className="value">{score}</div>
        </div>
        <div className="score-box">
          <div className="label">Moves</div>
          <div className="value">{moves}</div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>{message}</p>
      )}

      {/* Board */}
      <div
        className="board"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        {grid.flat().map((val, i) => (
          <div key={i} className="cell" data-value={val}>
            {val > 0 ? val : ''}
          </div>
        ))}
        {gameOver && (
          <div className="game-over-overlay">
            <h2>{won ? '🎉 You Win!' : 'Game Over'}</h2>
            <p>Score: {score} | Moves: {moves}</p>
            <button className="btn" onClick={startNewGame} style={{ marginTop: 12 }}>
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Controls help */}
      <p style={{ fontSize: 12, color: '#cdc1b4', textAlign: 'center', marginBottom: 16 }}>
        Arrow keys or swipe to move &middot; WASD also works
      </p>

      {/* Leaderboard */}
      <div className="leaderboard">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>🏆 Leaderboard</h3>
          <button className="btn" onClick={refreshLeaderboard} style={{ padding: '6px 12px', fontSize: 12 }}>
            Refresh
          </button>
        </div>
        {Object.keys(leaderboard).length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(leaderboard).slice(0, 10).map(([addr, sc], i) => (
                <tr key={addr}>
                  <td>{i + 1}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {addr.slice(0, 6)}...{addr.slice(-4)}
                  </td>
                  <td>{sc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ fontSize: 13, color: '#cdc1b4' }}>No scores yet. Start playing!</p>
        )}
      </div>
    </div>
  );
}
