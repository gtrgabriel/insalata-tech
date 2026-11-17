import { Fragment, useState } from 'react';
import { ChevronDown, ChevronRight, Flag } from 'lucide-react';
import { Callout, SectionHeader, Segmented, Tag } from '../components/ui';

interface Phase { id: number; t: string; s: number; e: number; deps: number[]; goal: string; deliv: string[]; subs: { t: string; s: number; e: number }[]; }
const PHASES: Phase[] = [
  { id: 1, t: 'Discovery e arquitetura', s: 0, e: 6, deps: [], goal: 'Validar hipóteses, mapear sistemas e fechar a arquitetura e o piloto.', deliv: ['Mapa AS-IS validado com as áreas', 'Arquitetura TO-BE e decisões de stack', 'Business case revisado com dados reais', 'Plano do piloto e critérios de sucesso'], subs: [{ t: 'Entrevistas com áreas e unidades', s: 0, e: 3 }, { t: 'Mapeamento de sistemas e APIs', s: 1, e: 4 }, { t: 'Arquitetura-alvo e backlog', s: 3, e: 6 }] },
  { id: 2, t: 'Integrações prioritárias', s: 5, e: 16, deps: [1], goal: 'Conectar as fontes do piloto: PDV, Estoca.ai, ERP e apps.', deliv: ['Conectores em produção com monitoramento', 'Esquema de eventos acordado com a Estoca.ai', 'De-para de itens e unidades'], subs: [{ t: 'PDV (marca do piloto)', s: 5, e: 10 }, { t: 'Estoca.ai', s: 7, e: 12 }, { t: 'ERP', s: 9, e: 14 }, { t: 'Apps de delivery', s: 11, e: 16 }] },
  { id: 3, t: 'Fundação de dados', s: 7, e: 20, deps: [1], goal: 'Base histórica única, com qualidade e definições de negócio.', deliv: ['Lakehouse/warehouse provisionado', 'Modelos de venda, consumo teórico, CMV e perda', 'Testes de qualidade e catálogo'], subs: [{ t: 'Ambiente e segurança', s: 7, e: 10 }, { t: 'Modelagem CMV e desperdício', s: 10, e: 16 }, { t: 'Qualidade e catálogo', s: 14, e: 20 }] },
  { id: 4, t: 'Cockpit executivo', s: 14, e: 24, deps: [2, 3], goal: 'Sócios e gestores com a mesma visão diária de margem e perdas.', deliv: ['Cockpit de CMV e desperdício (piloto)', 'Portal de gestores (versão 1)', 'Rotina de gestão com indicadores'], subs: [{ t: 'MVP CMV e desperdício', s: 14, e: 18 }, { t: 'Rollout às unidades do piloto', s: 18, e: 24 }] },
  { id: 5, t: 'IA aplicada', s: 20, e: 36, deps: [3, 4], goal: 'Previsão, pedido sugerido e alertas com aprovação humana.', deliv: ['Previsão de demanda por item', 'Pedido sugerido com fluxo de aprovação', 'Copiloto operacional (somente leitura)'], subs: [{ t: 'Previsão de demanda', s: 20, e: 28 }, { t: 'Pedido sugerido e aprovação', s: 24, e: 32 }, { t: 'Copiloto operacional', s: 28, e: 36 }] },
  { id: 6, t: 'Escala operacional', s: 32, e: 52, deps: [5], goal: 'Expandir para todas as marcas e unidades com governança contínua.', deliv: ['Todas as marcas integradas', 'Governança de dados e IA em operação', 'Roadmap de evolução contínua'], subs: [{ t: 'Expansão para todas as marcas', s: 32, e: 44 }, { t: 'Governança e melhoria contínua', s: 36, e: 52 }] },
];
const WEEKS = 52;
const MILESTONES = [{ w: 6, t: 'Arquitetura aprovada' }, { w: 18, t: 'Piloto em produção' }, { w: 36, t: 'IA em operação' }];

