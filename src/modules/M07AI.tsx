import { useEffect, useState, type ReactNode } from 'react';
import { Bot, Check, CheckCircle2, Cpu, HeartHandshake, Landmark, LineChart, Loader2, Lock, Play, ShoppingCart, Trash2, UserCheck, XCircle } from 'lucide-react';
import { Callout, SectionHeader, Tag } from '../components/ui';
import { brl, brl2, num, pct, sleep } from '../lib/util';

type AppId = 'forecast' | 'procurement' | 'waste' | 'finance' | 'copilot' | 'customer';
const APPS: { id: AppId; icon: typeof Bot; t: string; d: string; human: boolean }[] = [
  { id: 'forecast', icon: LineChart, t: 'Demand Forecasting', d: 'Previsão por item, dia e unidade para produzir e comprar certo.', human: false },
  { id: 'procurement', icon: ShoppingCart, t: 'Intelligent Procurement', d: 'Pedido sugerido e escolha de fornecedor, com aprovação por alçada.', human: true },
  { id: 'waste', icon: Trash2, t: 'Waste Intelligence', d: 'Produção × venda × perda, com recomendação de ajuste.', human: false },
  { id: 'finance', icon: Landmark, t: 'Financial Intelligence', d: 'Divergências de preço em NF-e e impacto no CMV.', human: true },
  { id: 'copilot', icon: Bot, t: 'Operational AI Copilot', d: 'Perguntas em linguagem natural, respostas com fonte.', human: false },
  { id: 'customer', icon: HeartHandshake, t: 'Customer Intelligence', d: 'Segmentos, recorrência e ações sugeridas por canal.', human: true },
];

export default function M07AI() {
  const [app, setApp] = useState<AppId>('forecast');
  const meta = APPS.find((a) => a.id === app)!;
  return (
    <>
      <SectionHeader n="07" question="Onde a IA gera valor concreto — e onde as pessoas continuam decidindo?"
        title="IA aplicada à operação"
        lead="Seis aplicações sobre a base de dados consolidada. Cada demonstração mostra a entrada, o processamento e a saída. Decisões com impacto financeiro exigem aprovação humana."
        aside={<Tag status="simulated">Demonstrações com dados simulados</Tag>} />
      <div className="grid c6" role="tablist" aria-label="Aplicações de IA">
        {APPS.map(({ id, icon: I, t, human }) => (
          <button key={id} role="tab" aria-selected={app === id} className="card interactive" onClick={() => setApp(id)} style={{ padding: 'var(--space-5)', gap: 'var(--space-3)' }}>
            <span className={`bubble ${app === id ? 'dark' : ''}`}><I size={20} /></span>
            <strong className="small">{t}</strong>
            {human && <span className="caption"><UserCheck size={12} /> aprovação humana</span>}
          </button>
        ))}
      </div>
      <section className="card" role="tabpanel" aria-label={meta.t} key={app}>
        <div className="card-head">
          <div className="stack tight"><h2 className="h2">{meta.t}</h2><p className="small">{meta.d}</p></div>
          <div className="row tight"><Tag status="proposed" />{meta.human && <Tag solid>Humano no circuito</Tag>}</div>
        </div>
        {app === 'forecast' && <Forecast />}
        {app === 'procurement' && <Procurement />}
        {app === 'waste' && <Waste />}
        {app === 'finance' && <Finance />}
        {app === 'copilot' && <Copilot />}
        {app === 'customer' && <Customer />}
      </section>
      <Callout tone="dark"><strong>Guarda-corpos:</strong> agentes e modelos têm acesso somente leitura aos dados consolidados. Não emitem pedidos, pagamentos ou alterações de preço sem aprovação de um responsável com alçada. Toda recomendação e decisão fica registrada em auditoria.</Callout>
    </>
  );
}

