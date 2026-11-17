import { useMemo, useState } from 'react';
import { BarChart3, Boxes, CalendarCheck, CheckCircle2, ClipboardCheck, Compass, Handshake, Monitor, Rocket, ShoppingCart, Target } from 'lucide-react';
import { Diagram, type DEdge, type DNode } from '../components/Diagram';
import { LineChart } from '../components/Charts';
import { Callout, SectionHeader, Segmented, Stat, Tag } from '../components/ui';
import { brl, brlShort, num, pct } from '../lib/util';
import { UNITS } from '../data/cockpit';

type Scen = 'cons' | 'base' | 'otim';
const SCEN: Record<Scen, { l: string; rw: number; rc: number; rp: number }> = {
  cons: { l: 'Conservador', rw: 15, rc: 0.8, rp: 2 },
  base: { l: 'Base', rw: 25, rc: 1.5, rp: 3 },
  otim: { l: 'Otimista', rw: 35, rc: 2.5, rp: 5 },
};

/**
 * Modelo do business case (mensal, em R$):
 *   W  = R × w × rw                  economia com redução de desperdício
 *   C  = R × max(cmv − w, 0) × rc    economia em compras (CMV sem desperdício, evita dupla contagem)
 *   P  = Op × rp                     ganho de produtividade no custo operacional
 *   L  = W + C + P − custo recorrente (benefício líquido em regime)
 *   Benefício do mês m = L × min(1, m / ramp)
 *   Fluxo acumulado(m) = −I + Σ benefício(1..m)
 *   Payback = primeiro mês com fluxo acumulado ≥ 0
 *   ROI(n meses) = fluxo acumulado(n) ÷ I
 */
function model(p: { R: number; cmv: number; w: number; op: number; I: number; rec: number; rw: number; rc: number; rp: number; ramp: number }) {
  const W = p.R * (p.w / 100) * (p.rw / 100);
  const C = p.R * Math.max(p.cmv - p.w, 0) / 100 * (p.rc / 100);
  const P = p.op * (p.rp / 100);
  const L = W + C + P - p.rec;
  const cum: number[] = [];
  let acc = -p.I, payback: number | null = null;
  for (let m = 1; m <= 36; m++) {
    acc += L * Math.min(1, m / Math.max(1, p.ramp));
    cum.push(acc);
    if (payback == null && acc >= 0) payback = m;
  }
  return { W, C, P, L, cum, payback, roi12: cum[11] / p.I, roi36: cum[35] / p.I, year1: cum[11] + p.I };
}

const Num = ({ id, label, value, onChange, step = 1, min = 0, suffix }: { id: string; label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; suffix?: string }) => (
  <div className="field">
    <label htmlFor={id}>{label}{suffix && <span>{suffix}</span>}</label>
    <input id={id} className="input" type="number" inputMode="decimal" min={min} step={step} value={value}
      onChange={(e) => { const v = parseFloat(e.target.value); onChange(Number.isFinite(v) ? Math.max(min, v) : min); }} />
  </div>
);
const Range = ({ label, value, onChange, min, max, step, fmt }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; fmt: (v: number) => string }) => (
  <div className="field"><span className="label">{label}<output>{fmt(value)}</output></span>
    <input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} /></div>
);

const PILOT: DNode[] = [
  { id: 'p1', x: 0, y: 0, w: 180, label: 'PDV', sub: 'vendas por item', icon: Monitor },
  { id: 'p2', x: 240, y: 0, w: 180, label: 'Estoque', sub: 'teórico × físico', icon: Boxes },
  { id: 'p3', x: 480, y: 0, w: 180, label: 'Compras', sub: 'pedido + aprovação', icon: ShoppingCart, kind: 'app' },
  { id: 'p4', x: 720, y: 0, w: 220, label: 'Dashboard CMV', sub: 'e desperdício', icon: BarChart3, kind: 'app' },
  { id: 'p5', x: 360, y: 120, w: 180, label: 'Estoca.ai', sub: 'recebimento conferido', icon: ClipboardCheck, kind: 'estoca', status: 'confirmed' },
];
const PILOT_E: DEdge[] = [{ from: 'p1', to: 'p2', kind: 'event' }, { from: 'p2', to: 'p3' }, { from: 'p3', to: 'p4' }, { from: 'p3', to: 'p5', kind: 'manual', label: 'entrega' }, { from: 'p5', to: 'p2', kind: 'event' }, { from: 'p5', to: 'p4' }];

