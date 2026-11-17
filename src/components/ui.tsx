import type { ReactNode } from 'react';
import { HelpCircle, Info } from 'lucide-react';

export type Status = 'confirmed' | 'hypothesis' | 'simulated' | 'proposed' | 'live';
const STATUS_LABEL: Record<Status, string> = {
  confirmed: 'Confirmado',
  hypothesis: 'Hipótese de discovery',
  simulated: 'Dado simulado',
  proposed: 'Proposto',
  live: 'Simulação ao vivo',
};

export function Tag({ status, children, solid }: { status?: Status; children?: ReactNode; solid?: boolean }) {
  return (
    <span className={`tag ${status ?? ''} ${solid ? 'solid' : ''}`}>
      {status && <span className="dot" aria-hidden />}
      {children ?? (status ? STATUS_LABEL[status] : null)}
    </span>
  );
}

export function SectionHeader({ n, question, title, lead, aside }: { n: string; question: string; title: ReactNode; lead?: ReactNode; aside?: ReactNode }) {
  return (
    <header className="section-head">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="eyebrow">MÓDULO {n}</span>
        {aside}
      </div>
      <span className="question"><HelpCircle size={18} aria-hidden /> {question}</span>
      <h1 className="display">{title}</h1>
      {lead && <p className="lead">{lead}</p>}
    </header>
  );
}

export function Segmented<T extends string>({ value, onChange, options, label, onDark }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string; onDark?: boolean }) {
  return (
    <div className={`seg ${onDark ? 'on-dark' : ''}`} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

export function Callout({ children, tone }: { children: ReactNode; tone?: 'confirmed' | 'dark' }) {
  return <div className={`callout ${tone ?? ''}`} role="note"><Info size={18} aria-hidden /><div>{children}</div></div>;
}

export function Stat({ label, value, delta, good }: { label: string; value: string; delta?: string; good?: boolean }) {
  return (
    <div className="stat">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
      {delta && <span className={`delta ${good ? 'good' : 'bad'}`}><span className="chip" aria-hidden />{delta}</span>}
    </div>
  );
}

export function Skeleton({ h = 120 }: { h?: number }) {
  return <div className="skeleton" style={{ height: h }} aria-hidden />;
}

export function Legend({ items }: { items: { label: string; swatch: ReactNode }[] }) {
  return (
    <div className="row" style={{ gap: 'var(--space-5)' }}>
      {items.map((i) => <span key={i.label} className="legend-item caption">{i.swatch}{i.label}</span>)}
    </div>
  );
}

export const Dot = ({ color, dashed }: { color: string; dashed?: boolean }) => (
  <span aria-hidden style={{ width: 12, height: 12, borderRadius: 'var(--radius-full)', background: dashed ? 'transparent' : color, border: `2px ${dashed ? 'dashed' : 'solid'} ${color}`, display: 'inline-block' }} />
);