/* ---------- Estrutura comum: entrada → processamento → saída ---------- */
function useRun(steps: string[]) {
  const [state, setState] = useState<{ i: number; done: boolean }>({ i: -1, done: false });
  const run = async () => {
    setState({ i: 0, done: false });
    for (let i = 0; i < steps.length; i++) { setState({ i, done: false }); await sleep(450); }
    setState({ i: steps.length, done: true });
  };
  return { ...state, steps, run, running: state.i >= 0 && !state.done };
}

function Pipeline({ input, output, run }: { input: ReactNode; output: ReactNode; run: ReturnType<typeof useRun> }) {
  const steps = run.steps;
  return (
    <div className="grid c3" style={{ alignItems: 'start' }}>
      <div className="stack">
        <span className="eyebrow">1 · ENTRADA</span>
        {input}
        <button className="btn" onClick={run.run} disabled={run.running}>{run.running ? <><Loader2 size={16} className="spin" /> Processando…</> : <><Play size={16} /> Executar modelo</>}</button>
      </div>
      <div className="stack">
        <span className="eyebrow">2 · PROCESSAMENTO</span>
        <ol className="stack tight" style={{ listStyle: 'none', padding: 0, margin: 0 }} aria-live="polite">
          {steps.map((s, i) => {
            const st = run.i > i || run.done ? 'done' : run.i === i ? 'run' : 'idle';
            return (
              <li key={s} className="row tight small" style={{ opacity: st === 'idle' ? .55 : 1, transition: 'opacity .3s', flexWrap: 'nowrap' }}>
                <span className="bubble sm" style={{ background: st === 'done' ? 'var(--color-secondary)' : st === 'run' ? 'var(--color-dark)' : 'var(--color-light)', color: st === 'idle' ? 'var(--color-dark)' : 'var(--color-white)' }}>
                  {st === 'done' ? <Check size={14} /> : st === 'run' ? <Cpu size={14} /> : i + 1}
                </span>{s}
              </li>
            );
          })}
        </ol>
      </div>
      <div className="stack" aria-live="polite">
        <span className="eyebrow">3 · SAÍDA</span>
        {run.done ? <div className="stack anim-fade">{output}</div> : <p className="small muted">{run.running ? 'Gerando resultado…' : 'Ajuste a entrada e execute o modelo.'}</p>}
      </div>
    </div>
  );
}

const Field = ({ label, children, value }: { label: string; children: ReactNode; value?: string }) => (
  <div className="field"><span className="label">{label}{value && <output>{value}</output>}</span>{children}</div>
);
function Select<T extends string>({ value, onChange, opts, label }: { value: T; onChange: (v: T) => void; opts: [T, string][]; label: string }) {
  return <select className="select" aria-label={label} value={value} onChange={(e) => onChange(e.target.value as T)}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>;
}
const Approval = ({ what, onReset }: { what: string; onReset?: () => void }) => {
  const [d, setD] = useState<'pending' | 'ok' | 'no'>('pending');
  useEffect(() => setD('pending'), [what]);
  return (
    <div className="card" style={{ padding: 'var(--space-5)', borderColor: 'var(--color-dark)' }}>
      {d === 'pending' ? (
        <>
          <span className="caption"><UserCheck size={12} /> Aguardando aprovação humana</span>
          <p className="small">{what}</p>
          <div className="row tight">
            <button className="btn sm" onClick={() => setD('ok')}><CheckCircle2 size={14} /> Aprovar</button>
            <button className="btn sm ghost" onClick={() => setD('no')}><XCircle size={14} /> Rejeitar</button>
          </div>
        </>
      ) : (
        <div className="row tight small">{d === 'ok' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}{d === 'ok' ? 'Aprovado e registrado na trilha de auditoria (simulado).' : 'Rejeitado. O motivo alimenta o próximo ciclo do modelo (simulado).'}
          {onReset && <button className="btn sm ghost" onClick={() => { setD('pending'); onReset(); }}>Refazer</button>}</div>
      )}
    </div>
  );
};

