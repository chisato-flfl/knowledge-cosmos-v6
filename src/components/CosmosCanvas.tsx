import { useEffect, useRef, useCallback } from 'react';
import type { StarNode, Connection } from '../types';
import { NODE_COLOR } from '../types';
import { useCosmosSimulation } from '../hooks/useCosmosSimulation';

interface Star { x: number; y: number; r: number; baseOpacity: number; speed: number; phase: number }

const NODE_R = 34;
const WARMUP = 200;

function makeStars(W: number, H: number): Star[] {
  const count = Math.floor((W * H) / 4000);
  return Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 0.2 + Math.random() * 1.2,
    baseOpacity: 0.1 + Math.random() * 0.6,
    speed: 0.003 + Math.random() * 0.015,
    phase: Math.random() * Math.PI * 2,
  }));
}

function drawBackground(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.fillStyle = '#000a1a';
  ctx.fillRect(0, 0, W, H);

  const nebula = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, W * 0.7);
  nebula.addColorStop(0, 'rgba(20,30,80,0.18)');
  nebula.addColorStop(0.5, 'rgba(10,20,60,0.08)');
  nebula.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, W, H);
}

function drawStarField(ctx: CanvasRenderingContext2D, stars: Star[], frame: number) {
  for (const s of stars) {
    const op = s.baseOpacity * (0.6 + 0.4 * Math.sin(frame * s.speed + s.phase));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${op.toFixed(3)})`;
    ctx.fill();
  }
}

function drawEdge(ctx: CanvasRenderingContext2D, a: StarNode, b: StarNode, frame: number) {
  const hiMax = Math.max(a.hi, b.hi);
  const pulse = 0.4 + 0.3 * Math.sin(frame * 0.03);
  const alpha = (0.12 + hiMax * 0.45) * pulse;
  const width = 0.6 + hiMax * 1.8;

  const grd = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
  const colorA = NODE_COLOR[a.type];
  const colorB = NODE_COLOR[b.type];
  grd.addColorStop(0, colorA + Math.round(alpha * 255).toString(16).padStart(2, '0'));
  grd.addColorStop(1, colorB + Math.round(alpha * 255).toString(16).padStart(2, '0'));

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = grd;
  ctx.lineWidth = width;
  ctx.stroke();
}

function drawNode(ctx: CanvasRenderingContext2D, node: StarNode, frame: number, selected: boolean) {
  const color = NODE_COLOR[node.type];
  const { x, y } = node;

  // Ambient glow
  const ambR = NODE_R * 2.8;
  const amb = ctx.createRadialGradient(x, y, 0, x, y, ambR);
  amb.addColorStop(0, color + '30');
  amb.addColorStop(1, color + '00');
  ctx.fillStyle = amb;
  ctx.beginPath();
  ctx.arc(x, y, ambR, 0, Math.PI * 2);
  ctx.fill();

  // Highlight glow
  if (node.hi > 0.01 || selected) {
    const glowR = NODE_R * (selected ? 4 : 3.5);
    const intensity = selected ? 1 : node.hi;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
    glow.addColorStop(0, color + Math.round(intensity * 200).toString(16).padStart(2, '0'));
    glow.addColorStop(1, color + '00');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ripple
  if (node.ripple > 0) {
    const rR = NODE_R + node.ripple * NODE_R * 3;
    const rAlpha = (1 - node.ripple) * 0.6;
    ctx.beginPath();
    ctx.arc(x, y, rR, 0, Math.PI * 2);
    ctx.strokeStyle = color + Math.round(rAlpha * 255).toString(16).padStart(2, '0');
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Pulse on node base radius
  const pulse = 1 + 0.04 * Math.sin(frame * 0.04 + node.phase);
  const r = NODE_R * pulse;

  // Node body
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color + 'CC';
  ctx.fill();

  // Border
  ctx.strokeStyle = selected ? '#fff' : color;
  ctx.lineWidth = selected ? 2.5 : 1.5;
  ctx.stroke();

  // Emoji icon
  ctx.font = `${Math.round(r * 0.72)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    node.type === 'book' ? '📚' : node.type === 'experience' ? '🌱' : '✨',
    x,
    y,
  );

  // Label — show up to 2 lines
  ctx.font = '11px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.textBaseline = 'top';

  const title = node.title;
  const lines = title.includes('\n') ? title.split('\n') : splitToLines(ctx, title, NODE_R * 3.5);
  lines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, x, y + r + 7 + i * 14);
  });
}

function splitToLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  if (ctx.measureText(text).width <= maxW) return [text];
  const mid = Math.floor(text.length / 2);
  return [text.slice(0, mid), text.slice(mid)];
}

interface Props {
  nodes: StarNode[];
  connections: Connection[];
  selectedId: string | null;
  onSelectNode: (id: string | null) => void;
  onUpdateNodes: (nodes: StarNode[]) => void;
}

export default function CosmosCanvas({ nodes, connections, selectedId, onSelectNode, onUpdateNodes }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const nodesRef = useRef<StarNode[]>(nodes);
  const rafRef = useRef<number>(0);
  const frameRef = useRef(0);
  const { step } = useCosmosSimulation();
  const warmedUp = useRef(false);

  // Sync nodes prop → ref (preserve physics positions)
  useEffect(() => {
    const prev = nodesRef.current;
    nodesRef.current = nodes.map(n => {
      const existing = prev.find(p => p.id === n.id);
      return existing ? { ...n, x: existing.x, y: existing.y, vx: existing.vx, vy: existing.vy } : n;
    });
  }, [nodes]);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    starsRef.current = makeStars(W, H);

    // Scatter nodes on first load / resize
    if (!warmedUp.current) {
      const cx = W / 2;
      const cy = H / 2;
      nodesRef.current.forEach((n, i) => {
        const angle = (i / nodesRef.current.length) * Math.PI * 2;
        const r = 160 + Math.random() * 80;
        n.x = cx + Math.cos(angle) * r;
        n.y = cy + Math.sin(angle) * r - 30;
        n.vx = 0;
        n.vy = 0;
      });
      for (let i = 0; i < WARMUP; i++) {
        step(nodesRef.current, connections, W, H);
      }
      warmedUp.current = true;
    }
  }, [connections, step]);

  const handleClick = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const hit = nodesRef.current.find(n => {
      const d = Math.sqrt((n.x - mx) ** 2 + (n.y - my) ** 2);
      return d <= NODE_R + 8;
    });

    if (hit) {
      hit.hiTarget = 1;
      hit.ripple = 0;
      onSelectNode(hit.id === selectedId ? null : hit.id);
    } else {
      onSelectNode(null);
    }
  }, [onSelectNode, selectedId]);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [handleClick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const loop = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      if (W === 0 || H === 0) { rafRef.current = requestAnimationFrame(loop); return; }

      const ctx = canvas.getContext('2d');
      if (!ctx) { rafRef.current = requestAnimationFrame(loop); return; }

      frameRef.current++;
      const f = frameRef.current;

      // Physics
      step(nodesRef.current, connections, W, H);

      // Highlight interpolation & ripple
      let dirty = false;
      for (const n of nodesRef.current) {
        const prevHi = n.hi;
        n.hi = n.hi * 0.92 + n.hiTarget * 0.08;
        if (n.id !== selectedId) n.hiTarget = n.hiTarget * 0.95;
        if (n.ripple > 0) { n.ripple = Math.min(1, n.ripple + 0.025); if (n.ripple >= 1) n.ripple = 0; }
        if (Math.abs(n.hi - prevHi) > 0.001) dirty = true;
      }
      if (dirty) onUpdateNodes([...nodesRef.current]);

      drawBackground(ctx, W, H);
      drawStarField(ctx, starsRef.current, f);

      // Edges
      ctx.save();
      for (const conn of connections) {
        const a = nodesRef.current.find(n => n.id === conn.sourceId);
        const b = nodesRef.current.find(n => n.id === conn.targetId);
        if (a && b) drawEdge(ctx, a, b, f);
      }
      ctx.restore();

      // Nodes
      for (const node of nodesRef.current) {
        drawNode(ctx, node, f, node.id === selectedId);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [connections, selectedId, step, onUpdateNodes]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full cursor-pointer"
      style={{ background: '#000a1a' }}
    />
  );
}
