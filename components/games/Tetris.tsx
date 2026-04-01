'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { useAudio } from '@/components/providers/AudioProvider';
import { useIsMobile } from '@/hooks/useIsMobile';

const COLS    = 10;
const ROWS    = 20;
const CELL    = 14;
const W       = COLS * CELL;   // 140
const H       = ROWS * CELL;   // 280
const SIDE_W  = 90;
const CANVAS_W = W + SIDE_W;

const PIECES: number[][][] = [
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  [[1,1],[1,1]],
  [[0,1,0],[1,1,1],[0,0,0]],
  [[0,1,1],[1,1,0],[0,0,0]],
  [[1,1,0],[0,1,1],[0,0,0]],
  [[1,0,0],[1,1,1],[0,0,0]],
  [[0,0,1],[1,1,1],[0,0,0]],
];

const FILLS = ['#000','#000','#000','#444','#444','#666','#666'];

function rotatePiece(p: number[][]): number[][] {
  const rows = p.length, cols = p[0].length;
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => p[rows - 1 - r][c])
  );
}

type Phase = 'idle' | 'playing' | 'over';
type Board = (number | null)[][];

function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

interface Piece { shape: number[][]; x: number; y: number; type: number; }

function spawnPiece(type: number): Piece {
  const shape = PIECES[type];
  return { shape, x: Math.floor((COLS - shape[0].length) / 2), y: 0, type };
}

function fits(board: Board, shape: number[][], x: number, y: number): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nr = y + r, nc = x + c;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return false;
      if (board[nr][nc] !== null) return false;
    }
  }
  return true;
}

function place(board: Board, piece: Piece): Board {
  const next = board.map(r => [...r]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) next[piece.y + r][piece.x + c] = piece.type;
    }
  }
  return next;
}

function clearLines(board: Board): { board: Board; lines: number } {
  const kept = board.filter(row => row.some(cell => cell === null));
  const cleared = ROWS - kept.length;
  const empty = Array.from({ length: cleared }, () => Array(COLS).fill(null));
  return { board: [...empty, ...kept], lines: cleared };
}

function ghostY(board: Board, piece: Piece): number {
  let y = piece.y;
  while (fits(board, piece.shape, piece.x, y + 1)) y++;
  return y;
}

