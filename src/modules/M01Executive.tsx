import { useEffect, useState } from 'react';
import { BrainCircuit, Boxes, Database, LayoutGrid, Pause, Play, Sparkles, TrendingUp, Workflow } from 'lucide-react';
import { Segmented, Tag } from '../components/ui';
import { useApp } from '../lib/store';
import { reducedMotion } from '../lib/util';

type Stage = 'today' | 'integration' | 'intelligence';
const STAGES: { value: Stage; label: string; title: string; text: string }[] = [
  { value: 'today', label: '1 · Hoje', title: 'Sistemas e dados potencialmente fragmentados', text: 'Cada marca e cada unidade convivem com PDV, ERP, apps de delivery, planilhas e conferências em papel. A informação existe, mas chega tarde, em formatos diferentes, e depende de consolidação manual.' },
  { value: 'integration', label: '2 · Integração', title: 'Processos conectados, informação consolidada', text: 'Uma camada de integração conecta as fontes em um núcleo de dados único. Vendas, estoque, recebimento, compras e financeiro passam a falar a mesma língua — por unidade, marca e canal.' },
  { value: 'intelligence', label: '3 · Inteligência', title: 'Decisões apoiadas por modelos analíticos e IA', text: 'Sobre a base consolidada, modelos preveem demanda, sugerem reposição, apontam desperdício e divergências de preço. As pessoas decidem, com aprovação humana nas decisões críticas.' },
];

const BRANDS = ['Insalata', 'Good Market', 'Gelina', 'Delivery'];
const SYSTEMS = ['ERP', 'PDV', 'Apps de delivery', 'Estoca.ai', 'Compras', 'Financeiro', 'Planilhas', 'Produção'];
const SCATTER = [[-250, -170], [210, -190], [300, 40], [-320, 70], [-120, 210], [150, 200], [-40, -230], [330, -100]];
const INSIGHTS = [
  { x: -340, y: -230, t: 'Previsão: +18% de saladas no sábado' },
  { x: 120, y: -265, t: 'Divergência NF × negociado: alerta para compras' },
  { x: 150, y: 245, t: 'Desperdício acima da meta em 1 unidade' },
];

const PILLARS = [
  { icon: Database, t: 'Data Intelligence', d: 'Um núcleo de dados confiável, com governança e uma única versão da verdade.' },
  { icon: Workflow, t: 'Integração de Sistemas', d: 'ERP, PDV, delivery, estoque e Estoca.ai conectados por APIs, eventos e conectores.' },
  { icon: BrainCircuit, t: 'IA Aplicada', d: 'Previsão, recomendações e alertas com aprovação humana nas decisões críticas.' },
  { icon: Boxes, t: 'Estoque e Supply Chain', d: 'Do consumo teórico à conciliação do recebimento, com menos ruptura e menos perda.' },
  { icon: LayoutGrid, t: 'Gestão Operacional', d: 'Cockpit executivo e portais para líderes de unidade, compras e financeiro.' },
  { icon: TrendingUp, t: 'Crescimento e Competitividade', d: 'Escalar marcas e unidades sem escalar a complexidade na mesma proporção.' },
];

