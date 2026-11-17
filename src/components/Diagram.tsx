/**
 * Diagram — motor de fluxogramas reutilizável (SVG puro, tokens Good Market).
 * Usado nos 7 diagramas da proposta: ecossistema, AS-IS, TO-BE, Estoca.ai,
 * jornada do dado, fluxo de compras e pilotos.
 *
 * Recursos: zoom (botões, ctrl/⌘+scroll, pinça), pan (arrastar/setas),
 * seleção (clique/Enter), destaque de dependências (diretas ou cadeia),
 * fluxo animado, nós/arestas ativos para simulações, legenda.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Maximize2, Minus, Plus, type LucideIcon } from 'lucide-react';

export type NodeKind = 'core' | 'brand' | 'system' | 'manual' | 'data' | 'ai' | 'app' | 'external' | 'pain' | 'estoca' | 'step';
export type EdgeKind = 'data' | 'event' | 'manual' | 'ai' | 'batch';
export type NodeStatus = 'confirmed' | 'hypothesis' | 'proposed';

export interface DNode {
  id: string; x: number; y: number; w?: number; h?: number;
  label: string; sub?: string; kind?: NodeKind; status?: NodeStatus;
  icon?: LucideIcon;
  badge?: string;
}
export interface DEdge { from: string; to: string; kind?: EdgeKind; label?: string; }
export interface DGroup { id: string; x: number; y: number; w: number; h: number; label: string; tone?: 'light' | 'white' | 'dark' | 'outline'; }

export const EDGE_STYLE: Record<EdgeKind, { stroke: string; dash?: string; width: number; label: string }> = {
  data: { stroke: 'var(--color-dark)', width: 1.6, label: 'Fluxo de dados (API / sincronização)' },
  event: { stroke: 'var(--color-accent)', dash: '6 6', width: 1.8, label: 'Evento / webhook' },
  batch: { stroke: 'var(--color-dark)', dash: '2 5', width: 1.6, label: 'Lote / arquivo (ETL, XML, CSV)' },
  manual: { stroke: 'var(--color-border-strong)', dash: '1 5', width: 2.2, label: 'Processo manual' },
  ai: { stroke: 'var(--color-secondary)', width: 2, label: 'Inferência / recomendação de IA' },
};

interface Props {
  nodes: DNode[]; edges: DEdge[]; groups?: DGroup[];
  height?: number; selectedId?: string | null; onSelect?: (id: string | null) => void;
  deps?: 'direct' | 'chain'; flowing?: boolean;
  activeNodes?: Set<string>; activeEdges?: Set<string>;
  legend?: EdgeKind[] | false; extraLegend?: ReactNode; ariaLabel: string; hint?: ReactNode;
  padding?: number;
}

const ekey = (e: DEdge) => `${e.from}>${e.to}`;

function nodeBox(n: DNode) {
  const w = n.w ?? (n.kind === 'core' ? 150 : n.kind === 'brand' ? 110 : n.kind === 'pain' ? 30 : 170);
  const h = n.h ?? (n.kind === 'core' ? 150 : n.kind === 'brand' ? 110 : n.kind === 'pain' ? 30 : 56);
  return { x: n.x, y: n.y, w, h, cx: n.x + w / 2, cy: n.y + h / 2 };
}

function edgePath(a: ReturnType<typeof nodeBox>, b: ReturnType<typeof nodeBox>) {
  const dx = b.cx - a.cx, dy = b.cy - a.cy;
  if (Math.abs(dx) * 0.6 > Math.abs(dy)) {
    const sx = dx > 0 ? a.x + a.w : a.x, ex = dx > 0 ? b.x : b.x + b.w;
    const m = (ex - sx) / 2;
    return { d: `M${sx},${a.cy} C${sx + m},${a.cy} ${ex - m},${b.cy} ${ex},${b.cy}`, mx: (sx + ex) / 2, my: (a.cy + b.cy) / 2 };
  }
  const sy = dy > 0 ? a.y + a.h : a.y, ey = dy > 0 ? b.y : b.y + b.h;
  const m = (ey - sy) / 2;
  return { d: `M${a.cx},${sy} C${a.cx},${sy + m} ${b.cx},${ey - m} ${b.cx},${ey}`, mx: (a.cx + b.cx) / 2, my: (sy + ey) / 2 };
}

function nodeColors(n: DNode, active: boolean) {
  const k = n.kind ?? 'system';
  const base = {
    core: { fill: 'var(--color-dark)', stroke: 'var(--color-dark)', text: 'var(--color-white)' },
    brand: { fill: 'var(--color-white)', stroke: 'var(--color-dark)', text: 'var(--color-text)' },
    system: { fill: 'var(--color-white)', stroke: 'var(--color-dark)', text: 'var(--color-text)' },
    manual: { fill: 'var(--color-light)', stroke: 'var(--color-border-strong)', text: 'var(--color-text)' },
    data: { fill: 'var(--color-light)', stroke: 'var(--color-dark)', text: 'var(--color-text)' },
    ai: { fill: 'var(--color-white)', stroke: 'var(--color-secondary)', text: 'var(--color-text)' },
    app: { fill: 'var(--color-dark)', stroke: 'var(--color-dark)', text: 'var(--color-white)' },
    external: { fill: 'var(--color-white)', stroke: 'var(--color-border-strong)', text: 'var(--color-text)' },
    pain: { fill: 'var(--color-accent)', stroke: 'var(--color-white)', text: 'var(--color-text)' },
    estoca: { fill: 'var(--color-white)', stroke: 'var(--color-accent)', text: 'var(--color-text)' },
    step: { fill: 'var(--color-white)', stroke: 'var(--color-dark)', text: 'var(--color-text)' },
  }[k];
  if (active && k !== 'pain') return { fill: 'var(--color-dark)', stroke: 'var(--color-live)', text: 'var(--color-white)' };
  return base;
}

export function Diagram({ nodes, edges, groups = [], height = 560, selectedId = null, onSelect, deps = 'direct', flowing = false, activeNodes, activeEdges, legend = ['data', 'event', 'batch', 'manual', 'ai'], extraLegend, ariaLabel, hint, padding = 40 }: Props) {
  const boxes = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, nodeBox(n)])), [nodes]);
  const vb = useMemo(() => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const b of [...Object.values(boxes), ...groups]) { x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h); }
    return { x: x0 - padding, y: y0 - padding, w: x1 - x0 + padding * 2, h: y1 - y0 + padding * 2 };
  }, [boxes, groups, padding]);

  const [t, setT] = useState({ k: 1, x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{ moved: boolean; last?: { x: number; y: number }; pinch?: number }>({ moved: false });
  const [panning, setPanning] = useState(false);

  // Relações para destacar dependências
  const related = useMemo(() => {
    if (!selectedId) return null;
    const set = new Set([selectedId]);
    if (deps === 'direct') {
      edges.forEach((e) => { if (e.from === selectedId) set.add(e.to); if (e.to === selectedId) set.add(e.from); });
    } else {
      const walk = (id: string, dir: 'up' | 'down') => edges.forEach((e) => {
        const [src, dst] = dir === 'down' ? [e.from, e.to] : [e.to, e.from];
        if (src === id && !set.has(dst)) { set.add(dst); walk(dst, dir); }
      });
      walk(selectedId, 'down'); walk(selectedId, 'up');
    }
    return set;
  }, [selectedId, edges, deps]);

  const scaleInfo = () => {
    const r = svgRef.current!.getBoundingClientRect();
    const s = Math.min(r.width / vb.w, r.height / vb.h);
    return { r, s, ox: (r.width - vb.w * s) / 2, oy: (r.height - vb.h * s) / 2 };
  };
  const toVb = (cx: number, cy: number) => { const { r, s, ox, oy } = scaleInfo(); return { x: (cx - r.left - ox) / s + vb.x, y: (cy - r.top - oy) / s + vb.y }; };

  const zoomAt = useCallback((factor: number, p?: { x: number; y: number }) => {
    setT((cur) => {
      const k = Math.min(3, Math.max(0.5, cur.k * factor));
      const c = p ?? { x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 };
      // mantém o ponto c fixo na tela
      const wx = (c.x - vb.x - cur.x) / cur.k, wy = (c.y - vb.y - cur.y) / cur.k;
      return { k, x: c.x - vb.x - wx * k, y: c.y - vb.y - wy * k };
    });
  }, [vb]);
  // Enquadramento: em telas largas mostra tudo; em telas estreitas preenche a altura
  // (o usuário arrasta na horizontal) para manter os rótulos legíveis.
  const fit = useCallback(() => {
    const el = svgRef.current;
    if (!el) return setT({ k: 1, x: 0, y: 0 });
    const r = el.getBoundingClientRect();
    const s = Math.min(r.width / vb.w, r.height / vb.h);
    if (r.width >= 700 || !s) return setT({ k: 1, x: 0, y: 0 });
    const k = Math.min(2.6, r.height / (vb.h * s));
    const oy = (r.height - vb.h * s) / 2;
    setT({ k, x: 0, y: -oy / s });
  }, [vb]);
  useEffect(fit, [fit]);

  useEffect(() => {
    const el = svgRef.current; if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return; // não sequestra o scroll da página
      e.preventDefault();
      zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, toVb(e.clientX, e.clientY));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  });

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    drag.current = { moved: false, last: { x: e.clientX, y: e.clientY } };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      drag.current.pinch = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && drag.current.pinch) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt(d / drag.current.pinch, toVb((a.x + b.x) / 2, (a.y + b.y) / 2));
      drag.current.pinch = d; drag.current.moved = true; return;
    }
    const last = drag.current.last!;
    const dx = e.clientX - last.x, dy = e.clientY - last.y;
    if (!drag.current.moved && Math.hypot(dx, dy) < 4) return;
    if (!drag.current.moved) { (e.currentTarget as Element).setPointerCapture(e.pointerId); setPanning(true); }
    drag.current.moved = true;
    const { s } = scaleInfo();
    setT((cur) => ({ ...cur, x: cur.x + dx / s, y: cur.y + dy / s }));
    drag.current.last = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) drag.current.pinch = undefined;
    setPanning(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const step = 40;
    if (e.key === '+' || e.key === '=') zoomAt(1.2);
    else if (e.key === '-') zoomAt(1 / 1.2);
    else if (e.key === '0') fit();
    else if (e.key === 'Escape') onSelect?.(null);
    else if (e.target === e.currentTarget && e.key.startsWith('Arrow')) {
      e.preventDefault();
      setT((c) => ({ ...c, x: c.x + (e.key === 'ArrowLeft' ? step : e.key === 'ArrowRight' ? -step : 0), y: c.y + (e.key === 'ArrowUp' ? step : e.key === 'ArrowDown' ? -step : 0) }));
    }
  };

  const click = (id: string | null) => { if (drag.current.moved) return; onSelect?.(id === selectedId ? null : id); };

  return (
    <div className="diagram" style={{ height: `min(${height}px, 75vh)` }}>
      <svg
        ref={svgRef} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} role="group" aria-label={`${ariaLabel}. Use Tab para navegar pelos componentes, Enter para selecionar, + e − para zoom, setas para mover.`}
        tabIndex={0} className={panning ? 'is-panning' : ''}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onKeyDown={onKey}
        onClick={(e) => { if (e.target === e.currentTarget || (e.target as Element).getAttribute('data-bg')) click(null); }}
      >
        <defs>
          {(Object.keys(EDGE_STYLE) as EdgeKind[]).map((k) => (
            <marker key={k} id={`arrow-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: EDGE_STYLE[k].stroke }} />
            </marker>
          ))}
          <marker id="arrow-live" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" style={{ fill: 'var(--color-live)' }} />
          </marker>
        </defs>
        <rect data-bg="1" x={vb.x} y={vb.y} width={vb.w} height={vb.h} style={{ fill: 'transparent' }} />
        <g transform={`translate(${vb.x + t.x},${vb.y + t.y}) scale(${t.k}) translate(${-vb.x},${-vb.y})`}>
          {groups.map((g) => (
            <g key={g.id} className={related ? 'dimmed' : ''} style={related ? { opacity: .5 } : undefined}>
              <rect data-bg="1" x={g.x} y={g.y} width={g.w} height={g.h} style={{
                fill: g.tone === 'dark' ? 'var(--color-dark)' : g.tone === 'white' ? 'var(--color-white)' : g.tone === 'outline' ? 'transparent' : 'var(--color-light)',
                stroke: g.tone === 'outline' ? 'var(--color-border-strong)' : 'var(--color-border)', strokeDasharray: g.tone === 'outline' ? '4 4' : undefined,
              }} />
              <text x={g.x + 16} y={g.y + 24} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', fill: g.tone === 'dark' ? 'var(--color-white)' : 'var(--color-dark)' }}>{g.label}</text>
            </g>
          ))}
          {edges.map((e) => {
            const a = boxes[e.from], b = boxes[e.to]; if (!a || !b) return null;
            const st = EDGE_STYLE[e.kind ?? 'data'];
            const p = edgePath(a, b);
            const lit = !related || (related.has(e.from) && related.has(e.to));
            const active = activeEdges?.has(ekey(e));
            return (
              <g key={ekey(e)} className={lit ? 'lit' : 'dimmed'}>
                <path d={p.d} className={(e.kind === 'event' && (flowing || active)) ? 'edge-dash' : ''} markerEnd={`url(#arrow-${active ? 'live' : e.kind ?? 'data'})`}
                  style={{ fill: 'none', stroke: active ? 'var(--color-live)' : st.stroke, strokeWidth: active ? 3 : st.width, strokeDasharray: st.dash }} />
                {e.label && <text x={p.mx} y={p.my - 6} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--color-dark)', paintOrder: 'stroke', stroke: 'var(--color-white)', strokeWidth: 4 }}>{e.label}</text>}
                {((flowing && lit && (e.kind === 'data' || e.kind === 'ai' || !e.kind)) || active) && (
                  <circle r={active ? 6 : 4} style={{ fill: active ? 'var(--color-live)' : st.stroke }}>
                    <animateMotion dur={active ? '0.9s' : '2.4s'} repeatCount="indefinite" path={p.d} />
                  </circle>
                )}
              </g>
            );
          })}
          {nodes.map((n) => {
            const b = boxes[n.id];
            const active = !!activeNodes?.has(n.id);
            const c = nodeColors(n, active);
            const sel = selectedId === n.id;
            const lit = !related || related.has(n.id);
            const round = n.kind === 'core' || n.kind === 'brand' || n.kind === 'pain';
            const rx = round ? b.w / 2 : Math.min(b.h / 2, 100);
            const lines = n.label.split('\n');
            const Icon = n.icon;
            const hasIcon = !!Icon && !round;
            const tx = hasIcon ? b.x + 48 : b.cx;
            const anchor = hasIcon ? 'start' : 'middle';
            const totalLines = lines.length + (n.sub ? 1 : 0);
            const startY = b.cy - ((totalLines - 1) * 16) / 2 + 5;
            return (
              <g key={n.id} className={`dnode ${lit ? 'lit' : 'dimmed'}`} tabIndex={0} role="button" aria-pressed={sel}
                aria-label={`${n.label.replace('\n', ' ')}${n.sub ? `, ${n.sub}` : ''}${n.status ? `, ${n.status === 'confirmed' ? 'confirmado' : n.status === 'hypothesis' ? 'hipótese' : 'proposto'}` : ''}`}
                onClick={(e) => { e.stopPropagation(); click(n.id); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onSelect?.(sel ? null : n.id); } }}>
                {sel && <rect x={b.x - 6} y={b.y - 6} width={b.w + 12} height={b.h + 12} rx={round ? (b.w + 12) / 2 : Math.min((b.h + 12) / 2, 100)} style={{ fill: 'none', stroke: 'var(--color-accent)', strokeWidth: 3 }} />}
                <rect className="shape" x={b.x} y={b.y} width={b.w} height={b.h} rx={rx}
                  style={{ fill: c.fill, stroke: n.status === 'hypothesis' && !active ? 'var(--color-accent)' : c.stroke, strokeWidth: n.kind === 'ai' || n.kind === 'estoca' ? 2.5 : 1.5,
                    strokeDasharray: n.status === 'hypothesis' ? '6 4' : n.kind === 'manual' ? '2 4' : undefined, filter: active ? 'drop-shadow(1px 6px 12px rgba(7,94,84,.24))' : undefined }} />
                {hasIcon && Icon && (
                  <g>
                    <circle cx={b.x + 26} cy={b.cy} r={16} style={{ fill: active || n.kind === 'app' ? 'rgba(255,255,255,.15)' : 'var(--color-light)' }} />
                    <Icon x={b.x + 17} y={b.cy - 9} size={18} color={c.text === 'var(--color-white)' ? 'var(--color-white)' : 'var(--color-dark)'} strokeWidth={1.75} />
                  </g>
                )}
                {n.kind === 'pain' ? (
                  <text x={b.cx} y={b.cy + 4} textAnchor="middle" style={{ fontSize: 12, fontWeight: 600, fill: c.text }}>{n.label}</text>
                ) : (
                  <text x={tx} y={startY} textAnchor={anchor} style={{ fill: c.text }}>
                    {lines.map((l, i) => <tspan key={i} x={tx} dy={i === 0 ? 0 : 16} style={{ fontSize: round && n.kind === 'core' ? 18 : 14, fontWeight: 500 }}>{l}</tspan>)}
                    {n.sub && <tspan x={tx} dy={16} style={{ fontSize: 11, fontWeight: 400, opacity: .85 }}>{n.sub}</tspan>}
                  </text>
                )}
                {n.status && n.kind !== 'pain' && (
                  <circle cx={round ? b.cx + b.w * 0.35 : b.x + b.w - 14} cy={round ? b.y + b.h * 0.15 : b.y + 10} r={6}
                    style={{ fill: n.status === 'confirmed' ? 'var(--color-secondary)' : n.status === 'hypothesis' ? 'var(--color-accent)' : 'var(--color-dark)', stroke: 'var(--color-white)', strokeWidth: 2 }} />
                )}
                {n.badge && (
                  <g>
                    <rect x={b.x + b.w - 52} y={b.y - 12} width={52} height={20} rx={10} style={{ fill: 'var(--color-accent)' }} />
                    <text x={b.x + b.w - 26} y={b.y + 2} textAnchor="middle" style={{ fontSize: 11, fontWeight: 600, fill: 'var(--color-text)' }}>{n.badge}</text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <div className="controls">
        <button type="button" className="icon-btn" onClick={() => zoomAt(1.2)} aria-label="Aproximar"><Plus size={18} /></button>
        <button type="button" className="icon-btn" onClick={() => zoomAt(1 / 1.2)} aria-label="Afastar"><Minus size={18} /></button>
        <button type="button" className="icon-btn" onClick={fit} aria-label="Enquadrar diagrama"><Maximize2 size={16} /></button>
      </div>
      {hint && <div className="hint hide-sm">{hint}</div>}
      {(legend || extraLegend) && (
        <div className="legend" aria-label="Legenda">
          {legend && legend.map((k) => (
            <span key={k} className="legend-item">
              <svg width="28" height="8" aria-hidden><line x1="0" y1="4" x2="28" y2="4" style={{ stroke: EDGE_STYLE[k].stroke, strokeWidth: 2.5, strokeDasharray: EDGE_STYLE[k].dash }} /></svg>
              {EDGE_STYLE[k].label}
            </span>
          ))}
          {extraLegend}
        </div>
      )}
    </div>
  );
}

export const StatusLegend = () => (
  <>
    <span className="legend-item"><svg width="12" height="12" aria-hidden><circle cx="6" cy="6" r="5" style={{ fill: 'var(--color-secondary)' }} /></svg>Confirmado</span>
    <span className="legend-item"><svg width="12" height="12" aria-hidden><circle cx="6" cy="6" r="5" style={{ fill: 'var(--color-accent)' }} /></svg>Hipótese (borda tracejada)</span>
    <span className="legend-item"><svg width="12" height="12" aria-hidden><circle cx="6" cy="6" r="5" style={{ fill: 'var(--color-dark)' }} /></svg>Proposto</span>
  </>
);