const LINE_SCORES = [0, 100, 300, 500, 800];

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size = 9, align: CanvasTextAlign = 'left') {
  ctx.font = `bold ${size}px "ChicagoFLF","Press Start 2P",monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function draw(ctx: CanvasRenderingContext2D, board: Board, piece: Piece | null, next: number, score: number, lines: number, level: number, phase: Phase) {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, CANVAS_W, H);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, W, H);

  if (phase === 'idle') {
    ctx.fillStyle = '#000';
    drawText(ctx, 'TETRIS', W / 2, H / 2 - 22, 12, 'center');
    drawText(ctx, 'Press any key', W / 2, H / 2 + 4, 8, 'center');
    drawText(ctx, 'to start', W / 2, H / 2 + 18, 8, 'center');
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if ((r + c) % 2 === 0) ctx.fillRect(c * CELL, r * CELL, 1, 1);
    }
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const t = board[r][c];
        if (t === null) continue;
        ctx.fillStyle = FILLS[t];
        ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
      }
    }
    if (piece) {
      const gy = ghostY(board, piece);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) ctx.fillRect((piece.x + c) * CELL + 1, (gy + r) * CELL + 1, CELL - 2, CELL - 2);
        }
      }
      ctx.fillStyle = FILLS[piece.type];
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) ctx.fillRect((piece.x + c) * CELL + 1, (piece.y + r) * CELL + 1, CELL - 2, CELL - 2);
        }
      }
    }
  }

  const sx = W + 6;
  ctx.fillStyle = '#000';
  drawText(ctx, 'SCORE', sx, 16, 8);
  drawText(ctx, String(score), sx, 30, 8);
  drawText(ctx, 'LINES', sx, 52, 8);
  drawText(ctx, String(lines), sx, 66, 8);
  drawText(ctx, 'LEVEL', sx, 88, 8);
  drawText(ctx, String(level), sx, 102, 8);
  drawText(ctx, 'NEXT', sx, 126, 8);
  if (phase === 'playing') {
    const shape = PIECES[next];
    const previewX = W + (SIDE_W - shape[0].length * CELL) / 2;
    ctx.fillStyle = FILLS[next];
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) ctx.fillRect(previewX + c * CELL, 138 + r * CELL, CELL - 2, CELL - 2);
      }
    }
  }
  if (phase === 'over') {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#000';
    drawText(ctx, 'GAME OVER', W / 2, H / 2 - 16, 10, 'center');
    drawText(ctx, `Score: ${score}`, W / 2, H / 2 + 6, 8, 'center');
    drawText(ctx, 'Press any key', W / 2, H / 2 + 24, 7, 'center');
  }
}

export default function Tetris() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const posthog    = usePostHog();
  const { play }   = useAudio();
  const isMobile   = useIsMobile();

  const [phase, setPhase] = useState<Phase>('idle');
  const phaseRef   = useRef<Phase>('idle');
  const boardRef   = useRef<Board>(emptyBoard());
  const pieceRef   = useRef<Piece | null>(null);
  const nextRef    = useRef<number>(0);
  const scoreRef   = useRef(0);
  const linesRef   = useRef(0);
  const levelRef   = useRef(1);
  const rafRef     = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  const redraw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) draw(ctx, boardRef.current, pieceRef.current, nextRef.current, scoreRef.current, linesRef.current, levelRef.current, phaseRef.current);
  }, []);

  const spawnNext = useCallback(() => {
    const type = nextRef.current;
    nextRef.current = Math.floor(Math.random() * PIECES.length);
    const p = spawnPiece(type);
    if (!fits(boardRef.current, p.shape, p.x, p.y)) {
      phaseRef.current = 'over';
      setPhase('over');
      posthog.capture('game_played', { game: 'tetris', score: scoreRef.current, lines: linesRef.current });
      cancelAnimationFrame(rafRef.current);
      redraw();
      return;
    }
    pieceRef.current = p;
  }, [posthog, redraw]);

  const lockPiece = useCallback(() => {
    if (!pieceRef.current) return;
    const newBoard = place(boardRef.current, pieceRef.current);
    const { board, lines } = clearLines(newBoard);
    boardRef.current = board;
    if (lines > 0) {
      linesRef.current += lines;
      scoreRef.current += LINE_SCORES[lines] * levelRef.current;
      levelRef.current = Math.floor(linesRef.current / 10) + 1;
      play('crunch');
    }
    pieceRef.current = null;
    spawnNext();
  }, [play, spawnNext]);

  const tickRef = useRef<(ts: number) => void>(() => {});

  useEffect(() => {
    tickRef.current = (ts: number) => {
      if (phaseRef.current !== 'playing') return;
      rafRef.current = requestAnimationFrame(tickRef.current);
      if (document.visibilityState === 'hidden') return;
      const interval = Math.max(100, 700 - (levelRef.current - 1) * 60);
      if (ts - lastTickRef.current >= interval) {
        lastTickRef.current = ts;
        const p = pieceRef.current;
        if (p) {
          if (fits(boardRef.current, p.shape, p.x, p.y + 1)) {
            pieceRef.current = { ...p, y: p.y + 1 };
          } else {
            lockPiece();
          }
        }
      }
      redraw();
    };
  }, [lockPiece, redraw]);

  useEffect(() => {
    nextRef.current = Math.floor(Math.random() * PIECES.length);
    redraw();
    wrapRef.current?.focus();
  }, [redraw]);

  useEffect(() => {
    if (phase === 'playing') {
      lastTickRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tickRef.current);
      return () => cancelAnimationFrame(rafRef.current);
    }
  }, [phase]);

  const startGame = useCallback(() => {
    boardRef.current = emptyBoard();
    scoreRef.current = 0;
    linesRef.current = 0;
    levelRef.current = 1;
    nextRef.current = Math.floor(Math.random() * PIECES.length);
    pieceRef.current = null;
    lastTickRef.current = 0;
    phaseRef.current = 'playing';
    setPhase('playing');
    spawnNext();
  }, [spawnNext]);

  const moveLeft = useCallback(() => {
    const p = pieceRef.current;
    if (p && fits(boardRef.current, p.shape, p.x - 1, p.y)) { pieceRef.current = { ...p, x: p.x - 1 }; redraw(); }
  }, [redraw]);

  const moveRight = useCallback(() => {
    const p = pieceRef.current;
    if (p && fits(boardRef.current, p.shape, p.x + 1, p.y)) { pieceRef.current = { ...p, x: p.x + 1 }; redraw(); }
  }, [redraw]);

  const moveDown = useCallback(() => {
    const p = pieceRef.current;
    if (p) {
      if (fits(boardRef.current, p.shape, p.x, p.y + 1)) { pieceRef.current = { ...p, y: p.y + 1 }; scoreRef.current += 1; lastTickRef.current = performance.now(); redraw(); }
      else { lockPiece(); }
    }
  }, [lockPiece, redraw]);

  const rotate = useCallback(() => {
    const p = pieceRef.current;
    if (p) {
      const rotated = rotatePiece(p.shape);
      if (fits(boardRef.current, rotated, p.x, p.y)) { pieceRef.current = { ...p, shape: rotated }; play('click'); redraw(); }
    }
  }, [play, redraw]);

  const hardDrop = useCallback(() => {
    const p = pieceRef.current;
    if (p) {
      const gy = ghostY(boardRef.current, p);
      scoreRef.current += (gy - p.y) * 2;
      pieceRef.current = { ...p, y: gy };
      lockPiece();
      play('click');
      redraw();
    }
  }, [lockPiece, play, redraw]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (phaseRef.current === 'idle' || phaseRef.current === 'over') { if (!['Shift','Control','Alt','Meta','Tab'].includes(e.key)) startGame(); return; }
    if (phaseRef.current !== 'playing') return;
    if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].includes(e.key)) e.preventDefault();
    if (e.key === 'ArrowLeft') moveLeft();
    if (e.key === 'ArrowRight') moveRight();
    if (e.key === 'ArrowDown') moveDown();
    if (e.key === 'ArrowUp' || e.key === 'x' || e.key === 'X') rotate();
    if (e.key === ' ') hardDrop();
  }, [startGame, moveLeft, moveRight, moveDown, rotate, hardDrop]);

  return (
    <div ref={wrapRef} tabIndex={0} onKeyDown={handleKeyDown} onPointerDown={() => { if (phaseRef.current === 'idle' || phaseRef.current === 'over') startGame(); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', outline: 'none', userSelect: 'none', padding: 4 }} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) e.currentTarget.focus({ preventScroll: true }); }}>
      <canvas ref={canvasRef} width={CANVAS_W} height={H} style={{ border: '1px solid #000', imageRendering: 'pixelated', display: 'block' }} aria-label="Tetris game" />
      {!isMobile ? (
        <div style={{ marginTop: 4, fontFamily: 'var(--font-chicago)', fontSize: 8, color: '#555' }}>Arrows: move/rotate  Space: drop</div>
      ) : (
        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(3, 40px)', gap: 8 }}>
           <button style={btnStyle} onPointerDown={(e) => { e.stopPropagation(); rotate(); }}>ROT</button>
           <button style={btnStyle} onPointerDown={(e) => { e.stopPropagation(); moveDown(); }}>DN</button>
           <button style={btnStyle} onPointerDown={(e) => { e.stopPropagation(); hardDrop(); }}>DRP</button>
           <button style={btnStyle} onPointerDown={(e) => { e.stopPropagation(); moveLeft(); }}>L</button>
           <div />
           <button style={btnStyle} onPointerDown={(e) => { e.stopPropagation(); moveRight(); }}>R</button>
        </div>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = { background: '#fff', border: '1px solid #000', fontFamily: 'var(--font-chicago)', fontSize: 10, padding: '8px 0', cursor: 'pointer', boxShadow: '1px 1px 0 #000' };
