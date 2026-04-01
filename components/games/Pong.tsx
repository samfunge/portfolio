'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { useAudio } from '@/components/providers/AudioProvider';

const W          = 320;
const H          = 190;
const PAD_W      = 8;
const PAD_H      = 44;
const PAD_SPEED  = 3.5;
const BALL_SIZE  = 7;
const WIN_SCORE  = 7;

type Phase = 'idle' | 'playing' | 'over';

interface State {
  ball:   { x: number; y: number; vx: number; vy: number };
  player: { y: number; score: number };
  cpu:    { y: number; score: number };
}

function clampPaddle(y: number) {
  return Math.max(0, Math.min(H - PAD_H, y));
}

function newBall(towardPlayer: boolean): State['ball'] {
  const angle = (Math.random() * 40 - 20) * (Math.PI / 180);
  const speed = 3.2;
  return {
    x:  W / 2,
    y:  H / 2,
    vx: speed * Math.cos(angle) * (towardPlayer ? -1 : 1),
    vy: speed * Math.sin(angle),
  };
}

function makeState(): State {
  return {
    ball:   newBall(true),
    player: { y: H / 2 - PAD_H / 2, score: 0 },
    cpu:    { y: H / 2 - PAD_H / 2, score: 0 },
  };
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size = 10,
  align: CanvasTextAlign = 'center',
) {
  ctx.font = `bold ${size}px "ChicagoFLF","Press Start 2P",monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function draw(ctx: CanvasRenderingContext2D, s: State, phase: Phase) {
  // Background
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  // Centre dashed line
  ctx.setLineDash([4, 6]);
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.stroke();
  ctx.setLineDash([]);

  if (phase === 'idle') {
    ctx.fillStyle = '#000';
    drawText(ctx, 'PONG', W / 2, H / 2 - 20, 14);
    drawText(ctx, 'Press any key to start', W / 2, H / 2 + 8, 8);
    drawText(ctx, 'W / S  or  Arrow keys', W / 2, H / 2 + 24, 7);
    return;
  }

  // Scores
  ctx.fillStyle = '#000';
  drawText(ctx, String(s.player.score), W / 2 - 32, 16, 12);
  drawText(ctx, String(s.cpu.score),    W / 2 + 32, 16, 12);

  // Player paddle (left)
  ctx.fillStyle = '#000';
  ctx.fillRect(4, s.player.y, PAD_W, PAD_H);

  // CPU paddle (right)
  ctx.fillRect(W - 4 - PAD_W, s.cpu.y, PAD_W, PAD_H);

  // Ball
  ctx.fillRect(s.ball.x - BALL_SIZE / 2, s.ball.y - BALL_SIZE / 2, BALL_SIZE, BALL_SIZE);

  if (phase === 'over') {
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.fillRect(0, 0, W, H);
    const winner = s.player.score >= WIN_SCORE ? 'YOU WIN' : 'CPU WINS';
    ctx.fillStyle = '#000';
    drawText(ctx, winner,            W / 2, H / 2 - 16, 13);
    drawText(ctx, 'Press any key',   W / 2, H / 2 + 10, 8);
    drawText(ctx, 'to play again',   W / 2, H / 2 + 26, 8);
  }
}

export default function Pong() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const wrapRef     = useRef<HTMLDivElement>(null);
  const posthog     = usePostHog();
  const { play }    = useAudio();

  const [phase, setPhase] = useState<Phase>('idle');
  const phaseRef    = useRef<Phase>('idle');
  const stateRef    = useRef<State>(makeState());
  const keysRef     = useRef<Set<string>>(new Set());
  const rafRef      = useRef<number>(0);
  const lastRef     = useRef<number>(0);

  const redraw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) draw(ctx, stateRef.current, phaseRef.current);
  }, []);

  const loop = useCallback((ts: number) => {
    if (phaseRef.current !== 'playing') return;
    const dt = Math.min(ts - lastRef.current, 32);
    lastRef.current = ts;

    const s = stateRef.current;

    // Player input
    if (keysRef.current.has('ArrowUp') || keysRef.current.has('w') || keysRef.current.has('W')) {
      s.player.y = clampPaddle(s.player.y - PAD_SPEED * (dt / 16));
    }
    if (keysRef.current.has('ArrowDown') || keysRef.current.has('s') || keysRef.current.has('S')) {
      s.player.y = clampPaddle(s.player.y + PAD_SPEED * (dt / 16));
    }

    // CPU AI — tracks ball with a speed limit
    const cpuCenter = s.cpu.y + PAD_H / 2;
    const diff = s.ball.y - cpuCenter;
    const cpuMove = Math.min(Math.abs(diff), 2.8 * (dt / 16));
    s.cpu.y = clampPaddle(s.cpu.y + (diff > 0 ? cpuMove : -cpuMove));

    // Move ball
    s.ball.x += s.ball.vx * (dt / 16);
    s.ball.y += s.ball.vy * (dt / 16);

    // Top / bottom bounce
    if (s.ball.y - BALL_SIZE / 2 <= 0) { s.ball.y = BALL_SIZE / 2; s.ball.vy = Math.abs(s.ball.vy); }
    if (s.ball.y + BALL_SIZE / 2 >= H)  { s.ball.y = H - BALL_SIZE / 2; s.ball.vy = -Math.abs(s.ball.vy); }

    // Player paddle collision (left)
    const leftX = 4 + PAD_W;
    if (s.ball.x - BALL_SIZE / 2 <= leftX && s.ball.x > 4 &&
        s.ball.y >= s.player.y && s.ball.y <= s.player.y + PAD_H) {
      s.ball.x = leftX + BALL_SIZE / 2;
      const relHit = (s.ball.y - (s.player.y + PAD_H / 2)) / (PAD_H / 2);
      const angle = relHit * 55 * (Math.PI / 180);
      const speed = Math.sqrt(s.ball.vx ** 2 + s.ball.vy ** 2) * 1.03;
      s.ball.vx = Math.cos(angle) * speed;
      s.ball.vy = Math.sin(angle) * speed;
      play('click');
    }

    // CPU paddle collision (right)
    const rightX = W - 4 - PAD_W;
    if (s.ball.x + BALL_SIZE / 2 >= rightX && s.ball.x < W - 4 &&
        s.ball.y >= s.cpu.y && s.ball.y <= s.cpu.y + PAD_H) {
      s.ball.x = rightX - BALL_SIZE / 2;
      const relHit = (s.ball.y - (s.cpu.y + PAD_H / 2)) / (PAD_H / 2);
      const angle = relHit * 55 * (Math.PI / 180);
      const speed = Math.sqrt(s.ball.vx ** 2 + s.ball.vy ** 2) * 1.03;
      s.ball.vx = -Math.cos(angle) * speed;
      s.ball.vy = Math.sin(angle) * speed;
      play('click');
    }

    // Score
    if (s.ball.x < 0) {
      s.cpu.score++;
      play('crunch');
      if (s.cpu.score >= WIN_SCORE) {
        phaseRef.current = 'over';
        setPhase('over');
        posthog.capture('game_played', { game: 'pong', result: 'loss' });
        redraw();
        return;
      }
      s.ball = newBall(false);
    } else if (s.ball.x > W) {
      s.player.score++;
      play('crunch');
      if (s.player.score >= WIN_SCORE) {
        phaseRef.current = 'over';
        setPhase('over');
        posthog.capture('game_played', { game: 'pong', result: 'win' });
        redraw();
        return;
      }
      s.ball = newBall(true);
    }

    redraw();
  }, [play, posthog, redraw]);

  // Game loop trigger
  useEffect(() => {
    if (phase !== 'playing') return;
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, loop]);


  useEffect(() => {
    redraw();
    wrapRef.current?.focus();
  }, [redraw]);

  useEffect(() => {
    if (phase !== 'playing') { cancelAnimationFrame(rafRef.current); return; }
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, loop]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    keysRef.current.add(e.key);
    if (phaseRef.current === 'idle' || phaseRef.current === 'over') {
      if (['Shift','Control','Alt','Meta','Tab'].includes(e.key)) return;
      stateRef.current = makeState();
      phaseRef.current = 'playing';
      setPhase('playing');
    }
    if (['ArrowUp','ArrowDown'].includes(e.key)) e.preventDefault();
  }, []);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    keysRef.current.delete(e.key);
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
        style={{ border: '1px solid #000', imageRendering: 'pixelated', display: 'block' }}
        aria-label="Pong game"
      />
      <div style={{ marginTop: 4, fontFamily: 'var(--font-chicago)', fontSize: 8, color: '#555' }}>
        W / S or Arrow keys to move
      </div>
    </div>
  );
}