/* ---------- 1. Demand Forecasting ---------- */
const ITEMS = { salmao: { l: 'Bowl de salmão (Insalata)', base: 120, heat: 1.12, rain: 0.95 }, caesar: { l: 'Salada Caesar (Insalata)', base: 90, heat: 1.15, rain: 0.9 }, pao: { l: 'Pão de fermentação natural (Good Market)', base: 210, heat: 0.95, rain: 1.03 }, gelato: { l: 'Gelato de pistache (Gelina)', base: 70, heat: 1.45, rain: 0.7 } };
const DOW = { seg: ['Segunda', 0.82], sex: ['Sexta', 1.1], sab: ['Sábado', 1.28], dom: ['Domingo', 1.2] } as const;
function Forecast() {
  const [item, setItem] = useState<keyof typeof ITEMS>('salmao');
  const [dow, setDow] = useState<keyof typeof DOW>('sab');
  const [clima, setClima] = useState<'ameno' | 'calor' | 'chuva'>('calor');
  const [evento, setEvento] = useState<'nenhum' | 'feriado' | 'evento'>('nenhum');
  const run = useRun(['Lê 104 semanas de vendas do item', 'Aplica sazonalidade semanal e anual', 'Ajusta por clima e calendário', 'Calcula intervalo de confiança']);
  const it = ITEMS[item];
  const f = it.base * DOW[dow][1] * (clima === 'calor' ? it.heat : clima === 'chuva' ? it.rain : 1) * (evento === 'feriado' ? 1.2 : evento === 'evento' ? 1.1 : 1);
  const v = Math.round(f);
  return (
    <Pipeline run={run}
      input={<>
        <Field label="Item"><Select label="Item" value={item} onChange={setItem} opts={Object.entries(ITEMS).map(([k, x]) => [k as keyof typeof ITEMS, x.l])} /></Field>
        <Field label="Dia"><Select label="Dia" value={dow} onChange={setDow} opts={Object.entries(DOW).map(([k, x]) => [k as keyof typeof DOW, x[0]])} /></Field>
        <Field label="Clima previsto"><Select label="Clima" value={clima} onChange={setClima} opts={[['ameno', 'Ameno'], ['calor', 'Calor (>30 °C)'], ['chuva', 'Chuva']]} /></Field>
        <Field label="Calendário"><Select label="Calendário" value={evento} onChange={setEvento} opts={[['nenhum', 'Dia comum'], ['feriado', 'Feriado'], ['evento', 'Evento na região']]} /></Field>
      </>}
      output={<>
        <div className="stat"><span className="label">Demanda prevista</span><span className="value">{v} unidades</span><span className="caption">intervalo {Math.round(v * 0.9)}–{Math.round(v * 1.1)} · base {it.base}/dia</span></div>
        <div className="bar"><span style={{ width: `${Math.min(100, (v / 320) * 100)}%` }} /></div>
        <p className="small"><strong>Recomendação:</strong> preparar {Math.round(v * 1.05)} porções ({pct(0.05, 0)} de margem de segurança) e programar a reposição dos insumos principais na véspera.</p>
      </>} />
  );
}

