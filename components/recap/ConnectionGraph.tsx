"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Maximize2, Minus, Plus } from "lucide-react";
import type { RecapPerson } from "@/lib/recap/types";
import { useRecap } from "@/lib/contexts/RecapContext";
import { computeForceLayout, type LayoutEdge } from "@/lib/recap/graph-layout";
import { recapImage } from "@/lib/recap/images";
import { plural } from "@/lib/recap/format";
import PersonAvatar from "./PersonAvatar";

type EdgeKind = "match" | "super" | "like";
type GraphEdge = { key: string; a: number; b: number; kind: EdgeKind };
type Layout = { nodes: { person: RecapPerson; x: number; y: number; r: number }[]; edges: GraphEdge[]; box: { x: number; y: number; size: number } };

const GENDER_COLOR: Record<string, string> = { female: "#FF2D78", male: "#1A6EFF", non_binary: "#7B2FBE", prefer_not_say: "#8585A8" };
const EDGE_STYLE: Record<EdgeKind, { stroke: string; width: number; dash?: string }> = {
  match: { stroke: "#FF2D78", width: 2.6 },
  super: { stroke: "#FFB800", width: 1.6, dash: "4 3" },
  like: { stroke: "rgba(240,240,255,0.35)", width: 0.9, dash: "3 4" },
};
const MAX_ZOOM = 4;

