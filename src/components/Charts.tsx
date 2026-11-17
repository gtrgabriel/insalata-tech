/** Gráficos SVG leves, com tokens Good Market (sem estilos padrão de bibliotecas). */
import { useState } from 'react';
import { useSize } from '../lib/util';

export const SERIES = ['var(--color-dark)', 'var(--color-accent)', 'var(--color-secondary)', 'var(--color-border-strong)'];

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

export interface Series { name: string; values: (number | null)[]; color?: string; dashed?: boolean; }

export function LineChart({ labels, series, height = 240, fmt = (v: number) => String(Math.round(v)), band, ariaLabel }: {
  labels: string[]; series: Series[]; height?: number; fmt?: (v: number) => string;
  band?: { lo: (number | null)[]; hi: (number | null)[] }; ariaLabel: string;
}) {
  const [ref, { width }] = useSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 76, r: 16, t: 16, b: 28 };
  const all = series.flatMap((s) => s.values).concat(band?.hi ?? []).filter((v): v is number => v != null);
  const max = niceMax(Math.max(...all, 0) * 1.05);
  const W = Math.max(width, 280), H = height;
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const x = (i: number) => pad.l + (labels.length <= 1 ? iw / 2 : (i / (labels.length - 1)) * iw);
  const y = (v: number) => pad.t + ih - (v / max) * ih;
  const path = (vals: (number | null)[]) => vals.reduce((acc, v, i) => v == null ? acc : acc + `${acc && vals[i - 1] != null ? 'L' : 'M'}${x(i)},${y(v)} `, '');
  const step = Math.ceil(labels.length / Math.max(2, Math.floor(iw / 64)));
  const bandPath = band ? (() => {
    const idx = band.hi.map((v, i) => (v != null ? i : -1)).filter((i) => i >= 0);
    if (!idx.length) return '';
    return `M${idx.map((i) => `${x(i)},${y(band.hi[i]!)}`).join(' L')} L${idx.slice().reverse().map((i) => `${x(i)},${y(band.lo[i]!)}`).join(' L')} Z`;
  })() : '';

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      {width > 0 && (
        <svg width={W} height={H} role="img" aria-label={ariaLabel}
          onPointerMove={(e) => { const r = (e.currentTarget as SVGElement).getBoundingClientRect(); const i = Math.round(((e.clientX - r.left - pad.l) / iw) * (labels.length - 1)); setHover(i >= 0 && i < labels.length ? i : null); }}
          onPointerLeave={() => setHover(null)}>
          {[0, .25, .5, .75, 1].map((f) => (
            <g key={f}>
              <line x1={pad.l} x2={W - pad.r} y1={y(max * f)} y2={y(max * f)} style={{ stroke: 'var(--color-border)', strokeWidth: 1 }} />
              <text x={pad.l - 8} y={y(max * f) + 4} textAnchor="end" style={{ fontSize: 11, fill: 'var(--color-dark)' }}>{fmt(max * f)}</text>
            </g>
          ))}
          {labels.map((l, i) => i % step === 0 && <text key={i} x={x(i)} y={H - 8} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--color-dark)' }}>{l}</text>)}
          {bandPath && <path d={bandPath} style={{ fill: 'var(--color-accent)', opacity: .15 }} />}
          {series.map((s, si) => (
            <path key={s.name} d={path(s.values)} style={{ fill: 'none', stroke: s.color ?? SERIES[si], strokeWidth: 2.5, strokeDasharray: s.dashed ? '6 5' : undefined, strokeLinejoin: 'round', strokeLinecap: 'round' }} />
          ))}
          {hover != null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} style={{ stroke: 'var(--color-border-strong)' }} />
              {series.map((s, si) => s.values[hover] != null && <circle key={s.name} cx={x(hover)} cy={y(s.values[hover]!)} r={5} style={{ fill: 'var(--color-white)', stroke: s.color ?? SERIES[si], strokeWidth: 2.5 }} />)}
            </g>
          )}
        </svg>
      )}
      {hover != null && width > 0 && (
        <div className="caption" style={{ position: 'absolute', top: 0, left: Math.min(x(hover) + 12, W - 180), background: 'var(--color-white)', border: '1px solid var(--color-border)', padding: 'var(--space-3)', pointerEvents: 'none', boxShadow: 'var(--shadow-sm)', color: 'var(--color-text)', minWidth: 140 }}>
          <strong>{labels[hover]}</strong>
          {series.map((s, si) => s.values[hover] != null && <div key={s.name} className="row tight"><span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color ?? SERIES[si] }} />{s.name}: {fmt(s.values[hover]!)}</div>)}
        </div>
      )}
      <div className="row tight caption" style={{ marginTop: 'var(--space-3)' }}>
        {series.map((s, si) => <span key={s.name} className="legend-item"><svg width="20" height="6" aria-hidden><line x1="0" x2="20" y1="3" y2="3" style={{ stroke: s.color ?? SERIES[si], strokeWidth: 3, strokeDasharray: s.dashed ? '4 3' : undefined }} /></svg>{s.name}</span>)}
        {band && <span className="legend-item"><span style={{ width: 16, height: 8, background: 'var(--color-accent)', opacity: .3 }} />Intervalo de confiança</span>}
      </div>
    </div>
  );
}

