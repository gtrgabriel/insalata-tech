import type { ReactNode } from 'react';
import { MousePointerClick, X } from 'lucide-react';
import type { DEdge, DNode } from './Diagram';
import { Tag } from './ui';

/** Painel lateral padrão para diagramas: título, status, conteúdo e relações calculadas. */
export function NodePanel({ node, nodes, edges, onSelect, onClose, children, emptyText }: {
  node: DNode | null; nodes: DNode[]; edges: DEdge[]; onSelect: (id: string) => void; onClose: () => void; children?: ReactNode; emptyText: string;
}) {
  if (!node) {
    return (
      <aside className="panel compact" aria-live="polite">
        <MousePointerClick size={18} aria-hidden style={{ flex: 'none', color: 'var(--color-dark)' }} />
        <span className="caption" style={{ color: 'var(--color-text)' }}>{emptyText}</span>
      </aside>
    );
  }
  const name = (id: string) => nodes.find((n) => n.id === id)?.label.replace('\n', ' ') ?? id;
  const ins = edges.filter((e) => e.to === node.id);
  const outs = edges.filter((e) => e.from === node.id);
  return (
    <aside className="panel" aria-live="polite" aria-label={`Detalhes de ${node.label}`}>
      <div className="card-head">
        <h3>{node.label.replace('\n', ' ')}</h3>
        <button className="icon-btn" onClick={onClose} aria-label="Fechar detalhes"><X size={16} /></button>
      </div>
      {node.sub && <p className="caption">{node.sub}</p>}
      {node.status && <div><Tag status={node.status} /></div>}
      {children}
      {(ins.length > 0 || outs.length > 0) && (
        <div className="stack tight">
          <span className="eyebrow">RELAÇÕES</span>
          <div className="row tight">
            {ins.map((e) => <button key={'i' + e.from} className="btn sm ghost" onClick={() => onSelect(e.from)}>← {name(e.from)}</button>)}
            {outs.map((e) => <button key={'o' + e.to} className="btn sm ghost" onClick={() => onSelect(e.to)}>{name(e.to)} →</button>)}
          </div>
        </div>
      )}
    </aside>
  );
}