export default function M01Executive() {
  const { go } = useApp();
  const [stage, setStage] = useState<Stage>('today');
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStage((s) => (s === 'today' ? 'integration' : s === 'integration' ? 'intelligence' : 'today')), 4200);
    return () => clearInterval(id);
  }, [playing]);

  const cur = STAGES.find((s) => s.value === stage)!;
  const connected = stage !== 'today';
  const smart = stage === 'intelligence';
  const pos = (i: number, n: number, r: number) => [Math.cos((i / n) * Math.PI * 2 - Math.PI / 2) * r, Math.sin((i / n) * Math.PI * 2 - Math.PI / 2) * r];
  const tr = reducedMotion() ? 'none' : 'transform 1.25s cubic-bezier(.2,.7,.2,1), opacity .75s';

  return (
    <>
      <section className="card dark" style={{ padding: 'var(--space-9) var(--space-8)', gap: 'var(--space-8)' }} aria-labelledby="hero-title">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="eyebrow" style={{ color: 'var(--color-white)' }}>MÓDULO 01 · INSALATA INTELLIGENCE</span>
          <span className="caption" style={{ color: 'var(--color-white)' }}>One ecosystem. Connected operations. Intelligent decisions.</span>
        </div>
        <h1 id="hero-title" className="display anim-slide" style={{ maxWidth: 1100 }}>O futuro da operação do Grupo Insalata começa pela inteligência dos dados.</h1>
        <p className="lead anim-fade" style={{ color: 'var(--color-light)' }}>
          De operações fragmentadas para um ecossistema inteligente, integrado e escalável — conectando ERPs, PDVs, delivery, estoque, Estoca.ai e IA para reduzir desperdício, proteger margem e sustentar o crescimento.
        </p>

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <Segmented<Stage> onDark label="Estágio da transformação" value={stage} onChange={(v) => { setStage(v); setPlaying(false); }} options={STAGES.map(({ value, label }) => ({ value, label }))} />
          <button className="btn sm inverse" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
            {playing ? <><Pause size={14} /> Pausar narrativa</> : <><Play size={14} /> Reproduzir narrativa</>}
          </button>
        </div>

        <div className="split hero-split">
          <svg viewBox="-460 -300 920 600" role="img" aria-label={`Ilustração do estágio: ${cur.title}`} style={{ width: '100%', height: 'auto', maxHeight: 520 }}>
            {smart && <circle r="230" style={{ fill: 'none', stroke: 'var(--color-secondary)', strokeWidth: 2, strokeDasharray: '4 10' }} className="edge-dash" />}
            {/* linhas */}
            {SYSTEMS.map((s, i) => {
              const [x, y] = connected ? pos(i, SYSTEMS.length, 255) : SCATTER[i];
              const [bx, by] = pos(i % 4, 4, 140);
              const d = connected ? `M0,0 L${x},${y}` : `M${bx},${by} L${x},${y}`;
              return (
                <g key={'l' + s}>
                  <path d={d} style={{ stroke: connected ? 'var(--color-white)' : 'var(--color-border-strong)', strokeOpacity: connected ? 0.55 : 0.5, strokeWidth: connected ? 1.5 : 1.2, strokeDasharray: connected ? undefined : '2 6', fill: 'none', transition: 'd 1.25s' }} />
                  {smart && <circle r="4" style={{ fill: 'var(--color-live)' }}><animateMotion dur={`${1.6 + (i % 3) * 0.4}s`} repeatCount="indefinite" path={`M${x},${y} L0,0`} /></circle>}
                </g>
              );
            })}
            {/* núcleo */}
            <g style={{ opacity: connected ? 1 : 0.25, transition: 'opacity .75s' }}>
              <circle r="78" style={{ fill: 'var(--color-white)' }} />
              <text textAnchor="middle" y="-6" style={{ fontSize: 16, fontWeight: 600, fill: 'var(--color-dark)' }}>Insalata</text>
              <text textAnchor="middle" y="14" style={{ fontSize: 16, fontWeight: 600, fill: 'var(--color-dark)' }}>Intelligence</text>
              <text textAnchor="middle" y="34" style={{ fontSize: 11, fill: 'var(--color-dark)' }}>{smart ? 'dados + IA' : 'núcleo de dados'}</text>
            </g>
            {/* marcas */}
            {BRANDS.map((b, i) => {
              const [x, y] = pos(i, 4, 140);
              const [cx, cy] = connected ? [x, y] : [x * 1.15, y * 1.15];
              return (
                <g key={b} style={{ transform: `translate(${cx}px, ${cy}px)`, transition: tr }}>
                  <circle r="44" style={{ fill: 'var(--color-accent)', stroke: 'var(--color-white)', strokeWidth: 2 }} />
                  <text textAnchor="middle" y={b.includes(' ') ? -3 : 5} style={{ fontSize: 13, fontWeight: 600, fill: 'var(--color-text)' }}>
                    {b.split(' ').map((w, j) => <tspan key={w} x="0" dy={j ? 16 : 0}>{w}</tspan>)}
                  </text>
                </g>
              );
            })}
            {/* sistemas */}
            {SYSTEMS.map((s, i) => {
              const [x, y] = connected ? pos(i, SYSTEMS.length, 255) : SCATTER[i];
              const w = s.length * 8 + 28;
              return (
                <g key={s} style={{ transform: `translate(${x}px, ${y}px) rotate(${connected ? 0 : (i % 2 ? 6 : -5)}deg)`, transition: tr }}>
                  <rect x={-w / 2} y="-17" width={w} height="34" rx="17" style={{ fill: connected ? 'var(--color-white)' : 'var(--color-dark)', stroke: 'var(--color-white)', strokeWidth: 1.5, strokeDasharray: connected ? undefined : '4 3' }} />
                  <text textAnchor="middle" y="5" style={{ fontSize: 13, fontWeight: 500, fill: connected ? 'var(--color-dark)' : 'var(--color-white)' }}>{s}</text>
                </g>
              );
            })}
            {/* insights */}
            {INSIGHTS.map((ins, i) => (
              <g key={ins.t} style={{ opacity: smart ? 1 : 0, transform: `translate(${ins.x}px, ${ins.y + (smart ? 0 : 16)}px)`, transition: `opacity .75s ${i * 0.25}s, transform 1.25s ${i * 0.25}s` }}>
                <rect width={ins.t.length * 6.6 + 34} height="30" rx="15" style={{ fill: 'var(--color-white)', stroke: 'var(--color-secondary)', strokeWidth: 2 }} />
                <circle cx="16" cy="15" r="5" style={{ fill: 'var(--color-secondary)' }} />
                <text x="28" y="19" style={{ fontSize: 12, fill: 'var(--color-text)' }}>{ins.t}</text>
              </g>
            ))}
          </svg>
          <div className="stack" aria-live="polite" key={stage}>
            <span className="eyebrow" style={{ color: 'var(--color-white)' }}>{cur.label.toUpperCase()}</span>
            <h2 className="h2 anim-slide">{cur.title}</h2>
            <p className="small anim-fade" style={{ color: 'var(--color-light)' }}>{cur.text}</p>
            {smart && <span className="caption anim-fade" style={{ color: 'var(--color-light)' }}><Sparkles size={12} /> Exemplos de insights ilustrativos (dados simulados).</span>}
          </div>
        </div>
      </section>

      <section className="stack" aria-labelledby="pillars">
        <span className="question">Que capacidades sustentam essa transformação?</span>
        <h2 id="pillars" className="h2">Seis pilares da proposta</h2>
        <div className="grid c3">
          {PILLARS.map(({ icon: I, t, d }, i) => (
            <article key={t} className="card anim-slide" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="bubble"><I size={20} aria-hidden /></span>
              <h3 className="h2" style={{ fontSize: 'var(--text-base)' }}>{t}</h3>
              <p className="small">{d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card" aria-labelledby="route">
        <div className="card-head">
          <div className="stack tight">
            <span className="question">Como ler esta proposta?</span>
            <h2 id="route" className="h2">Um roteiro em dez módulos — do diagnóstico ao piloto</h2>
          </div>
          <div className="row tight"><Tag status="confirmed" /><Tag status="hypothesis" /><Tag status="simulated" /><Tag status="proposed" /></div>
        </div>
        <p className="small">Cada módulo responde a uma pergunta estratégica. Use <strong>Visão executiva</strong> para a narrativa de negócio e <strong>Aprofundamento técnico</strong> para detalhes de arquitetura. O <strong>Modo apresentação</strong> permite navegar com as setas do teclado.</p>
        <div className="row">
          <button className="btn" onClick={() => go('ecosystem')}>Começar pelo ecossistema</button>
          <button className="btn secondary" onClick={() => go('to-be')}>Ir para a arquitetura-alvo</button>
          <button className="btn ghost" onClick={() => go('business-case')}>Ver business case</button>
        </div>
      </section>
    </>
  );
}