/* ---------- 2. Intelligent Procurement ---------- */
const SUPPLIERS = [{ n: 'Hortifruti A', price: 9.8, otif: 0.95 }, { n: 'Hortifruti B', price: 9.1, otif: 0.84 }, { n: 'Hortifruti C', price: 10.4, otif: 0.98 }];
function Procurement() {
  const [saldo, setSaldo] = useState(9);
  const [demanda, setDemanda] = useState(18);
  const [lead, setLead] = useState(1);
  const [cob, setCob] = useState(2);
  const [seg, setSeg] = useState(15);
  const run = useRun(['Consulta saldo e previsão', 'Calcula necessidade no lead time + cobertura', 'Aplica estoque de segurança', 'Pontua fornecedores (preço × OTIF)']);
  const need = demanda * (lead + cob) * (1 + seg / 100);
  const qty = Math.max(0, Math.ceil(need - saldo));
  // custo efetivo = preço ajustado pelo risco de falha de entrega
  const ranked = SUPPLIERS.map((s) => ({ ...s, eff: s.price / s.otif })).sort((a, b) => a.eff - b.eff);
  const best = ranked[0];
  return (
    <Pipeline run={run}
      input={<>
        <Field label="Saldo atual (kg de alface)" value={`${saldo} kg`}><input type="range" min={0} max={60} value={saldo} onChange={(e) => setSaldo(+e.target.value)} /></Field>
        <Field label="Demanda prevista por dia" value={`${demanda} kg`}><input type="range" min={5} max={40} value={demanda} onChange={(e) => setDemanda(+e.target.value)} /></Field>
        <Field label="Lead time do fornecedor" value={`${lead} dia(s)`}><input type="range" min={1} max={5} value={lead} onChange={(e) => setLead(+e.target.value)} /></Field>
        <Field label="Cobertura desejada" value={`${cob} dia(s)`}><input type="range" min={1} max={7} value={cob} onChange={(e) => setCob(+e.target.value)} /></Field>
        <Field label="Estoque de segurança" value={`${seg}%`}><input type="range" min={0} max={40} step={5} value={seg} onChange={(e) => setSeg(+e.target.value)} /></Field>
      </>}
      output={<>
        <div className="stat"><span className="label">Pedido sugerido</span><span className="value">{qty} kg</span><span className="caption">necessidade {num(need, 1)} kg − saldo {saldo} kg</span></div>
        <table className="data"><thead><tr><th>Fornecedor</th><th className="num">Preço</th><th className="num">OTIF</th><th className="num">Custo efetivo</th></tr></thead>
          <tbody>{ranked.map((s) => <tr key={s.n} style={{ fontWeight: s === best ? 600 : 400 }}><td>{s.n}{s === best && ' ✓'}</td><td className="num">{brl2(s.price)}</td><td className="num">{pct(s.otif, 0)}</td><td className="num">{num(s.eff, 2)}</td></tr>)}</tbody></table>
        {qty > 0 ? <Approval what={`Comprar ${qty} kg de ${best.n} por ${brl2(qty * best.price)}.`} /> : <p className="small">Saldo suficiente — nenhum pedido necessário.</p>}
      </>} />
  );
}

/* ---------- 3. Waste Intelligence ---------- */
function Waste() {
  const [rows, setRows] = useState([
    { item: 'Bowl de salmão', sold: 112, prod: 120, cost: 18.5 },
    { item: 'Salada Caesar', sold: 74, prod: 95, cost: 11.2 },
    { item: 'Croissant', sold: 160, prod: 190, cost: 3.4 },
    { item: 'Pão de fermentação', sold: 205, prod: 214, cost: 6.8 },
  ]);
  const run = useRun(['Cruza produção registrada com vendas do PDV', 'Calcula perda por item e custo', 'Compara com meta (8%)', 'Gera recomendação de produção']);
  const calc = rows.map((r) => ({ ...r, w: (r.prod - r.sold) / r.prod, loss: (r.prod - r.sold) * r.cost }));
  const flagged = calc.filter((r) => r.w > 0.08);
  return (
    <Pipeline run={run}
      input={<>
        {rows.map((r, i) => (
          <Field key={r.item} label={`${r.item} · produzido (vendido: ${r.sold})`} value={`${r.prod}`}>
            <input type="range" min={r.sold} max={Math.round(r.sold * 1.5)} value={r.prod} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, prod: +e.target.value } : x)))} />
          </Field>
        ))}
      </>}
      output={<>
        <table className="data"><thead><tr><th>Item</th><th className="num">Perda</th><th className="num">Custo</th></tr></thead>
          <tbody>{calc.map((r) => <tr key={r.item}><td>{r.w > 0.08 && '● '}{r.item}</td><td className="num" style={{ fontWeight: r.w > 0.08 ? 600 : 400 }}>{pct(r.w)}</td><td className="num">{brl(r.loss)}</td></tr>)}</tbody></table>
        <div className="stat"><span className="label">Perda total do dia</span><span className="value">{brl(calc.reduce((a, r) => a + r.loss, 0))}</span></div>
        {flagged.length ? <p className="small"><strong>Recomendação:</strong> {flagged.map((r) => `reduzir ${r.item.toLowerCase()} para ${Math.ceil(r.sold * 1.05)} un`).join('; ')}. Economia estimada de {brl(flagged.reduce((a, r) => a + (r.prod - Math.ceil(r.sold * 1.05)) * r.cost, 0))}/dia.</p>
          : <p className="small">Todos os itens dentro da meta de 8%.</p>}
      </>} />
  );
}

