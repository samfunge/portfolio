'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { useAudio } from '@/components/providers/AudioProvider';

const COLS     = 10;
const BRICK_W  = 26;
const BRICK_H  = 11;
const BRICK_ROWS = 5;
const W        = COLS * BRICK_W;     // 260
const H        = 310;
const PAD_W    = 52;
const PAD_H    = 8;
const PAD_Y    = H - 20;
const BALL_R   = 5;
const MAX_LIVES = 3;

type Phase = 'idle' | 'playing' | 'over' | 'win';

interface Brick { alive: boolean; row: number; col: number; }

function makeBricks(): Brick[] {
  const bricks: Brick[] = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      bricks.push({ alive: true, row: r, col: c });
    }
  }
  return bricks;
}

function makeState() {
  return {
    ball:   { x: W / 2, y: H / 2, vx: 2.6, vy: -3.0 },
    padX:   W / 2 - PAD_W / 2,
    bricks: makeBricks(),
    score:  0,
    lives:  MAX_LIVES,
  };
}

type GameState = ReturnType<typeof makeState>;

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size = 9, align: CanvasTextAlign = 'center') {
  ctx.font = `bold ${size}px "ChicagoFLF","Press Start 2P",monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

// 1-bit fill patterns for brick rows (top to bottom: densest to lightest)
const BRICK_FILLS = ['#000', '#000', '#333', '#666', '#999'];

function draw(ctx: CanvasRenderingContext2D, s: GameState, phase: Phase) {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  if (phase === 'idle') {
    ctx.fillStyle = '#000';
    drawText(ctx, 'BREAKOUT', W / 2, H / 2 - 22, 13);
    drawText(ctx, 'Press any key to start', W / 2, H / 2 + 4, 8);
    drawText(ctx, 'Arrow keys or mouse', W / 2, H / 2 + 20, 7);
    return;
  }

  // Bricks
  for (const b of s.bricks) {
    if (!b.alive) continue;
    const bx = b.col * BRICK_W;
    const by = 24 + b.row * (BRICK_H + 2);
    ctx.fillStyle = BRICK_FILLS[b.row] ?? '#000';
    ctx.fillRect(bx + 1, by + 1, BRICK_W - 2, BRICK_H - 2);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx + 1, by + 1, BRICK_W - 2, BRICK_H - 2);
  }

  // Paddle
  ctx.fillStyle = '#000';
  ctx.fillRect(s.padX, PAD_Y, PAD_W, PAD_H);

  // Ball
  ctx.beginPath();
  ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();

  // HUD
  ctx.fillStyle = '#000';
  drawText(ctx, `SCORE ${s.score}`, 4, 11, 8, 'left');
  drawText(ctx, `${'♥ '.repeat(s.lives).trim()}`, W - 4, 11, 8, 'right');

  if (phase === 'over' || phase === 'win') {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#000';
    drawText(ctx, phase === 'win' ? 'YOU WIN!' : 'GAME OVER', W / 2, H / 2 - 18, 13);
    drawText(ctx, `Score: ${s.score}`, W / 2, H / 2 + 6, 9);
    drawText(ctx, 'Press any key', W / 2, H / 2 + 26, 8);
  }
}

export default function Breakout() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const posthog   = usePostHog();
  const { play }  = useAudio();

  const [phase, setPhase] = useState<Phase>('idle');
  const phaseRef  = useRef<Phase>('idle');
  const stateRef  = useRef<GameState>(makeState());
  const keysRef   = useRef<Set<string>>(new Set());
  const rafRef    = useRef<number>(0);
  const lastRef   = useRef<number>(0);

  const redraw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) draw(ctx, stateRef.current, phaseRef.current);
  }, []);

  const endGame = useCallback((won: boolean) => {
    const p: Phase = won ? 'win' : 'over';
    phaseRef.current = p;
    setPhase(p);
    posthog.capture('game_played', { game: 'breakout', score: stateRef.current.score, won });
    cancelAnimationFrame(rafRef.current);
    redraw();
  }, [posthog, redraw]);

  const loop = useCallback((ts: number) => {
    if (phaseRef.current !== 'playing') return;
    const dt = Math.min(ts - lastRef.current, 32);
    lastRef.current = ts;

    const s = stateRef.current;
    const speed = dt / 16;

    // Keyboard paddle control
    if (keysRef.current.has('ArrowLeft')  || keysRef.current.has('a') || keysRef.current.has('A')) {
      s.padX = Math.max(0, s.padX - 4.5 * speed);
    }
    if (keysRef.current.has('ArrowRight') || keysRef.current.has('d') || keysRef.current.has('D')) {
      s.padX = Math.min(W - PAD_W, s.padX + 4.5 * speed);
    }

    // Move ball
    s.ball.x += s.ball.vx * speed;
    s.ball.y += s.ball.vy * speed;

    // Wall bounces
    if (s.ball.x - BALL_R <= 0)  { s.ball.x = BALL_R;      s.ball.vx =  Math.abs(s.ball.vx); }
    if (s.ball.x + BALL_R >= W)  { s.ball.x = W - BALL_R;  s.ball.vx = -Math.abs(s.ball.vx); }
    if (s.ball.y - BALL_R <= 0)  { s.ball.y = BALL_R;      s.ball.vy =  Math.abs(s.ball.vy); }

    // Paddle bounce
    if (
      s.ball.vy > 0 &&
      s.ball.y + BALL_R >= PAD_Y &&
      s.ball.y + BALL_R <= PAD_Y + PAD_H + 4 &&
      s.ball.x >= s.padX - BALL_R &&
      s.ball.x <= s.padX + PAD_W + BALL_R
    ) {
      s.ball.y = PAD_Y - BALL_R;
      const rel = (s.ball.x - (s.padX + PAD_W / 2)) / (PAD_W / 2);
      const angle = rel * 60 * (Math.PI / 180);
      const speed2 = Math.sqrt(s.ball.vx ** 2 + s.ball.vy ** 2);
      s.ball.vx = Math.sin(angle) * speed2;
      s.ball.vy = -Math.cos(angle) * speed2;
      play('click');
    }

    // Ball lost
    if (s.ball.y - BALL_R > H) {
      s.lives--;
      play('crunch');
      if (s.lives <= 0) { endGame(false); return; }
      s.ball = { x: W / 2, y: H / 2, vx: 2.6, vy: -3.0 };
    }

    // Brick collisions
    let aliveBricks = 0;
    for (const b of s.bricks) {
      if (!b.alive) continue;
      aliveBricks++;
      const bx = b.col * BRICK_W + 1;
      const by = 24 + b.row * (BRICK_H + 2) + 1;
      const bw = BRICK_W - 2;
      const bh = BRICK_H - 2;

      if (
        s.ball.x + BALL_R > bx && s.ball.x - BALL_R < bx + bw &&
        s.ball.y + BALL_R > by && s.ball.y - BALL_R < by + bh
      ) {
        // eslint-disable-next-line react-hooks/immutability
        b.alive = false;
        aliveBricks--;
        s.score += (BRICK_ROWS - b.row) * 10;
        play('click');

        // Determine bounce axis
        const overlapL = (s.ball.x + BALL_R) - bx;
        const overlapR = (bx + bw) - (s.ball.x - BALL_R);
        const overlapT = (s.ball.y + BALL_R) - by;
        const overlapB = (by + bh) - (s.ball.y - BALL_R);
        const minH = Math.min(overlapL, overlapR);
        const minV = Math.min(overlapT, overlapB);
        if (minH < minV) s.ball.vx = -s.ball.vx;
        else             s.ball.vy = -s.ball.vy;
        break;
      }
    }

    if (aliveBricks === 0) { endGame(true); return; }

    redraw();
  }, [play, endGame, redraw]);

  // Game loop trigger
  useEffect(() => {
    if (phase !== 'playing') return;
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, loop]);


  useEffect(() => { redraw(); wrapRef.current?.focus(); }, [redraw]);

  useEffect(() => {
    if (phase !== 'playing') { cancelAnimationFrame(rafRef.current); return; }
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, loop]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    keysRef.current.add(e.key);
    if (phaseRef.current === 'idle' || phaseRef.current === 'over' || phaseRef.current === 'win') {
      if (['Shift','Control','Alt','Meta','Tab'].includes(e.key)) return;
      stateRef.current = makeState();
      phaseRef.current = 'playing';
      setPhase('playing');
    }
    if (['ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
  }, []);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    keysRef.current.delete(e.key);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (phaseRef.current !== 'playing') return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    stateRef.current.padX = Math.max(0, Math.min(W - PAD_W, mx - PAD_W / 2));
  }, []);

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', outline: 'none', userSelect: 'none', padding: 4 }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) e.currentTarget.focus({ preventScroll: true }); }}
    >
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onMouseMove={handleMouseMove}
        style={{ border: '1px solid #000', imageRendering: 'pixelated', display: 'block', cursor: 'none' }}
        aria-label="Breakout game"
      />
      <div style={{ marginTop: 4, fontFamily: 'var(--font-chicago)', fontSize: 8, color: '#555' }}>
        Arrow keys or mouse to move
      </div>
    </div>
  );
}
