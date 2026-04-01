'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { useAudio } from '@/components/providers/AudioProvider';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROWS = 10;
const COLS = 10;
const MINES_COUNT = 10;
const CELL_SIZE = 24;

// ─── Types ────────────────────────────────────────────────────────────────────

type CellValue = number | 'mine';
interface CellState {
  value: CellValue;
  revealed: boolean;
  flagged: boolean;
}

type GameStatus = 'playing' | 'won' | 'lost';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateGrid(): CellState[][] {
  const newGrid: CellState[][] = Array(ROWS).fill(null).map(() =>
    Array(COLS).fill(null).map(() => ({
      value: 0,
      revealed: false,
      flagged: false,
    }))
  );

  // Place mines
  let placedMines = 0;
  while (placedMines < MINES_COUNT) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (newGrid[r][c].value !== 'mine') {
      newGrid[r][c].value = 'mine';
      placedMines++;
    }
  }

  // Calculate neighbors
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (newGrid[r][c].value === 'mine') continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newGrid[nr][nc].value === 'mine') {
            count++;
          }
        }
      }
      newGrid[r][c].value = count;
    }
  }
  return newGrid;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Minesweeper() {
  const [grid, setGrid] = useState<CellState[][]>(() => generateGrid());
  const [status, setStatus] = useState<GameStatus>('playing');
  const [minesLeft, setMinesLeft] = useState(MINES_COUNT);
  const [timer, setTimer] = useState(0);
  
  const posthog = usePostHog();
  const { play } = useAudio();

  // ─── Initialization ─────────────────────────────────────────────────────────

  const initGame = useCallback(() => {
    setGrid(generateGrid());
    setStatus('playing');
    setMinesLeft(MINES_COUNT);
    setTimer(0);
  }, []);

  // Timer logic
  useEffect(() => {
    if (status !== 'playing') return;
    const id = setInterval(() => {
      setTimer((t) => Math.min(t + 1, 999));
    }, 1000);
    return () => clearInterval(id);
  }, [status]);

  // ─── Game Actions ───────────────────────────────────────────────────────────

  const revealCell = (r: number, c: number) => {
    if (status !== 'playing' || grid[r][c].revealed || grid[r][c].flagged) return;

    const newGrid = [...grid.map((row) => [...row])];
    
    if (newGrid[r][c].value === 'mine') {
      // Game Over
      newGrid[r][c].revealed = true;
      // Reveal all mines
      for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
          if (newGrid[i][j].value === 'mine') newGrid[i][j].revealed = true;
        }
      }
      setGrid(newGrid);
      setStatus('lost');
      play('error');
      posthog.capture('game_played', { game: 'minesweeper', status: 'lost', score: timer });
      return;
    }

    const floodFill = (row: number, col: number) => {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS || newGrid[row][col].revealed || newGrid[row][col].flagged) return;
      
      newGrid[row][col].revealed = true;

      if (newGrid[row][col].value === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            floodFill(row + dr, col + dc);
          }
        }
      }
    };

    floodFill(r, c);
    play('click');
    setGrid(newGrid);

    // Check Win
    let revealedCount = 0;
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (newGrid[i][j].revealed) revealedCount++;
      }
    }

    if (revealedCount === ROWS * COLS - MINES_COUNT) {
      setStatus('won');
      posthog.capture('game_played', { game: 'minesweeper', status: 'won', score: timer });
    }
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (status !== 'playing' || grid[r][c].revealed) return;

    const newGrid = [...grid.map((row) => [...row])];
    const isFlagged = !newGrid[r][c].flagged;
    newGrid[r][c].flagged = isFlagged;
    setGrid(newGrid);
    setMinesLeft((prev) => prev + (isFlagged ? -1 : 1));
    play('click');
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px',
        userSelect: 'none',
        fontFamily: 'var(--font-chicago)',
      }}
    >
      {/* Header / HUD */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: COLS * CELL_SIZE,
          background: '#ddd',
          border: '2px inset #fff',
          padding: '4px 8px',
          marginBottom: '10px',
          fontFamily: 'monospace',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#000',
        }}
      >
        <div style={{ background: '#000', color: '#ff0000', padding: '0 4px', width: '40px', textAlign: 'right' }}>
          {String(Math.max(0, minesLeft)).padStart(3, '0')}
        </div>
        <button
          onClick={initGame}
          style={{
            width: '26px',
            height: '26px',
            background: '#ddd',
            border: '2px outset #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {status === 'playing' ? '🙂' : status === 'won' ? '😎' : '😵'}
        </button>
        <div style={{ background: '#000', color: '#ff0000', padding: '0 4px', width: '40px', textAlign: 'right' }}>
          {String(timer).padStart(3, '0')}
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
          border: '2px inset #fff',
          background: '#999',
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => revealCell(r, c)}
              onContextMenu={(e) => toggleFlag(e, r, c)}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'default',
                ...(cell.revealed
                  ? {
                      background: '#ddd',
                      border: '1px solid #999',
                    }
                  : {
                      background: '#ddd',
                      border: '2px outset #fff',
                    }),
              }}
            >
              {cell.revealed ? (
                cell.value === 'mine' ? (
                  '💣'
                ) : (
                  cell.value !== 0 && (
                    <span style={{ color: getNumberColor(cell.value) }}>{cell.value}</span>
                  )
                )
              ) : (
                cell.flagged && '🚩'
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getNumberColor(n: number | 'mine'): string {
  switch (n) {
    case 1: return '#0000ff';
    case 2: return '#008000';
    case 3: return '#ff0000';
    case 4: return '#000080';
    case 5: return '#800000';
    case 6: return '#008080';
    case 7: return '#000000';
    case 8: return '#808080';
    default: return '#000';
  }
}