/* ---------- 4. Financial Intelligence ---------- */
function Finance() {
  const [tol, setTol] = useState(1);
  const lines = [
    { item: 'Salmão fresco (kg)', q: 22, neg: 84, nf: 89.9, sup: 'Pescados A' },
    { item: 'Alface americana (kg)', q: 26, neg: 9.8, nf: 9.8, sup: 'Hortifruti A' },
    { item: 'Abacate (un)', q: 150, neg: 3.2, nf: 3.28, sup: 'Hortifruti A' },
    { item: 'Queijo parmesão (kg)', q: 8, neg: 96, nf: 101.5, sup: 'Laticínios A' },
    { item: 'Azeite extravirgem (L)', q: 12, neg: 52, nf: 52.4, sup: 'Secos A' },
  ];
  const run = useRun(['Lê NF-e conferidas na Estoca.ai', 'Compara com preço negociado', 'Aplica tolerância', 'Calcula impacto no CMV']);
  const calc = lines.map((l) => ({ ...l, d: l.nf / l.neg - 1, imp: (l.nf - l.neg) * l.q }));
  const out = calc.filter((l) => l.d > tol / 100);
  return (
    <Pipeline run={run}
      input={<>
        <p className="small">5 linhas de NF-e da semana (simuladas), já conferidas no recebimento.</p>
        <Field label="Tolerância de preço" value={`${tol}%`}><input type="range" min={0} max={5} step={0.5} value={tol} onChange={(e) => setTol(+e.target.value)} /></Field>
        <Tag status="confirmed">Comparação NF-e × negociado já existe na Estoca.ai</Tag>
      </>}
      output={<>
        <table className="data"><thead><tr><th>Item</th><th className="num">Δ preço</th><th className="num">Impacto</th></tr></thead>
          <tbody>{calc.map((l) => <tr key={l.item} style={{ fontWeight: l.d > tol / 100 ? 600 : 400 }}><td>{l.d > tol / 100 && '● '}{l.item}</td><td className="num">{pct(l.d)}</td><td className="num">{brl2(l.imp)}</td></tr>)}</tbody></table>
        <div className="stat"><span className="label">Impacto acima da tolerância</span><span className="value">{brl2(out.reduce((a, l) => a + l.imp, 0))}</span><span className="caption">{out.length} divergência(s)</span></div>
        {out.length > 0 && <Approval what={`Solicitar crédito a ${[...new Set(out.map((o) => o.sup))].join(' e ')} no valor de ${brl2(out.reduce((a, l) => a + l.imp, 0))}.`} />}
      </>} />
  );
}