/** Barras horizontais com rótulo e valor — ranking, canais, unidades. */
export function HBars({ items, fmt, max, color = 'var(--color-dark)', ariaLabel }: { items: { label: string; value: number; note?: string; color?: string }[]; fmt: (v: number) => string; max?: number; color?: string; ariaLabel: string }) {
  const m = max ?? Math.max(...items.map((i) => i.value), 1);
  if (!items.length) return <p className="caption">Sem dados para os filtros selecionados.</p>;
  return (
    <div className="stack tight" role="list" aria-label={ariaLabel}>
      {items.map((i) => (
        <div key={i.label} role="listitem" className="stack" style={{ gap: 4 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="caption" style={{ color: 'var(--color-text)', fontWeight: 500 }}>{i.label}</span>
            <span className="caption" style={{ color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>{fmt(i.value)}{i.note && <span className="muted"> · {i.note}</span>}</span>
          </div>
          <div className="bar"><span style={{ width: `${Math.max(2, (i.value / m) * 100)}%`, background: i.color ?? color }} /></div>
        </div>
      ))}
    </div>
  );
}

/** Colunas empilhadas por categoria. */
export function StackedBars({ labels, series, height = 220, fmt, ariaLabel }: { labels: string[]; series: Series[]; height?: number; fmt: (v: number) => string; ariaLabel: string }) {
  const [ref, { width }] = useSize<HTMLDivElement>();
  const pad = { l: 76, r: 8, t: 8, b: 28 };
  const totals = labels.map((_, i) => series.reduce((a, s) => a + (s.values[i] ?? 0), 0));
  const max = niceMax(Math.max(...totals, 1));
  const W = Math.max(width, 280), iw = W - pad.l - pad.r, ih = height - pad.t - pad.b;
  const bw = Math.min(40, (iw / labels.length) * 0.6);
  const step = Math.ceil(labels.length / Math.max(2, Math.floor(iw / 56)));
  return (
    <div ref={ref} style={{ width: '100%' }}>
      {width > 0 && (
        <svg width={W} height={height} role="img" aria-label={ariaLabel}>
          {[0, .5, 1].map((f) => (
            <g key={f}>
              <line x1={pad.l} x2={W - pad.r} y1={pad.t + ih - ih * f} y2={pad.t + ih - ih * f} style={{ stroke: 'var(--color-border)' }} />
              <text x={pad.l - 8} y={pad.t + ih - ih * f + 4} textAnchor="end" style={{ fontSize: 11, fill: 'var(--color-dark)' }}>{fmt(max * f)}</text>
            </g>
          ))}
          {labels.map((l, i) => {
            const cx = pad.l + (i + 0.5) * (iw / labels.length);
            let acc = 0;
            return (
              <g key={l + i}>
                {series.map((s, si) => {
                  const v = s.values[i] ?? 0; const h = (v / max) * ih; const yy = pad.t + ih - acc - h; acc += h;
                  return <rect key={s.name} x={cx - bw / 2} y={yy} width={bw} height={Math.max(0, h - 1)} style={{ fill: s.color ?? SERIES[si], transition: 'all .4s' }}><title>{`${l} · ${s.name}: ${fmt(v)}`}</title></rect>;
                })}
                {i % step === 0 && <text x={cx} y={height - 8} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--color-dark)' }}>{l}</text>}
              </g>
            );
          })}
        </svg>
      )}
      <div className="row tight caption" style={{ marginTop: 'var(--space-3)' }}>
        {series.map((s, si) => <span key={s.name} className="legend-item"><span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color ?? SERIES[si] }} />{s.name}</span>)}
      </div>
    </div>
  );
}

export function Spark({ values, color = 'var(--color-dark)' }: { values: number[]; color?: string }) {
  const w = 96, h = 28, max = Math.max(...values), min = Math.min(...values);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${(i / (values.length - 1)) * w},${h - 2 - ((v - min) / (max - min || 1)) * (h - 4)}`).join(' ');
  return <svg width={w} height={h} aria-hidden><path d={d} style={{ fill: 'none', stroke: color, strokeWidth: 2 }} /></svg>;
}
