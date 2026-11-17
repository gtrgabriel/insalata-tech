import { useState } from 'react';
import { Code2, Link2, RefreshCw, Replace } from 'lucide-react';
import { Callout, SectionHeader, Tag } from '../components/ui';
import { useSize } from '../lib/util';

type Strat = 'integrar' | 'modernizar' | 'desenvolver' | 'substituir';
const STRATS: Record<Strat, { l: string; icon: typeof Link2; color: string; fill: string; when: string }> = {
  integrar: { l: 'Integrar', icon: Link2, color: 'var(--color-dark)', fill: 'var(--color-dark)', when: 'O sistema funciona bem; falta conectá-lo aos demais.' },
  modernizar: { l: 'Modernizar', icon: RefreshCw, color: 'var(--color-accent)', fill: 'var(--color-accent)', when: 'O processo é bom, mas a ferramenta (planilha, legado) limita escala.' },
  desenvolver: { l: 'Desenvolver', icon: Code2, color: 'var(--color-secondary)', fill: 'var(--color-secondary)', when: 'Necessidade específica do grupo, sem produto de mercado adequado.' },
  substituir: { l: 'Substituir', icon: Replace, color: 'var(--color-dark)', fill: 'var(--color-white)', when: 'Existe solução de mercado madura e mais barata de manter.' },
};

const APPS: { id: string; t: string; s: Strat; impact: number; cx: number; lab: 'l' | 'r' | 't' | 'b'; ben: string[]; dep: string[]; why: string }[] = [
  { id: 'portal', t: 'Portal de gestores', s: 'desenvolver', impact: 4.3, cx: 2.8, lab: 'r', ben: ['Números e metas da unidade em um só lugar', 'Menos relatórios manuais'], dep: ['Camada semântica', 'Perfis de acesso'], why: 'Visão específica por papel e unidade, sobre os dados do grupo.' },
  { id: 'compras', t: 'Central de compras', s: 'desenvolver', impact: 4.8, cx: 4, lab: 'l', ben: ['Pedido sugerido e alçadas', 'Histórico de negociação'], dep: ['Integração Estoca.ai', 'Previsão de demanda', 'ERP'], why: 'Maior alavanca de CMV; conecta previsão, aprovação e recebimento.' },
  { id: 'aprov', t: 'Aprovações operacionais', s: 'integrar', impact: 3.2, cx: 1.8, lab: 'r', ben: ['Aprovação pelo celular', 'Trilha de auditoria'], dep: ['Identidade única (SSO)'], why: 'Fluxos simples podem usar ferramentas de workflow existentes.' },
  { id: 'forn', t: 'Gestão de fornecedores', s: 'modernizar', impact: 3.9, cx: 2.2, lab: 'l', ben: ['Scorecard de OTIF, preço e qualidade', 'Base para renegociação'], dep: ['Dados de recebimento da Estoca.ai'], why: 'Evolui controles atuais com dados que a Estoca.ai já gera.' },
  { id: 'lider', t: 'Aplicativo para líderes', s: 'desenvolver', impact: 2.9, cx: 3.2, lab: 'r', ben: ['Checklists e rotinas de turno', 'Alertas acionáveis'], dep: ['Portal de gestores', 'Notificações'], why: 'Leva a inteligência ao chão de loja, onde a perda acontece.' },
  { id: 'conc', t: 'Conciliação de dados', s: 'integrar', impact: 3.9, cx: 3.4, lab: 'r', ben: ['Repasses de apps conciliados', 'Fechamento mais rápido'], dep: ['APIs dos apps', 'Adquirência', 'ERP'], why: 'Integra fontes existentes; não exige novo sistema de registro.' },
  { id: 'ocor', t: 'Gestão de ocorrências', s: 'substituir', impact: 2.2, cx: 1.2, lab: 'r', ben: ['Registro padronizado de problemas', 'Indicadores de recorrência'], dep: ['Definição de categorias'], why: 'Ferramentas de mercado resolvem bem; não justifica desenvolvimento.' },
  { id: 'ia', t: 'Assistentes internos de IA', s: 'desenvolver', impact: 3.4, cx: 3.9, lab: 'b', ben: ['Respostas com fonte para gestores', 'Menos dependência de analistas'], dep: ['Catálogo e camada semântica', 'Governança de IA'], why: 'Só gera valor sobre dados confiáveis — vem depois da fundação.' },
];
const CX = ['', 'Baixa', 'Moderada', 'Média', 'Alta', 'Muito alta'];