export default function ConnectionGraph() {
  const { data, openPerson } = useRecap();
  const [layout, setLayout] = useState<Layout | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showLikes, setShowLikes] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  // Layout en el cliente después del primer render (no bloquea el SSR)
  useEffect(() => {
    const connected = data.people.filter((p) => p.likesSent + p.likesReceived > 0);
    const index = new Map(connected.map((p, i) => [p.id, i]));
    const matched = new Set(data.matches.map((m) => [m.a, m.b].sort().join("|")));
    const pairs = new Map<string, GraphEdge>();
    for (const l of data.likes) {
      const key = [l.from, l.to].sort().join("|");
      const a = index.get(l.from)!;
      const b = index.get(l.to)!;
      const kind: EdgeKind = matched.has(key) ? "match" : l.type === "super_like" ? "super" : "like";
      const prev = pairs.get(key);
      if (!prev || kind === "match" || (kind === "super" && prev.kind === "like")) pairs.set(key, { key, a, b, kind });
    }
    const edges = Array.from(pairs.values());
    const layoutEdges: LayoutEdge[] = edges.map((e) => ({ source: e.a, target: e.b, weight: e.kind === "match" ? 2 : 0.5 }));
    const points = computeForceLayout(connected.length, layoutEdges);

    const nodes = connected.map((person, i) => ({
      person,
      x: points[i].x,
      y: points[i].y,
      r: Math.min(26, 11 + Math.sqrt(person.likesReceived) * 3.2),
    }));
    const pad = 40;
    const minX = Math.min(...nodes.map((n) => n.x - n.r)) - pad;
    const maxX = Math.max(...nodes.map((n) => n.x + n.r)) + pad;
    const minY = Math.min(...nodes.map((n) => n.y - n.r)) - pad;
    const maxY = Math.max(...nodes.map((n) => n.y + n.r)) + pad;
    const size = Math.max(maxX - minX, maxY - minY, 200);
    setLayout({
      nodes,
      edges,
      box: { x: (minX + maxX) / 2 - size / 2, y: (minY + maxY) / 2 - size / 2, size },
    });
  }, [data]);

  const neighbors = useMemo(() => {
    if (!layout || !selected) return null;
    const idx = layout.nodes.findIndex((n) => n.person.id === selected);
    const set = new Set<number>([idx]);
    for (const e of layout.edges) {
      if (e.a === idx) set.add(e.b);
      if (e.b === idx) set.add(e.a);
    }
    return { idx, set };
  }, [layout, selected]);

  if (data.likes.length === 0) {
    return <p className="py-10 text-center text-sm" style={{ color: "var(--fg-3)" }}>Aquí aparecerá la red en cuanto haya likes.</p>;
  }

  if (!layout) {
    return <div className="aspect-square w-full rounded-3xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} aria-label="Cargando la red de conexiones" />;
  }

  const view = layout.box.size / zoom;
  const viewBox = `${layout.box.x + (layout.box.size - view) / 2 + pan.x} ${layout.box.y + (layout.box.size - view) / 2 + pan.y} ${view} ${view}`;
  const selectedPerson = selected ? layout.nodes.find((n) => n.person.id === selected)?.person : undefined;
  const isolated = data.people.length - layout.nodes.length;
  const visibleEdges = layout.edges.filter((e) => showLikes || e.kind === "match");

  function setZoomClamped(next: number) {
    const z = Math.min(MAX_ZOOM, Math.max(1, next));
    setZoom(z);
    if (z === 1) setPan({ x: 0, y: 0 });
  }

  function onPointerDown(e: React.PointerEvent) {
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || zoom === 1 || !svgRef.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    if (!drag.current.moved && Math.hypot(dx, dy) < 6) return;
    drag.current.moved = true;
    const unitsPerPx = view / svgRef.current.clientWidth;
    setPan((p) => ({ x: p.x - dx * unitsPerPx, y: p.y - dy * unitsPerPx }));
    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
  }
  function onPointerUp() {
    setTimeout(() => { drag.current = null; }, 0);
  }
  function selectNode(id: string) {
    if (drag.current?.moved) return;
    setSelected((cur) => (cur === id ? null : id));
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl" style={{ background: "radial-gradient(circle at 50% 40%, rgba(123,47,190,0.18), rgba(7,7,15,0.9) 70%)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="block aspect-square w-full select-none"
          style={{ touchAction: zoom > 1 ? "none" : "pan-y", cursor: zoom > 1 ? "grab" : "default" }}
          role="img"
          aria-label={`Red de conexiones: ${plural(layout.nodes.length, "persona", "personas")}, ${plural(data.matches.length, "match", "matches")}. La lista de abajo tiene el mismo detalle.`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onClick={(e) => { if (e.target === svgRef.current && !drag.current?.moved) setSelected(null); }}
        >
          <defs>
            <clipPath id="recap-node-clip" clipPathUnits="objectBoundingBox">
              <circle cx="0.5" cy="0.5" r="0.5" />
            </clipPath>
          </defs>

          {visibleEdges.map((e) => {
            const s = layout.nodes[e.a];
            const t = layout.nodes[e.b];
            const st = EDGE_STYLE[e.kind];
            const dim = neighbors && !(e.a === neighbors.idx || e.b === neighbors.idx);
            return (
              <line
                key={e.key}
                x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                stroke={st.stroke}
                strokeWidth={st.width / Math.sqrt(zoom)}
                strokeDasharray={st.dash}
                strokeLinecap="round"
                opacity={dim ? 0.07 : 0.9}
              />
            );
          })}

          {layout.nodes.map((n, i) => {
            const dim = neighbors && !neighbors.set.has(i);
            const isSelected = n.person.id === selected;
            const showName = isSelected || (neighbors && neighbors.set.has(i)) || zoom >= 2.2;
            return (
              <g
                key={n.person.id}
                transform={`translate(${n.x} ${n.y})`}
                opacity={dim ? 0.25 : 1}
                onClick={() => selectNode(n.person.id)}
                className="cursor-pointer"
              >
                <circle r={n.r + 8} fill="transparent" />
                <circle r={n.r + 2.5} fill="#07070F" stroke={GENDER_COLOR[n.person.gender] ?? "#8585A8"} strokeWidth={isSelected ? 4 : 2} />
                {n.person.photo ? (
                  <image
                    href={recapImage.avatar(n.person.photo)}
                    x={-n.r} y={-n.r} width={n.r * 2} height={n.r * 2}
                    clipPath="url(#recap-node-clip)"
                    preserveAspectRatio="xMidYMid slice"
                  />
                ) : (
                  <text textAnchor="middle" dominantBaseline="central" fontSize={n.r * 0.9} fill="#F0F0FF" fontWeight={700}>
                    {n.person.name.charAt(0)}
                  </text>
                )}
                {showName && (
                  <text
                    y={n.r + 14}
                    textAnchor="middle"
                    fontSize={11 / Math.sqrt(zoom)}
                    fontWeight={600}
                    fill="#F0F0FF"
                    stroke="#07070F"
                    strokeWidth={3 / Math.sqrt(zoom)}
                    paintOrder="stroke"
                  >
                    {n.person.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          {[
            { label: "Acercar", icon: Plus, onClick: () => setZoomClamped(zoom * 1.5), disabled: zoom >= MAX_ZOOM },
            { label: "Alejar", icon: Minus, onClick: () => setZoomClamped(zoom / 1.5), disabled: zoom <= 1 },
            { label: "Ver toda la red", icon: Maximize2, onClick: () => setZoomClamped(1), disabled: zoom === 1 },
          ].map(({ label, icon: Icon, onClick, disabled }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              disabled={disabled}
              aria-label={label}
              className="flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-xl cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
              style={{ background: "rgba(15,15,26,0.8)", border: "1px solid rgba(255,255,255,0.12)", color: "var(--text-primary)" }}
            >
              <Icon size={18} aria-hidden />
            </button>
          ))}
        </div>
      </div>

      {/* Persona seleccionada */}
      <div className="mt-3 min-h-[72px]" aria-live="polite">
        {selectedPerson ? (
          <button
            type="button"
            onClick={() => openPerson(selectedPerson.id)}
            className="flex w-full items-center gap-3 rounded-2xl p-3 text-left cursor-pointer transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <PersonAvatar person={selectedPerson} size={48} ring />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold" style={{ color: "var(--text-primary)" }}>{selectedPerson.name}</span>
              <span className="block text-xs" style={{ color: "var(--fg-3)" }}>
                {plural(selectedPerson.matches, "match", "matches")} · recibió {plural(selectedPerson.likesReceived, "like", "likes")} · dio {selectedPerson.likesSent}
              </span>
            </span>
            <ChevronRight size={18} style={{ color: "var(--fg-3)" }} aria-hidden />
          </button>
        ) : (
          <p className="px-1 pt-2 text-sm" style={{ color: "var(--fg-3)" }}>
            Toca a alguien para ver con quién conectó. El tamaño de cada burbuja es cuántos likes recibió.
          </p>
        )}
      </div>

      {/* Leyenda + filtro */}
      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 px-1">
        <Legend color="#FF2D78" label="Match" />
        <Legend color="#FFB800" label="Super like" dashed />
        <Legend color="rgba(240,240,255,0.5)" label="Like sin corresponder" dashed />
        <label className="ml-auto flex min-h-[44px] items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--fg-2)" }}>
          <input
            type="checkbox"
            checked={showLikes}
            onChange={(e) => setShowLikes(e.target.checked)}
            className="h-5 w-5 cursor-pointer accent-[#FF2D78]"
          />
          Mostrar likes
        </label>
      </div>

      {isolated > 0 && (
        <p className="mt-2 px-1 text-xs" style={{ color: "var(--fg-3)" }}>
          {plural(isolated, "invitado se registró", "invitados se registraron")} pero no dio ni recibió likes.
        </p>
      )}
    </div>
  );
}

function Legend({ color, label, dashed = false }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-2 text-xs" style={{ color: "var(--fg-2)" }}>
      <svg width="22" height="6" aria-hidden>
        <line x1="1" y1="3" x2="21" y2="3" stroke={color} strokeWidth="2.4" strokeDasharray={dashed ? "4 3" : undefined} strokeLinecap="round" />
      </svg>
      {label}
    </span>
  );
}
