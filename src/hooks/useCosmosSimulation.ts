import { useRef, useCallback } from 'react';
import type { StarNode, Connection } from '../types';

const REP = 3200;
const K = 0.010;
const REST = 130;
const DAMP = 0.82;
const GRAV = 0.0018;

export function useCosmosSimulation() {
  const frameRef = useRef(0);

  const step = useCallback(
    (nodes: StarNode[], connections: Connection[], W: number, H: number) => {
      frameRef.current++;
      const cx = W / 2;
      const cy = H / 2;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        let fx = 0;
        let fy = 0;

        // Repulsion from every other node
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy + 1;
          const f = REP / d2;
          fx += (dx / Math.sqrt(d2)) * f;
          fy += (dy / Math.sqrt(d2)) * f;
        }

        // Spring attraction along connections
        for (const c of connections) {
          let other: StarNode | undefined;
          if (c.sourceId === a.id) other = nodes.find(n => n.id === c.targetId);
          else if (c.targetId === a.id) other = nodes.find(n => n.id === c.sourceId);
          if (!other) continue;
          const dx = other.x - a.x;
          const dy = other.y - a.y;
          const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
          const f = K * (d - REST);
          fx += (dx / d) * f;
          fy += (dy / d) * f;
        }

        // Center gravity
        fx += (cx - a.x) * GRAV;
        fy += (cy - a.y) * GRAV;

        a.vx = (a.vx + fx) * DAMP;
        a.vy = (a.vy + fy) * DAMP;

        a.x += a.vx;
        a.y += a.vy;

        // Bounds
        const margin = 70;
        const bMargin = 160;
        if (a.x < margin) { a.x = margin; a.vx *= -0.4; }
        if (a.x > W - margin) { a.x = W - margin; a.vx *= -0.4; }
        if (a.y < margin) { a.y = margin; a.vy *= -0.4; }
        if (a.y > H - bMargin) { a.y = H - bMargin; a.vy *= -0.4; }
      }
    },
    [],
  );

  return { step, frame: frameRef };
}