export default function M08Modernization() {
  const [filter, setFilter] = useState<Strat | 'all'>('all');
  const [sel, setSel] = useState('compras');
  const [ref, { width }] = useSize<HTMLDivElement>();
  const a = APPS.find((x) => x.id === sel)!;
  const W = Math.max(width, 300), H = 420, pad = 48;
  const x = (v: number) => pad + ((v - 0.7) / 3.8) * (W - pad * 2);
  const y = (v: number) => H - pad - ((v - 1.7) / 3.7) * (H - pad * 2);

  return (
    <>
      <SectionHeader n="08" question="O que integrar, modernizar, desenvolver ou substituir?"
        title="Matriz de decisões tecnológicas"
        lead="Nem tudo precisa ser construído. Cada aplicação é posicionada por impacto no negócio e complexidade, com a estratégia recomendada e sua justificativa."
        aside={<Tag status="hypothesis">Priorização preliminar</Tag>} />
      <div className="grid c4">
        {(Object.keys(STRATS) as Strat[]).map((k) => {
          const S = STRATS[k]; const I = S.icon;
          return (
            <button key={k} className="card interactive" aria-pressed={filter === k} onClick={() => setFilter(filter === k ? 'all' : k)}>
              <div className="row tight"><span className="bubble sm" style={{ background: S.fill, color: k === 'substituir' ? 'var(--color-dark)' : 'var(--color-white)', border: `2px solid ${S.color}` }}><I size={14} /></span><strong>{S.l}</strong><span className="caption">{APPS.filter((p) => p.s === k).length}</span></div>
              <p className="caption" style={{ color: 'var(--color-text)' }}>{S.when}</p>
            </button>
          );
        })}
      </div>
      <div className="split">
        <div className="card" ref={ref}>
          {width > 0 && (
            <svg width={W} height={H} role="img" aria-label="Matriz de impacto por complexidade">
              <rect x={pad} y={pad} width={(W - pad * 2) / 2} height={(H - pad * 2) / 2} style={{ fill: 'var(--color-light)' }} />
              <text x={pad + 12} y={pad + 20} style={{ fontSize: 11, fontWeight: 600, fill: 'var(--color-dark)' }}>GANHOS RÁPIDOS</text>
              <text x={W - pad - 12} y={pad + 20} textAnchor="end" style={{ fontSize: 11, fontWeight: 600, fill: 'var(--color-dark)' }}>APOSTAS ESTRATÉGICAS</text>
              <text x={pad + 12} y={H - pad - 12} style={{ fontSize: 11, fontWeight: 600, fill: 'var(--color-dark)' }}>OPORTUNIDADES SIMPLES</text>
              <text x={W - pad - 12} y={H - pad - 12} textAnchor="end" style={{ fontSize: 11, fontWeight: 600, fill: 'var(--color-dark)' }}>REAVALIAR</text>
              <line x1={pad} x2={W - pad} y1={H - pad} y2={H - pad} style={{ stroke: 'var(--color-border-strong)' }} />
              <line x1={pad} x2={pad} y1={pad} y2={H - pad} style={{ stroke: 'var(--color-border-strong)' }} />
              <line x1={W / 2} x2={W / 2} y1={pad} y2={H - pad} style={{ stroke: 'var(--color-border)', strokeDasharray: '4 4' }} />
              <line x1={pad} x2={W - pad} y1={H / 2} y2={H / 2} style={{ stroke: 'var(--color-border)', strokeDasharray: '4 4' }} />
              <text x={W / 2} y={H - 12} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--color-dark)' }}>Complexidade de implementação →</text>
              <text transform={`translate(16 ${H / 2}) rotate(-90)`} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--color-dark)' }}>Impacto no negócio →</text>
              {APPS.map((p) => {
                const S = STRATS[p.s]; const on = filter === 'all' || filter === p.s; const isSel = p.id === sel;
                const cx = x(p.cx), cy = y(p.impact);
                const lx = p.lab === 'r' ? cx + 18 : p.lab === 'l' ? cx - 18 : cx;
                const ly = p.lab === 't' ? cy - 20 : p.lab === 'b' ? cy + 28 : cy + 4;
                const anchor = p.lab === 'r' ? 'start' : p.lab === 'l' ? 'end' : 'middle';
                return (
                  <g key={p.id} tabIndex={0} role="button" aria-label={`${p.t}: ${S.l}`} aria-pressed={isSel} style={{ cursor: 'pointer', opacity: on ? 1 : 0.2, transition: 'opacity .3s' }}
                    onClick={() => setSel(p.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(p.id); } }}>
                    {isSel && <circle cx={cx} cy={cy} r={18} style={{ fill: 'none', stroke: 'var(--color-accent)', strokeWidth: 3 }} />}
                    <circle cx={cx} cy={cy} r={11} style={{ fill: S.fill, stroke: S.color, strokeWidth: 2.5 }} />
                    <text x={lx} y={ly} textAnchor={anchor} style={{ fontSize: 13, fontWeight: isSel ? 600 : 500, fill: 'var(--color-text)', paintOrder: 'stroke', stroke: 'var(--color-white)', strokeWidth: 4 }}>{p.t}</text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
        <aside className="panel" aria-live="polite">
          <span className="eyebrow">{STRATS[a.s].l.toUpperCase()}</span>
          <h3>{a.t}</h3>
          <dl className="kv"><dt>Impacto</dt><dd>{a.impact.toLocaleString('pt-BR')} / 5</dd><dt>Complexidade</dt><dd>{CX[Math.round(a.cx)]}</dd></dl>
          <div className="stack tight"><span className="eyebrow">BENEFÍCIOS</span><ul>{a.ben.map((b) => <li key={b}>{b}</li>)}</ul></div>
          <div className="stack tight"><span className="eyebrow">DEPENDÊNCIAS</span><ul>{a.dep.map((b) => <li key={b}>{b}</li>)}</ul></div>
          <div className="stack tight"><span className="eyebrow">JUSTIFICATIVA DE NEGÓCIO</span><p className="small">{a.why}</p></div>
          <div className="row tight">{APPS.map((p) => <button key={p.id} className="btn sm ghost" aria-pressed={p.id === sel} onClick={() => setSel(p.id)} style={p.id === sel ? { background: 'var(--color-dark)', color: 'var(--color-white)' } : undefined}>{p.t}</button>)}</div>
        </aside>
      </div>
      <Callout>Notas de impacto e complexidade são estimativas iniciais para orientar a conversa. Serão recalculadas no discovery com base em volume, sistemas reais e capacidade do time.</Callout>
    </>
  );
}