/* ---------- 5. Operational Copilot ---------- */
const QA = [
  { q: 'Qual unidade teve o maior desperdício na semana?', a: 'Good Market · Unidade 2, com 6,4% da receita em perdas — puxado por croissants e saladas prontas no fim do dia. A média do grupo foi 4,6%.', src: ['modelo_semantico.desperdicio_diario', 'pdv.vendas_itens'] },
  { q: 'Por que o CMV da Insalata subiu em outubro?', a: 'Dois fatores explicam 80% da alta: o preço do salmão (+7% vs. negociado em 3 entregas) e a perda de folhas acima da meta na Unidade 3. Sugestão: revisar o contrato de pescados.', src: ['estoca.recebimentos', 'modelo_semantico.cmv_mensal'] },
  { q: 'Quanto devo produzir de pão no domingo?', a: 'Previsão de 268 unidades (intervalo 241–295) para o Good Market · Unidade 1. Recomendo 280 unidades. A decisão final é do líder de produção.', src: ['ml.previsao_demanda', 'pdv.vendas_itens'] },
];
function Copilot() {
  const [i, setI] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  useEffect(() => {
    if (i == null) return;
    let k = 0; setTyped('');
    const id = setInterval(() => { k += 3; setTyped(QA[i].a.slice(0, k)); if (k >= QA[i].a.length) clearInterval(id); }, 18);
    return () => clearInterval(id);
  }, [i]);
  return (
    <div className="grid c2" style={{ alignItems: 'start' }}>
      <div className="stack">
        <span className="eyebrow">PERGUNTE AO COPILOTO</span>
        {QA.map((x, k) => <button key={x.q} className="btn ghost" style={{ justifyContent: 'flex-start', whiteSpace: 'normal', textAlign: 'left' }} aria-pressed={i === k} onClick={() => setI(k)}>{x.q}</button>)}
        <span className="caption"><Lock size={12} /> Acesso somente leitura à camada semântica. O copiloto não executa compras nem altera preços.</span>
      </div>
      <div className="card" style={{ background: 'var(--color-light)' }} aria-live="polite">
        {i == null ? <p className="small muted">Selecione uma pergunta.</p> : (
          <>
            <div className="row tight"><span className="bubble sm dark"><Bot size={16} /></span><strong className="small">Copiloto operacional</strong><Tag status="simulated" /></div>
            <p className="small">{typed}{typed.length < QA[i].a.length && '▍'}</p>
            {typed.length >= QA[i].a.length && <div className="row tight">{QA[i].src.map((s) => <span key={s} className="tag">fonte: {s}</span>)}</div>}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- 6. Customer Intelligence ---------- */
const SEG = {
  rec: { l: 'Recorrentes do delivery', n: 2840, freq: '3,1 pedidos/mês', ticket: 68, act: 'Combo semanal com entrega programada no canal próprio, reduzindo a dependência das taxas dos apps.' },
  brunch: { l: 'Clientes de brunch de fim de semana', n: 1920, freq: '1,4 visitas/mês', ticket: 94, act: 'Pré-venda de pães e cafés para retirada no domingo, com aviso na sexta.' },
  inat: { l: 'Inativos há 60 dias', n: 1310, freq: '—', ticket: 61, act: 'Reativação com prato novo da estação, oferta limitada e medição de retorno em 14 dias.' },
};
function Customer() {
  const [s, setS] = useState<keyof typeof SEG>('rec');
  const run = useRun(['Agrega pedidos pseudonimizados', 'Segmenta por recorrência e ticket', 'Identifica preferências por canal', 'Gera ação sugerida']);
  const x = SEG[s];
  return (
    <Pipeline run={run}
      input={<>
        <Field label="Segmento"><Select label="Segmento" value={s} onChange={setS} opts={Object.entries(SEG).map(([k, v]) => [k as keyof typeof SEG, v.l])} /></Field>
        <p className="caption">Somente dados com base legal (LGPD); identificadores pseudonimizados na camada de dados.</p>
      </>}
      output={<>
        <div className="grid c2"><div className="stat"><span className="label">Clientes</span><span className="value">{num(x.n)}</span></div><div className="stat"><span className="label">Ticket médio</span><span className="value">{brl(x.ticket)}</span></div></div>
        <p className="caption">Frequência: {x.freq}</p>
        <Approval what={`Ação sugerida: ${x.act}`} />
      </>} />
  );
}