export default function M09Roadmap() {
  const [open, setOpen] = useState<Set<number>>(new Set([1]));
  const [sel, setSel] = useState<number | null>(1);
  const [scale, setScale] = useState<'w' | 'm'>('m');
  const p = PHASES.find((x) => x.id === sel);
  const related = p ? new Set([p.id, ...p.deps, ...PHASES.filter((x) => x.deps.includes(p.id)).map((x) => x.id)]) : null;
  const pos = (s: number, e: number) => ({ left: `${(s / WEEKS) * 100}%`, width: `${((e - s) / WEEKS) * 100}%` });
  const toggle = (id: number) => setOpen((o) => { const n = new Set(o); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const ticks = scale === 'm' ? Array.from({ length: 12 }, (_, i) => ({ l: `M${i + 1}`, w: i * (52 / 12) })) : Array.from({ length: 13 }, (_, i) => ({ l: `S${i * 4}`, w: i * 4 }));

  return (
    <>
      <SectionHeader n="09" question="Em que ordem, e com quais entregas, a transformação acontece?"
        title="Roadmap de transformação"
        lead="Seis fases sobrepostas, com o piloto em produção por volta da 18ª semana. Expanda as fases para ver atividades, selecione para ver entregáveis e dependências."
        aside={<div className="row tight"><Tag status="hypothesis">Durações preliminares até o fim do discovery</Tag><Segmented label="Escala" value={scale} onChange={setScale} options={[{ value: 'm', label: 'Meses' }, { value: 'w', label: 'Semanas' }]} /></div>} />
      <div className="gantt-scroll">
        <div className="gantt" role="table" aria-label="Cronograma de transformação">
          <div className="gh" role="columnheader">Fase</div>
          <div className="gh" role="columnheader" style={{ position: 'relative', height: 40 }}>
            {ticks.map((t) => <span key={t.l} style={{ position: 'absolute', left: `${(t.w / WEEKS) * 100}%`, paddingLeft: 4 }}>{t.l}</span>)}
          </div>
          {PHASES.map((ph) => {
            const faded = related && !related.has(ph.id);
            return (
              <Fragment key={ph.id}>
                <div className="glabel" role="rowheader" style={{ opacity: faded ? 0.4 : 1 }}>
                  <button className="icon-btn" style={{ width: 32, height: 32 }} aria-expanded={open.has(ph.id)} aria-label={`${open.has(ph.id) ? 'Recolher' : 'Expandir'} ${ph.t}`} onClick={() => toggle(ph.id)}>
                    {open.has(ph.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  <span><span className="caption">{ph.id}</span> {ph.t}</span>
                </div>
                <div className="gtrack" role="cell">
                  {MILESTONES.map((m) => <span key={m.t} aria-hidden style={{ position: 'absolute', left: `${(m.w / WEEKS) * 100}%`, top: 0, bottom: 0, borderLeft: '1px dashed var(--color-accent)' }} />)}
                  <button className={`gbar prelim ${sel === ph.id ? 'selected' : ''} ${faded ? 'faded' : ''}`} style={pos(ph.s, ph.e)} onClick={() => { setSel(sel === ph.id ? null : ph.id); if (!open.has(ph.id)) toggle(ph.id); }}
                    aria-pressed={sel === ph.id} aria-label={`${ph.t}: semanas ${ph.s} a ${ph.e}`}>
                    S{ph.s}–S{ph.e}
                  </button>
                </div>
                {open.has(ph.id) && ph.subs.map((s) => (
                  <Fragment key={s.t}>
                    <div className="glabel sub" role="rowheader" style={{ opacity: faded ? 0.4 : 1 }}>{s.t}</div>
                    <div className="gtrack sub" role="cell"><span className={`gbar sub ${faded ? 'faded' : ''}`} style={pos(s.s, s.e)} title={`S${s.s}–S${s.e}`} /></div>
                  </Fragment>
                ))}
              </Fragment>
            );
          })}
          <div className="glabel" role="rowheader"><Flag size={16} /> Marcos</div>
          <div className="gtrack" role="cell">
            {MILESTONES.map((m) => (
              <span key={m.t} className="caption" style={{ position: 'absolute', left: `${(m.w / WEEKS) * 100}%`, top: '50%', transform: 'translate(-6px, -50%)', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
                <span style={{ width: 12, height: 12, background: 'var(--color-accent)', transform: 'rotate(45deg)' }} />{m.t}
              </span>
            ))}
          </div>
        </div>
      </div>
      {p ? (
        <section className="grid c3" aria-live="polite">
          <div className="card"><span className="eyebrow">FASE {p.id} · SEMANAS {p.s}–{p.e}</span><h2 className="h2">{p.t}</h2><p className="small">{p.goal}</p></div>
          <div className="card"><span className="eyebrow">ENTREGÁVEIS</span><ul className="small" style={{ margin: 0, paddingLeft: 'var(--space-5)' }}>{p.deliv.map((d) => <li key={d}>{d}</li>)}</ul></div>
          <div className="card"><span className="eyebrow">DEPENDÊNCIAS</span>
            <p className="small"><strong>Depende de:</strong> {p.deps.length ? p.deps.map((d) => PHASES[d - 1].t).join(', ') : 'início do projeto'}</p>
            <p className="small"><strong>Habilita:</strong> {PHASES.filter((x) => x.deps.includes(p.id)).map((x) => x.t).join(', ') || 'operação contínua'}</p>
            <p className="caption">No cronograma, fases sem relação com a selecionada ficam esmaecidas.</p>
          </div>
        </section>
      ) : <Callout>Selecione uma fase para ver entregáveis e dependências.</Callout>}
    </>
  );
}
