import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 4;
const TILE_COLORS = {
  0: 'rgba(238,228,218,0.35)',
  2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
  32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
  512: '#edc850', 1024: '#edc53f', 2048: '#edc22e',
};

export default function GameBoard({ contract }) {
  const [grid, setGrid] = useState([[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchState = useCallback(async () => {
    if (!contract) return;
    try {
      const data = await contract.getState();
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

  // Poll game state every 3 seconds
  useEffect(() => {
    if (!contract) return;
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, [contract, fetchState]);

  const startNewGame = async () => {
    if (!contract) {
      setMessage('Connect contract first');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      await contract.initGame();
      await new Promise(r => setTimeout(r, 3000));
      await fetchState();
      setMessage('New game started!');
    } catch (e) {
      setMessage('Error: ' + (e.message || e));
    }
    setLoading(false);
  };

  const makeMove = async (direction) => {
    if (!contract) {
      setMessage('Connect contract first');
      return;
    }
    if (gameOver) {
      setMessage('Game over! Start a new game.');
      return;
    }
    setLoading(true);
    try {
      await contract.move(direction);
      await new Promise(r => setTimeout(r, 2000));
      await fetchState();
    } catch (e) {
      setMessage('Error: ' + (e.message || e));
    }
    setLoading(false);
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
  }, [gameOver, contract, loading]);

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
      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
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
    </div>
  );
}
