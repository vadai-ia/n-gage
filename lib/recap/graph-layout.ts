// Layout por fuerzas minimalista (repulsión + resortes + gravedad) para el grafo
// de conexiones. Determinístico: misma entrada → mismas posiciones.

export type LayoutEdge = { source: number; target: number; weight: number };
export type LayoutPoint = { x: number; y: number };

const ITERATIONS = 320;
const REPULSION = 2200;
const SPRING_LENGTH = 70;
const SPRING_K = 0.04;
const GRAVITY = 0.012;
const DAMPING = 0.55;
const MAX_SPEED = 30;

export function computeForceLayout(nodeCount: number, edges: LayoutEdge[]): LayoutPoint[] {
  // Filotaxis como punto de partida: reparte uniformemente sin aleatoriedad
  const golden = Math.PI * (3 - Math.sqrt(5));
  const pos = Array.from({ length: nodeCount }, (_, i) => ({
    x: Math.cos(i * golden) * 18 * Math.sqrt(i + 1),
    y: Math.sin(i * golden) * 18 * Math.sqrt(i + 1),
  }));
  const vel = Array.from({ length: nodeCount }, () => ({ x: 0, y: 0 }));

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const alpha = 1 - iter / ITERATIONS;

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = pos[i].x - pos[j].x;
        const dy = pos[i].y - pos[j].y;
        const d2 = Math.max(dx * dx + dy * dy, 25);
        const d = Math.sqrt(d2);
        const f = REPULSION / d2;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        vel[i].x += fx; vel[i].y += fy;
        vel[j].x -= fx; vel[j].y -= fy;
      }
    }

    for (const e of edges) {
      const s = pos[e.source];
      const t = pos[e.target];
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const d = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const f = (d - SPRING_LENGTH) * SPRING_K * e.weight;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;
      vel[e.source].x += fx; vel[e.source].y += fy;
      vel[e.target].x -= fx; vel[e.target].y -= fy;
    }

    for (let i = 0; i < nodeCount; i++) {
      vel[i].x -= pos[i].x * GRAVITY;
      vel[i].y -= pos[i].y * GRAVITY;
      // Tope de velocidad para que nodos muy cercanos no salgan disparados
      const speed = Math.hypot(vel[i].x, vel[i].y);
      if (speed > MAX_SPEED) { vel[i].x *= MAX_SPEED / speed; vel[i].y *= MAX_SPEED / speed; }
      pos[i].x += vel[i].x * alpha;
      pos[i].y += vel[i].y * alpha;
      vel[i].x *= DAMPING;
      vel[i].y *= DAMPING;
    }
  }

  return pos;
}