export default function M10BusinessCase() {
  const [units, setUnits] = useState(7);
  const [R, setR] = useState(3_000_000);
  const [cmv, setCmv] = useState(32);
  const [w, setW] = useState(4.5);
  const [op, setOp] = useState(900_000);
  const [I, setI] = useState(600_000);
  const [rec, setRec] = useState(25_000);
  const [ramp, setRamp] = useState(6);
  const [scen, setScen] = useState<Scen>('base');
  const [lev, setLev] = useState(SCEN.base);
  const applyScen = (s: Scen) => { setScen(s); setLev(SCEN[s]); };

  const r = useMemo(() => model({ R, cmv, w, op, I, rec, ramp, ...lev }), [R, cmv, w, op, I, rec, ramp, lev]);
  const [pilotUnit, setPilotUnit] = useState('ins-1');
  const [steps, setSteps] = useState([false, false, false]);

  return (
    <>
      <SectionHeader n="10" question="Qual o retorno potencial — e como começamos?"
        title="Business case e parceria"
        lead="Uma calculadora transparente: todas as premissas são editáveis e as fórmulas estão abertas. Os valores iniciais são ilustrativos e devem ser substituídos pelos números reais do grupo."
        aside={<Tag status="hypothesis">Premissas editáveis · sem resultados garantidos</Tag>} />

      <section className="split calc" aria-label="Calculadora de impacto econômico">
        <div className="card">
          <strong className="small">Premissas da operação</strong>
          <div className="grid c2">
            <Num id="u" label="Unidades" value={units} onChange={setUnits} />
            <Num id="r" label="Faturamento mensal" suffix="R$" value={R} onChange={setR} step={50000} />
            <Num id="c" label="CMV" suffix="% receita" value={cmv} onChange={setCmv} step={0.5} />
            <Num id="w" label="Desperdício" suffix="% receita" value={w} onChange={setW} step={0.1} />
            <Num id="o" label="Custo operacional" suffix="R$/mês" value={op} onChange={setOp} step={10000} />
            <Num id="ramp" label="Meses até benefício pleno" value={ramp} onChange={setRamp} min={1} />
          </div>
          <hr className="divider" />
          <strong className="small">Investimento (premissa para simulação)</strong>
          <div className="grid c2">
            <Num id="i" label="Investimento inicial" suffix="R$" value={I} onChange={(v) => setI(Math.max(1, v))} step={10000} min={1} />
            <Num id="rec" label="Custo recorrente" suffix="R$/mês" value={rec} onChange={setRec} step={1000} />
          </div>
          <p className="caption">Valores de investimento são apenas para testar a sensibilidade e <strong>não constituem proposta de preço</strong>; o orçamento é definido após o discovery.</p>
          <hr className="divider" />
          <div className="row" style={{ justifyContent: 'space-between' }}><strong className="small">Alavancas de melhoria</strong>
            <Segmented label="Cenário" value={scen} onChange={applyScen} options={(Object.keys(SCEN) as Scen[]).map((k) => ({ value: k, label: SCEN[k].l }))} /></div>
          <Range label="Redução relativa do desperdício" value={lev.rw} min={0} max={50} step={1} onChange={(v) => setLev({ ...lev, rw: v })} fmt={(v) => `${v}%`} />
          <Range label="Redução do CMV em compras (exceto desperdício)" value={lev.rc} min={0} max={5} step={0.1} onChange={(v) => setLev({ ...lev, rc: v })} fmt={(v) => `${num(v, 1)}%`} />
          <Range label="Ganho de produtividade no custo operacional" value={lev.rp} min={0} max={10} step={0.5} onChange={(v) => setLev({ ...lev, rp: v })} fmt={(v) => `${num(v, 1)}%`} />
        </div>

        <div className="stack">
          <div className="grid kpis">
            <div className="card"><Stat label="Benefício líquido / mês (regime)" value={brlShort(r.L)} /></div>
            <div className="card"><Stat label="Payback" value={r.payback ? `${r.payback} meses` : '> 36 meses'} /></div>
            <div className="card"><Stat label="ROI em 12 meses" value={pct(r.roi12, 0)} /></div>
            <div className="card"><Stat label="ROI em 36 meses" value={pct(r.roi36, 0)} /></div>
          </div>
          <div className="card">
            <div className="card-head"><strong className="small">Fluxo de caixa acumulado (36 meses)</strong><span className="caption">inclui rampa de {ramp} {ramp === 1 ? 'mês' : 'meses'}</span></div>
            <LineChart ariaLabel="Fluxo de caixa acumulado" labels={r.cum.map((_, i) => `M${i + 1}`)} series={[{ name: 'Fluxo acumulado', values: r.cum.map((v) => Math.max(v, 0)) }, { name: 'Investimento a recuperar', values: r.cum.map((v) => (v < 0 ? -v : 0)), color: 'var(--color-accent)', dashed: true }]} fmt={brlShort} height={220} />
          </div>
          <div className="grid c3">
            <div className="card"><Stat label="Desperdício evitado / mês" value={brlShort(r.W)} /><span className="caption">{brl(R)} × {num(w, 1)}% × {lev.rw}%</span></div>
            <div className="card"><Stat label="Economia em compras / mês" value={brlShort(r.C)} /><span className="caption">{brl(R)} × {num(Math.max(cmv - w, 0), 1)}% × {num(lev.rc, 1)}%</span></div>
            <div className="card"><Stat label="Produtividade / mês" value={brlShort(r.P)} /><span className="caption">{brl(op)} × {num(lev.rp, 1)}%</span></div>
          </div>
          <Callout>
            <strong>Fórmulas:</strong> benefício líquido = desperdício evitado + economia em compras + produtividade − custo recorrente. A economia em compras incide sobre o CMV <em>sem</em> o desperdício, para evitar dupla contagem. Payback = primeiro mês com fluxo acumulado ≥ 0. ROI = fluxo acumulado ÷ investimento. Benefício por unidade: {brlShort(r.L / Math.max(units, 1))}/mês.
          </Callout>
        </div>
      </section>

      <section className="stack" aria-labelledby="mod">
        <span className="question">Como podemos trabalhar juntos?</span>
        <h2 id="mod" className="h2">Três modalidades de parceria</h2>
        <div className="grid c3">
          {[
            { icon: Compass, t: 'Discovery & Architecture', d: 'Diagnóstico, validação de hipóteses e arquitetura-alvo.', items: ['Entrevistas com áreas e unidades', 'Mapa AS-IS e TO-BE validados', 'Business case com dados reais', 'Plano do piloto'], dur: '≈ 6 semanas (preliminar)' },
            { icon: Rocket, t: 'Integration & Intelligence Pilot', d: 'Piloto em uma marca e poucas unidades, ponta a ponta.', items: ['Integrações PDV, Estoca.ai e ERP', 'Fundação de dados do piloto', 'Dashboard de CMV e desperdício', 'Pedido sugerido com aprovação'], dur: '≈ 12 a 16 semanas (preliminar)' },
            { icon: Handshake, t: 'Intelligent Operations Partnership', d: 'Time dedicado para escalar e evoluir continuamente.', items: ['Expansão para todas as marcas', 'IA aplicada e copiloto', 'Governança de dados e IA', 'Roadmap trimestral com os sócios'], dur: 'Contínuo' },
          ].map(({ icon: Ic, t, d, items, dur }, i) => (
            <article key={t} className={`card ${i === 1 ? 'dark' : ''}`}>
              <span className={`bubble ${i === 1 ? '' : 'dark'}`}><Ic size={20} /></span>
              <h3 className="h2" style={{ fontSize: 'var(--text-base)' }}>{t}</h3>
              <p className="small">{d}</p>
              <ul className="small" style={{ margin: 0, paddingLeft: 'var(--space-5)' }}>{items.map((x) => <li key={x}>{x}</li>)}</ul>
              <span className="caption" style={{ color: i === 1 ? 'var(--color-light)' : undefined }}>{dur} · investimento definido após o discovery</span>
            </article>
          ))}
        </div>
      </section>

      <section className="stack" aria-labelledby="pilot">
        <span className="question">Por onde começar?</span>
        <h2 id="pilot" className="h2">Recomendação de piloto: PDV → Estoque → Compras → Dashboard de CMV e desperdício</h2>
        <p className="lead">O menor ciclo que fecha o circuito venda–estoque–compra, aproveita a Estoca.ai já em uso e mede o impacto em CMV e desperdício em poucas semanas.</p>
        <Diagram ariaLabel="Escopo do piloto recomendado" nodes={PILOT} edges={PILOT_E} height={300} legend={['data', 'event', 'manual']} flowing />
        <div className="grid c3">
          <div className="card"><Target size={20} /><strong className="small">Critérios de sucesso (a acordar)</strong><ul className="small" style={{ margin: 0, paddingLeft: 'var(--space-5)' }}><li>CMV diário disponível até as 9h</li><li>Desperdício medido por item e unidade</li><li>Divergências de recebimento tratadas em até 48h</li></ul></div>
          <div className="card"><Boxes size={20} /><strong className="small">Escopo</strong><p className="small">Uma marca, 1 a 2 unidades, itens de maior custo (curva A) e fornecedores principais.</p></div>
          <div className="card"><CalendarCheck size={20} /><strong className="small">Prazo indicativo</strong><p className="small">Piloto em produção por volta da semana 18 do roadmap, sujeito ao discovery.</p></div>
        </div>
      </section>

      <section className="card dark" style={{ padding: 'var(--space-9) var(--space-8)' }} aria-labelledby="next">
        <span className="eyebrow" style={{ color: 'var(--color-white)' }}>PRÓXIMOS PASSOS</span>
        <h2 id="next" className="display" style={{ fontSize: 'clamp(24px, 4.5vw, 70px)' }}>Vamos validar a arquitetura, escolher o piloto e iniciar o discovery.</h2>
        <div className="grid c3">
          {[
            { t: 'Validar a arquitetura', d: 'Sessão de 2h com sócios e áreas para revisar AS-IS e TO-BE.' },
            { t: 'Selecionar a operação piloto', d: 'Escolha a unidade candidata abaixo.' },
            { t: 'Iniciar o discovery', d: 'Kick-off com entrevistas e acesso aos sistemas.' },
          ].map((s, i) => (
            <button key={s.t} className="card interactive" aria-pressed={steps[i]} onClick={() => setSteps((st) => st.map((v, j) => (j === i ? !v : v)))} style={{ background: steps[i] ? 'var(--color-white)' : 'transparent', color: steps[i] ? 'var(--color-dark)' : 'var(--color-white)', borderColor: 'var(--color-white)' }}>
              <div className="row tight">{steps[i] ? <CheckCircle2 size={20} /> : <span className="bubble sm" style={{ background: 'transparent', border: '1px solid currentColor', color: 'inherit' }}>{i + 1}</span>}<strong>{s.t}</strong></div>
              <p className="small">{s.d}</p>
            </button>
          ))}
        </div>
        <div className="row">
          <div className="field" style={{ minWidth: 260 }}>
            <label htmlFor="pilot-unit" style={{ color: 'var(--color-white)' }}>Unidade candidata ao piloto (lista simulada)</label>
            <select id="pilot-unit" className="select" value={pilotUnit} onChange={(e) => setPilotUnit(e.target.value)}>{UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
          </div>
          <p className="small" aria-live="polite" style={{ color: 'var(--color-light)', maxWidth: 520 }}>
            {steps.filter(Boolean).length}/3 passos marcados · piloto sugerido em <strong>{UNITS.find((u) => u.id === pilotUnit)!.name}</strong>. Esta seleção serve para orientar a conversa e não envia dados.
          </p>
        </div>
      </section>
    </>
  );
}
