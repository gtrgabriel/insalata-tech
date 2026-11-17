import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Waves } from 'lucide-react';
import { Diagram, StatusLegend } from '../components/Diagram';
import { NodePanel } from '../components/NodePanel';
import { Callout, SectionHeader, Segmented, Tag } from '../components/ui';
import { JOURNEY, JOURNEY_EDGES, TOBE_EDGES, TOBE_GROUPS, TOBE_NODES } from '../data/tobe';
import { useApp } from '../lib/store';

type Tab = 'arch' | 'journey';

export default function M04ToBe() {
  const [tab, setTab] = useState<Tab>('arch');
  return (
    <>
      <SectionHeader n="04" question="Qual arquitetura transforma dados operacionais em decisões?"
        title="Arquitetura-alvo em seis camadas"
        lead="Das fontes às aplicações, com governança atravessando tudo. Selecione um componente para ver o papel no negócio e, no modo técnico, as opções de implementação e dependências."
        aside={<Segmented label="Visualização" value={tab} onChange={setTab} options={[{ value: 'arch', label: 'Arquitetura em camadas' }, { value: 'journey', label: 'Jornada do dado até a decisão' }]} />} />
      {tab === 'arch' ? <Architecture /> : <Journey />}
    </>
  );
}

function Architecture() {
  const { mode, setMode } = useApp();
  const [sel, setSel] = useState<string | null>(null);
  const [flow, setFlow] = useState(true);
  const [deps, setDeps] = useState<'direct' | 'chain'>('chain');
  const nodes = useMemo(() => TOBE_NODES.map((n) => ({ ...n, sub: mode === 'exec' ? n.execSub : n.techSub })), [mode]);
  const node = nodes.find((n) => n.id === sel) ?? null;
  const info = TOBE_NODES.find((n) => n.id === sel)?.info;

  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row tight">
          <button className="btn sm secondary" aria-pressed={flow} onClick={() => setFlow((f) => !f)}><Waves size={14} />{flow ? 'Pausar fluxo de dados' : 'Animar fluxo de dados'}</button>
          <Segmented label="Dependências" value={deps} onChange={setDeps} options={[{ value: 'direct', label: 'Dependências diretas' }, { value: 'chain', label: 'Cadeia ponta a ponta' }]} />
        </div>
        <Segmented label="Nível de detalhe" value={mode} onChange={setMode} options={[{ value: 'exec', label: 'Visão executiva' }, { value: 'tech', label: 'Visão técnica' }]} />
      </div>
      <div className="dsplit">
        <Diagram ariaLabel="Arquitetura-alvo TO-BE em seis camadas" nodes={nodes} edges={TOBE_EDGES} groups={TOBE_GROUPS} selectedId={sel} onSelect={setSel}
          deps={deps} flowing={flow} height={720} extraLegend={<StatusLegend />} />
        <NodePanel node={node} nodes={nodes} edges={TOBE_EDGES} onSelect={setSel} onClose={() => setSel(null)} emptyText="Selecione um componente para ver o valor de negócio, opções técnicas e a cadeia de dependências destacada no diagrama.">
          {info && (
            <>
              <div className="stack tight"><span className="eyebrow">PAPEL NO NEGÓCIO</span><p className="small">{info.exec}</p></div>
              {mode === 'tech' ? (
                <>
                  <div className="stack tight"><span className="eyebrow">OPÇÕES TÉCNICAS</span><ul>{info.tech.map((t) => <li key={t}>{t}</li>)}</ul></div>
                  {info.deps && <dl className="kv"><dt>Dependência</dt><dd>{info.deps}</dd></dl>}
                  <p className="caption">Ferramentas citadas são candidatas; a escolha final depende do discovery (stack atual, custo e time).</p>
                </>
              ) : <button className="btn sm ghost" onClick={() => setMode('tech')}>Ver detalhes técnicos</button>}
            </>
          )}
        </NodePanel>
      </div>
      <div className="grid c3">
        <Callout tone="dark"><strong>Princípio 1 — integrar antes de substituir.</strong> Sistemas que funcionam permanecem; a camada de integração os conecta.</Callout>
        <Callout tone="dark"><strong>Princípio 2 — uma única versão da verdade.</strong> CMV, margem e desperdício definidos uma vez na camada semântica.</Callout>
        <Callout tone="dark"><strong>Princípio 3 — IA com humano no circuito.</strong> Modelos recomendam; compras e financeiro aprovam.</Callout>
      </div>
    </>
  );
}

function Journey() {
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number>();
  const nodes = JOURNEY.map((j) => j.node);
  const edges = [...JOURNEY_EDGES, { from: 'j9', to: 'j6', kind: 'ai' as const, label: 'retroalimenta' }];

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setTimeout(() => {
      setStep((s) => { if (s >= JOURNEY.length - 1) { setPlaying(false); return s; } return s + 1; });
    }, step < 0 ? 200 : 1500);
    return () => clearTimeout(timer.current);
  }, [playing, step]);

  const activeNodes = new Set(JOURNEY.slice(0, step + 1).map((j) => j.node.id));
  const activeEdges = new Set(JOURNEY_EDGES.filter((_, i) => i < step).map((e) => `${e.from}>${e.to}`));
  const cur = step >= 0 ? JOURNEY[step] : null;

  return (
    <>
      <div className="row">
        <button className="btn" onClick={() => { if (step >= JOURNEY.length - 1) setStep(-1); setPlaying((p) => !p); }}>
          {playing ? <><Pause size={16} /> Pausar</> : <><Play size={16} /> {step >= 0 ? 'Continuar' : 'Simular jornada'}</>}
        </button>
        <button className="btn ghost" onClick={() => { setPlaying(false); setStep(-1); }} disabled={step < 0}><RotateCcw size={16} /> Reiniciar</button>
        <Tag status="simulated">Exemplo ilustrativo</Tag>
      </div>
      <div className="split">
        <Diagram ariaLabel="Jornada de um dado de venda até a decisão" nodes={nodes} edges={edges} height={460} legend={['data', 'event', 'ai']}
          activeNodes={activeNodes} activeEdges={activeEdges} selectedId={cur?.node.id ?? null} onSelect={(id) => { const i = JOURNEY.findIndex((j) => j.node.id === id); if (i >= 0) { setPlaying(false); setStep(i); } }} />
        <aside className="panel" aria-live="polite">
          <span className="eyebrow">ETAPA {Math.max(step + 1, 0)} DE {JOURNEY.length}</span>
          {cur ? (
            <>
              <h3>{cur.node.label.split(':')[0]}</h3>
              <Tag solid>{cur.t}</Tag>
              <p className="small">{cur.d}</p>
            </>
          ) : <p className="small muted">Clique em “Simular jornada” para acompanhar uma venda até a decisão de compra — ou selecione uma etapa no diagrama.</p>}
          <div className="bar green"><span style={{ width: `${((step + 1) / JOURNEY.length) * 100}%` }} /></div>
          <ol className="small" style={{ margin: 0, paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {JOURNEY.map((j, i) => <li key={j.node.id} style={{ fontWeight: i === step ? 600 : 400, opacity: i <= step ? 1 : .6 }}>{j.node.label.split(':')[0]}</li>)}
          </ol>
        </aside>
      </div>
    </>
  );
}
