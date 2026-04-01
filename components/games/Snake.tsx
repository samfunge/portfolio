'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { usePostHog } from 'posthog-js/react';
import { useAudio } from '@/components/providers/AudioProvider';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLS        = 20;
const ROWS        = 20;
const CELL        = 13;          // px per grid cell
const CANVAS_W    = COLS * CELL; // 260
const CANVAS_H    = ROWS * CELL; // 260
const BASE_TICK   = 160;         // ms between moves at score 0
const MIN_TICK    = 80;          // fastest the game gets
const SPEED_STEP  = 5;           // score points before each speedup
const LS_KEY      = 'mac-snake-highscore';

// ─── Types ────────────────────────────────────────────────────────────────────

type Dir = 'U' | 'D' | 'L' | 'R';
interface Pt { x: number; y: number; }
type Phase = 'idle' | 'playing' | 'dead';

// Directions that are illegal to reverse into
const OPPOSITE: Record<Dir, Dir> = { U: 'D', D: 'U', L: 'R', R: 'L' };

const DIR_DELTA: Record<Dir, Pt> = {
  U: { x:  0, y: -1 },
  D: { x:  0, y:  1 },
  L: { x: -1, y:  0 },
  R: { x:  1, y:  0 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomFood(snake: Pt[]): Pt {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));
  let pt: Pt;
  do {
    pt = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (occupied.has(`${pt.x},${pt.y}`));
  return pt;
}

function loadHighScore(): number {
  try { return parseInt(localStorage.getItem(LS_KEY) ?? '0', 10) || 0; }
  catch { return 0; }
}

function saveHighScore(score: number) {
  try { localStorage.setItem(LS_KEY, String(score)); }
  catch { /* private browsing */ }
}

// ─── 1-bit canvas renderer ────────────────────────────────────────────────────

function render(
  ctx: CanvasRenderingContext2D,
  snake: Pt[],
  food: Pt,
  phase: Phase,
  score: number,
  highScore: number,
) {
  // Background
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Grid — very faint dither dots
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      if ((x + y) % 2 === 0) {
        ctx.fillRect(x * CELL, y * CELL, 1, 1);
      }
    }
  }

  if (phase === 'idle') {
    drawIdle(ctx);
    return;
  }

  // Food — black square with inverted centre dot
  ctx.fillStyle = '#000';
  ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);
  ctx.fillStyle = '#fff';
  ctx.fillRect(food.x * CELL + 5, food.y * CELL + 5, 3, 3);

  // Snake body
  ctx.fillStyle = '#000';
  for (let i = 1; i < snake.length; i++) {
    const { x, y } = snake[i];
    ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
  }

  // Snake head — slightly larger fill + white pixel eyes
  const head = snake[0];
  ctx.fillStyle = '#000';
  ctx.fillRect(head.x * CELL, head.y * CELL, CELL, CELL);
  // Eyes — two white pixels offset by direction
  ctx.fillStyle = '#fff';
  ctx.fillRect(head.x * CELL + 3, head.y * CELL + 3, 2, 2);
  ctx.fillRect(head.x * CELL + 8, head.y * CELL + 3, 2, 2);

  // Dead overlay
  if (phase === 'dead') {
    drawDead(ctx, score, highScore);
  }
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size = 10,
  align: CanvasTextAlign = 'center',
) {
  ctx.font = `bold ${size}px "ChicagoFLF", "Press Start 2P", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function drawIdle(ctx: CanvasRenderingContext2D) {
  // Centred title card — white box with border
  const bx = 30, by = 80, bw = CANVAS_W - 60, bh = 100;
  ctx.fillStyle = '#fff';
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx, by, bw, bh);

  ctx.fillStyle = '#000';
  drawText(ctx, 'SNAKE', CANVAS_W / 2, by + 28, 14);
  drawText(ctx, '— for Mac —', CANVAS_W / 2, by + 52, 8);
  drawText(ctx, 'Press any key', CANVAS_W / 2, by + 74, 8);
  drawText(ctx, 'to start', CANVAS_W / 2, by + 88, 8);
}

function drawDead(
  ctx: CanvasRenderingContext2D,
  score: number,
  highScore: number,
) {
  // Semi-opaque white overlay
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const bx = 20, by = 70, bw = CANVAS_W - 40, bh = 130;
  ctx.fillStyle = '#fff';
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, bw, bh);
  ctx.lineWidth = 1;

  ctx.fillStyle = '#000';
  drawText(ctx, 'GAME OVER', CANVAS_W / 2, by + 24, 12);

  // Score line
  ctx.fillStyle = '#000';
  drawText(ctx, `Score:  ${score}`, CANVAS_W / 2, by + 52, 9);
  drawText(ctx, `Best:   ${highScore}`, CANVAS_W / 2, by + 70, 9);

  if (score > 0 && score >= highScore) {
    drawText(ctx, '★ NEW HIGH SCORE ★', CANVAS_W / 2, by + 90, 8);
  }

  drawText(ctx, 'Press any key to retry', CANVAS_W / 2, by + 112, 7);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Snake() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const posthog    = usePostHog();
  const { play }   = useAudio();

  // React state — only what's needed for HUD re-renders
  const [phase,     setPhase]     = useState<Phase>('idle');
  const [score,     setScore]     = useState(0);
  const [highScore, setHighScore] = useState<number>(() => loadHighScore());

  // All mutable game state in refs to avoid stale closures in the loop
  const phaseRef    = useRef<Phase>('idle');
  const snakeRef    = useRef<Pt[]>([{ x: 10, y: 10 }]);
  const foodRef     = useRef<Pt>({ x: 5, y: 5 });
  const dirRef      = useRef<Dir>('R');
  const nextDirRef  = useRef<Dir>('R');
  const scoreRef    = useRef(0);
  const hiRef       = useRef(loadHighScore());
  const lastTickRef = useRef(0);
  const rafRef      = useRef<number>(0);

  // ── Game logic ─────────────────────────────────────────────────────────────

  const initGame = useCallback(() => {
    const start: Pt = { x: 10, y: 10 };
    snakeRef.current  = [start, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dirRef.current    = 'R';
    nextDirRef.current = 'R';
    scoreRef.current  = 0;
    foodRef.current   = randomFood(snakeRef.current);
    lastTickRef.current = 0;
    setScore(0);
  }, []);

  const tick = useCallback((timestamp: number) => {
    if (phaseRef.current !== 'playing') return;

    const interval = Math.max(
      MIN_TICK,
      BASE_TICK - Math.floor(scoreRef.current / SPEED_STEP) * 5,
    );

    if (timestamp - lastTickRef.current >= interval) {
      lastTickRef.current = timestamp;

      // Commit buffered direction
      dirRef.current = nextDirRef.current;
      const delta = DIR_DELTA[dirRef.current];
      const head  = snakeRef.current[0];
      const next: Pt = {
        x: (head.x + delta.x + COLS) % COLS,
        y: (head.y + delta.y + ROWS) % ROWS,
      };

      // Self-collision
      const hitSelf = snakeRef.current.some(
        (p, i) => i > 0 && p.x === next.x && p.y === next.y,
      );

      if (hitSelf) {
        phaseRef.current = 'dead';
        setPhase('dead');
        const finalScore = scoreRef.current;
        const newHi = Math.max(finalScore, hiRef.current);
        hiRef.current = newHi;
        saveHighScore(newHi);
        setHighScore(newHi);
        play('crunch');
        posthog.capture('game_played', { game: 'snake', score: finalScore });
        return;
      }

      // Ate food?
      const ate = next.x === foodRef.current.x && next.y === foodRef.current.y;
      const newSnake = [next, ...snakeRef.current];
      if (!ate) newSnake.pop();
      snakeRef.current = newSnake;

      if (ate) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
        foodRef.current = randomFood(snakeRef.current);
        play('click');
      }
    }

    // Render
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext('2d');
    if (ctx) {
      render(ctx, snakeRef.current, foodRef.current, phaseRef.current, scoreRef.current, hiRef.current);
    }
  }, [play, posthog]);

  // Game loop trigger
  useEffect(() => {
    if (phase !== 'playing') return;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, tick]);


  // ── Lifecycle ──────────────────────────────────────────────────────────────

  // Initial idle render
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext('2d');
    if (ctx) render(ctx, snakeRef.current, foodRef.current, 'idle', 0, hiRef.current);
    // Focus so keyboard events land immediately
    wrapRef.current?.focus();
  }, []);

  // Start / restart loop when phase becomes 'playing'
  useEffect(() => {
    if (phase !== 'playing') {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, tick]);

  // Dead phase: draw final frame
  useEffect(() => {
    if (phase !== 'dead') return;
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext('2d');
    if (ctx) {
      render(ctx, snakeRef.current, foodRef.current, 'dead', scoreRef.current, hiRef.current);
    }
  }, [phase]);

  // ── Input ──────────────────────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const key = e.key;

      // Advance phase on any key when idle or dead
      if (phaseRef.current === 'idle' || phaseRef.current === 'dead') {
        // Ignore modifier-only presses
        if (['Shift', 'Control', 'Alt', 'Meta', 'Tab'].includes(key)) return;
        initGame();
        phaseRef.current = 'playing';
        setPhase('playing');
        return;
      }

      // Direction input — prevent arrow keys scrolling the window
      const map: Partial<Record<string, Dir>> = {
        ArrowUp: 'U', w: 'U', W: 'U',
        ArrowDown: 'D', s: 'D', S: 'D',
        ArrowLeft: 'L', a: 'L', A: 'L',
        ArrowRight: 'R', d: 'R', D: 'R',
      };
      const newDir = map[key];
      if (newDir) {
        e.preventDefault();
        // Prevent 180° reversal
        if (newDir !== OPPOSITE[dirRef.current]) {
          nextDirRef.current = newDir;
        }
      }
    },
    [initGame],
  );

  // ── Mobile / touch: swipe detection ───────────────────────────────────────
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      touchStart.current = null;

      if (phaseRef.current === 'idle' || phaseRef.current === 'dead') {
        initGame();
        phaseRef.current = 'playing';
        setPhase('playing');
        return;
      }

      const map: Dir = Math.abs(dx) > Math.abs(dy)
        ? dx > 0 ? 'R' : 'L'
        : dy > 0 ? 'D' : 'U';
      if (map !== OPPOSITE[dirRef.current]) nextDirRef.current = map;
    },
    [initGame],
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        outline: 'none',
        gap: 6,
        userSelect: 'none',
        padding: 4,
      }}
      // Re-focus if the wrapper loses focus (e.g. after clicking menu bar)
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          e.currentTarget.focus({ preventScroll: true });
        }
      }}
    >
      {/* HUD */}
      <div
        style={{
          width: CANVAS_W,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-chicago)',
          fontSize: 9,
          paddingBottom: 2,
          borderBottom: '1px solid #000',
        }}
      >
        <span>SCORE: {score}</span>
        <span>BEST: {highScore}</span>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{
          display: 'block',
          border: '1px solid #000',
          imageRendering: 'pixelated',
          cursor: 'none',
        }}
        aria-label="Snake game canvas"
      />

      {/* Touch controls for mobile */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 28px)',
          gridTemplateRows: 'repeat(2, 28px)',
          gap: 2,
          marginTop: 4,
        }}
        aria-label="Touch controls"
      >
        {/* Up */}
        <button
          style={{ gridColumn: 2, gridRow: 1, ...dpadBtnStyle }}
          onPointerDown={() => {
            if (dirRef.current !== 'D') nextDirRef.current = 'U';
          }}
          aria-label="Up"
        >▲</button>
        {/* Left */}
        <button
          style={{ gridColumn: 1, gridRow: 2, ...dpadBtnStyle }}
          onPointerDown={() => {
            if (dirRef.current !== 'R') nextDirRef.current = 'L';
          }}
          aria-label="Left"
        >◀</button>
        {/* Down */}
        <button
          style={{ gridColumn: 2, gridRow: 2, ...dpadBtnStyle }}
          onPointerDown={() => {
            if (dirRef.current !== 'U') nextDirRef.current = 'D';
          }}
          aria-label="Down"
        >▼</button>
        {/* Right */}
        <button
          style={{ gridColumn: 3, gridRow: 2, ...dpadBtnStyle }}
          onPointerDown={() => {
            if (dirRef.current !== 'L') nextDirRef.current = 'R';
          }}
          aria-label="Right"
        >▶</button>
      </div>
    </div>
  );
}

const dpadBtnStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #000',
  fontFamily: 'monospace',
  fontSize: 10,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  boxShadow: '1px 1px 0 #000',
};
