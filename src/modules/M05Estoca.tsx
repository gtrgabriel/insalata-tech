import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Calculator, CheckCircle2, ClipboardCheck, FileCode2, FileText, Handshake, LineChart, PackageOpen, Play, Plug, Receipt, RotateCcw, ShoppingCart, Truck, UserCheck, Webhook, Boxes, GitMerge, Scale, AlertTriangle, CreditCard, Users } from 'lucide-react';
import { Diagram, StatusLegend, type DEdge, type DNode } from '../components/Diagram';
import { Callout, SectionHeader, Segmented, Tag } from '../components/ui';
import { brl2, num } from '../lib/util';

type Tab = 'sim' | 'purchase' | 'integration';

const FLOW: (DNode & { owner: string; desc: string })[] = [
  { id: 's1', x: 0, y: 0, w: 215, label: 'Venda', sub: 'PDV / apps', icon: Receipt, status: 'proposed', owner: 'Integração PDV → plataforma', desc: 'Cada venda vira evento com item, unidade e canal.' },
  { id: 's2', x: 250, y: 0, w: 215, label: 'Consumo teórico', sub: 'venda × ficha técnica', icon: Calculator, status: 'proposed', owner: 'Plataforma de dados', desc: 'Baixa teórica de insumos a partir das fichas técnicas.' },
  { id: 's3', x: 500, y: 0, w: 215, label: 'Estoque', sub: 'saldo por unidade', icon: Boxes, status: 'confirmed', owner: 'Estoca.ai + plataforma', desc: 'A Estoca.ai atualiza o estoque a partir do recebimento (confirmado). O saldo teórico pela venda é proposto.' },
  { id: 's4', x: 750, y: 0, w: 215, label: 'Previsão de demanda', sub: 'item × dia × unidade', icon: LineChart, kind: 'ai', status: 'proposed', owner: 'Camada de inteligência', desc: 'Modelo de séries temporais com sazonalidade, clima e eventos.' },
  { id: 's5', x: 1000, y: 0, w: 215, label: 'Reposição', sub: 'pedido sugerido', icon: PackageOpen, kind: 'ai', status: 'proposed', owner: 'Camada de inteligência', desc: 'Quantidade sugerida = previsão + segurança − saldo.' },
  { id: 's6', x: 1000, y: 170, w: 215, label: 'Aprovação de compra', sub: 'decisão humana', icon: UserCheck, kind: 'app', status: 'proposed', owner: 'Central de compras', desc: 'O comprador aprova, ajusta ou rejeita. Nada é comprado sem aprovação.' },
  { id: 's7', x: 750, y: 170, w: 215, label: 'Fornecedor', sub: 'pedido e entrega', icon: Truck, kind: 'external', owner: 'Fornecedor', desc: 'Recebe o pedido e programa a entrega.' },
  { id: 's8', x: 500, y: 170, w: 215, label: 'Recebimento', sub: 'conferência digital', icon: ClipboardCheck, kind: 'estoca', status: 'confirmed', owner: 'Estoca.ai', desc: 'Conferência digital, de-para de itens, conversão unitária e homologação nutricional.' },
  { id: 's9', x: 250, y: 170, w: 215, label: 'Conciliação', sub: 'NF-e × negociado', icon: Scale, kind: 'estoca', status: 'confirmed', owner: 'Estoca.ai', desc: 'Preço negociado × nota fiscal, com alerta instantâneo para compras.' },
];
const FLOW_EDGES: DEdge[] = [
  { from: 's1', to: 's2', kind: 'event' }, { from: 's2', to: 's3' }, { from: 's3', to: 's4' }, { from: 's4', to: 's5', kind: 'ai' }, { from: 's5', to: 's6', kind: 'ai' },
  { from: 's6', to: 's7', kind: 'event' }, { from: 's7', to: 's8', kind: 'manual' }, { from: 's8', to: 's9' }, { from: 's9', to: 's3', label: 'atualiza saldo e custo' },
];

interface Item { item: string; un: string; saldo: number; min: number; preco: number; }
const START: Item[] = [
  { item: 'Alface americana', un: 'kg', saldo: 24, min: 12, preco: 9.8 },
  { item: 'Salmão fresco', un: 'kg', saldo: 31, min: 15, preco: 84 },
  { item: 'Quinoa', un: 'kg', saldo: 18, min: 6, preco: 32 },
  { item: 'Abacate', un: 'un', saldo: 70, min: 40, preco: 3.2 },
  { item: 'Embalagem bowl', un: 'un', saldo: 420, min: 300, preco: 1.15 },
];

type Ev = { kind?: 'alert' | 'reco'; text: string };
interface Step { node: string; edge?: string; t: string; events: Ev[]; mutate?: (s: Item[]) => Item[]; wait?: boolean; }
const set = (s: Item[], name: string, f: (i: Item) => Partial<Item>) => s.map((i) => (i.item === name ? { ...i, ...f(i) } : i));

const SCRIPT: Step[] = [
  { node: 's1', t: '14:00', events: [{ text: 'venda.registrada · 186 bowls até 14h no sábado (Insalata · Unidade 1)' }] },
  { node: 's2', edge: 's1>s2', t: '14:00', events: [{ text: 'Ficha técnica aplicada: 0,08 kg alface, 0,09 kg salmão, 0,05 kg quinoa, 0,5 abacate, 1 embalagem por bowl' }],
    mutate: (s) => set(set(set(set(set(s, 'Alface americana', (i) => ({ saldo: i.saldo - 14.9 })), 'Salmão fresco', (i) => ({ saldo: i.saldo - 16.7 })), 'Quinoa', (i) => ({ saldo: i.saldo - 9.3 })), 'Abacate', (i) => ({ saldo: i.saldo - 93 })), 'Embalagem bowl', (i) => ({ saldo: i.saldo - 186 })) },
  { node: 's3', edge: 's2>s3', t: '14:01', events: [{ kind: 'alert', text: 'Saldo teórico abaixo do mínimo: alface (9,1 kg), salmão (14,3 kg), embalagens (234 un) e abacate (−23 un → contagem física recomendada)' }] },
  { node: 's4', edge: 's3>s4', t: '14:02', events: [{ text: 'Previsão para domingo: 240 bowls (intervalo 212–268) · sazonalidade de fim de semana + previsão de calor' }] },
  { node: 's5', edge: 's4>s5', t: '14:02', events: [{ kind: 'reco', text: 'Pedido sugerido: alface 28 kg, salmão 22 kg, abacate 150 un, embalagens 500 un · cobertura de 2 dias + estoque de segurança' }] },
  { node: 's6', edge: 's5>s6', t: '14:03', wait: true, events: [{ text: 'Pedido de R$ 3.177,40 aguardando aprovação do comprador (alçada: compras central)' }] },
  { node: 's7', edge: 's6>s7', t: '14:05', events: [{ text: 'Pedido enviado aos fornecedores · entrega confirmada para domingo 07h' }] },
  { node: 's8', edge: 's7>s8', t: 'dom 07:12', events: [
    { text: 'Estoca.ai: conferência digital da entrega iniciada pelo estoquista' },
    { kind: 'alert', text: 'Divergência de quantidade: alface 26 kg recebidos × 28 kg pedidos' },
    { kind: 'alert', text: 'Divergência de preço: salmão R$ 89,90/kg na NF-e × R$ 84,00/kg negociado' } ],
    mutate: (s) => set(set(set(set(s, 'Alface americana', (i) => ({ saldo: i.saldo + 26 })), 'Salmão fresco', (i) => ({ saldo: i.saldo + 22, preco: 89.9 })), 'Abacate', (i) => ({ saldo: i.saldo + 150 })), 'Embalagem bowl', (i) => ({ saldo: i.saldo + 500 })) },
  { node: 's9', edge: 's8>s9', t: 'dom 07:15', events: [
    { text: 'Alerta enviado a compras · impacto de R$ 129,80 no CMV do pedido' },
    { kind: 'reco', text: 'Solicitar crédito ao fornecedor de pescados e revisar o contrato (3ª divergência no mês — dado simulado)' } ] },
  { node: 's3', edge: 's9>s3', t: 'dom 07:16', events: [{ kind: 'reco', text: 'Estoque e custo médio atualizados. Cockpit de CMV recalculado.' }] },
];

export default function M05Estoca() {
  const [tab, setTab] = useState<Tab>('sim');
  return (
    <>
      <SectionHeader n="05" question="Como a Estoca.ai se torna o elo entre venda, estoque e compras?"
        title="Estoca.ai no centro do ciclo de abastecimento"
        lead="A Estoca.ai nasceu dentro do Grupo Insalata e já resolve a conferência de recebimento. A proposta é conectá-la à venda, ao estoque teórico e à previsão — fechando o ciclo do abastecimento."
        aside={<Segmented label="Visualização" value={tab} onChange={setTab} options={[{ value: 'sim', label: 'Ciclo e simulação' }, { value: 'purchase', label: 'Fluxo de compras e aprovação' }, { value: 'integration', label: 'Cenários de integração' }]} />} />

      <div className="grid c2">
        <div className="card">
          <div className="card-head"><h2 className="h2" style={{ fontSize: 'var(--text-base)' }}>Capacidades confirmadas hoje</h2><Tag status="confirmed" /></div>
          <ul className="small" style={{ margin: 0, paddingLeft: 'var(--space-5)' }}>
            <li>App que digitaliza e organiza o recebimento</li>
            <li>De-para automático de preço negociado × nota fiscal (NF-e)</li>
            <li>Comunicação instantânea com compras em caso de divergência</li>
            <li>Homologação nutricional e conversões unitárias automáticas</li>
            <li>Aprende os nomes de itens da operação; visão por unidade e fornecedor; recomendações de renegociação</li>
          </ul>
          <p className="caption">Fonte: estoca.ai, consultado em 17/11/2026. Integrações com ERP/PDV e API pública não são divulgadas.</p>
        </div>
        <div className="card">
          <div className="card-head"><h2 className="h2" style={{ fontSize: 'var(--text-base)' }}>Proposto nesta parceria</h2><Tag status="proposed" /></div>
          <ul className="small" style={{ margin: 0, paddingLeft: 'var(--space-5)' }}>
            <li>Integração da venda (PDV e apps) para cálculo de consumo teórico</li>
            <li>Estoque teórico × físico com alertas de desvio</li>
            <li>Previsão de demanda e pedido sugerido</li>
            <li>Fluxo de aprovação de compras com alçadas</li>
            <li>Eventos da Estoca.ai alimentando ERP, cockpit de CMV e scorecard de fornecedores</li>
          </ul>
          <p className="caption">A divisão entre o que evolui dentro da Estoca.ai e o que fica na plataforma do grupo será definida com o time da Estoca.ai.</p>
        </div>
      </div>

      {tab === 'sim' && <Simulation />}
      {tab === 'purchase' && <PurchaseFlow />}
      {tab === 'integration' && <Integration />}
    </>
  );
}

function Simulation() {
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [stock, setStock] = useState(START);
  const [log, setLog] = useState<(Ev & { t: string })[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const timer = useRef<number>();
  const waiting = running && step >= 0 && SCRIPT[step].wait;

  const apply = (i: number) => {
    const s = SCRIPT[i];
    if (s.mutate) setStock((cur) => s.mutate!(cur));
    setLog((l) => [...s.events.map((e) => ({ ...e, t: s.t })).reverse(), ...l]);
    setStep(i);
  };
  useEffect(() => {
    if (!running || waiting) return;
    if (step >= SCRIPT.length - 1) { setRunning(false); return; }
    timer.current = window.setTimeout(() => apply(step + 1), step < 0 ? 300 : 1600);
    return () => clearTimeout(timer.current);
  }, [running, step, waiting]);

  const reset = () => { clearTimeout(timer.current); setRunning(false); setStep(-1); setStock(START); setLog([]); };
  const start = () => { if (step >= SCRIPT.length - 1) { reset(); setTimeout(() => setRunning(true), 50); } else setRunning(true); };
  const approve = () => { apply(step + 1); };

  const cur = step >= 0 ? SCRIPT[step] : null;
  const activeNodes = new Set(cur ? [cur.node] : []);
  const activeEdges = new Set(cur?.edge ? [cur.edge] : []);
  const info = FLOW.find((f) => f.id === (sel ?? cur?.node));

  return (
    <>
      <div className="row">
        <button className="btn" onClick={start} disabled={running}><Play size={16} />{step >= SCRIPT.length - 1 ? 'Simular novamente' : step >= 0 ? 'Continuar' : 'Simular operação'}</button>
        <button className="btn ghost" onClick={reset} disabled={step < 0}><RotateCcw size={16} /> Reiniciar</button>
        {running && <Tag status="live" />}
        <Tag status="simulated">Cenário e valores simulados</Tag>
      </div>
      <Diagram ariaLabel="Ciclo conceitual de abastecimento com a Estoca.ai" nodes={FLOW} edges={FLOW_EDGES} height={400} selectedId={sel} onSelect={setSel}
        activeNodes={activeNodes} activeEdges={activeEdges} legend={['data', 'event', 'manual', 'ai']} extraLegend={<StatusLegend />} />
      {waiting && (
        <div className="card anim-slide" style={{ borderColor: 'var(--color-dark)', borderWidth: 2 }} role="alertdialog" aria-label="Aprovação humana necessária">
          <div className="card-head">
            <div className="row tight"><span className="bubble dark"><UserCheck size={20} /></span><div><strong>Aprovação humana necessária</strong><p className="caption">Pedido sugerido pela IA · R$ 3.177,40 · 4 itens · 3 fornecedores</p></div></div>
            <div className="row tight">
              <button className="btn" onClick={approve}><CheckCircle2 size={16} /> Aprovar pedido</button>
              <button className="btn ghost" onClick={approve}>Ajustar e aprovar</button>
            </div>
          </div>
          <p className="caption">A simulação só continua após a decisão do comprador — a IA recomenda, as pessoas decidem.</p>
        </div>
      )}
      <div className="grid c3">
        <div className="card">
          <div className="card-head"><strong className="small">Etapa em foco</strong>{info?.status && <Tag status={info.status} />}</div>
          {info ? (
            <div className="stack tight" aria-live="polite">
              <span className="h2">{info.label}</span>
              <p className="small">{info.desc}</p>
              <dl className="kv caption" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--space-3)' }}><dt>Responsável</dt><dd style={{ margin: 0 }}>{info.owner}</dd></dl>
            </div>
          ) : <p className="small muted">Inicie a simulação ou selecione uma etapa do ciclo.</p>}
        </div>
        <div className="card">
          <strong className="small">Estoque da unidade</strong>
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Item</th><th className="num">Saldo</th><th className="num">Mín.</th><th className="num">Últ. custo</th></tr></thead>
              <tbody>
                {stock.map((i) => (
                  <tr key={i.item}>
                    <td>{i.saldo < i.min && <AlertTriangle size={12} style={{ color: 'var(--color-accent)', marginRight: 4 }} aria-label="abaixo do mínimo" />}{i.item}</td>
                    <td className="num" style={{ fontWeight: i.saldo < i.min ? 600 : 400 }}>{num(i.saldo, i.un === 'kg' ? 1 : 0)} {i.un}</td>
                    <td className="num">{num(i.min)} {i.un}</td>
                    <td className="num">{brl2(i.preco)}{i.preco !== START.find((x) => x.item === i.item)!.preco && ' ▲'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <span className="caption">Unidade, itens e fichas técnicas simulados.</span>
        </div>
        <div className="card">
          <div className="card-head"><strong className="small">Eventos, alertas e recomendações</strong><span className="caption">{log.length} eventos</span></div>
          <div className="log" aria-live="polite">
            {log.length === 0 && <p className="caption">Nenhum evento ainda.</p>}
            {log.map((e, i) => <div key={log.length - i} className={`log-item ${e.kind ?? ''}`}><time>{e.t}</time><span>{e.kind === 'alert' ? 'Alerta · ' : e.kind === 'reco' ? 'Recomendação · ' : ''}{e.text}</span></div>)}
          </div>
        </div>
      </div>
    </>
  );
}

const PN: DNode[] = [
  { id: 'a', x: 0, y: 100, w: 180, label: 'Pedido sugerido', sub: 'IA · previsão + saldo', icon: LineChart, kind: 'ai' },
  { id: 'b', x: 230, y: 100, w: 180, label: 'Regra de alçada', sub: 'valor, item, fornecedor', icon: GitMerge },
  { id: 'c1', x: 460, y: 0, w: 190, label: 'Gerente da unidade', sub: 'até R$ X (a definir)', icon: UserCheck, kind: 'app' },
  { id: 'c2', x: 460, y: 100, w: 190, label: 'Compras central', sub: 'acima de R$ X', icon: ShoppingCart, kind: 'app' },
  { id: 'c3', x: 460, y: 200, w: 190, label: 'Diretoria', sub: 'acima de R$ Y ou novo fornecedor', icon: Users, kind: 'app' },
  { id: 'd', x: 700, y: 100, w: 180, label: 'Pedido emitido', sub: 'ao fornecedor', icon: Handshake },
  { id: 'e', x: 930, y: 100, w: 180, label: 'Recebimento', sub: 'Estoca.ai', icon: ClipboardCheck, kind: 'estoca', status: 'confirmed' },
  { id: 'f', x: 1160, y: 0, w: 190, label: 'Sem divergência', sub: 'lançamento no ERP', icon: BadgeCheck },
  { id: 'g', x: 1160, y: 200, w: 190, label: 'Divergência', sub: 'tratativa com fornecedor', icon: AlertTriangle, kind: 'manual' },
  { id: 'h', x: 1400, y: 100, w: 170, label: 'Pagamento', sub: 'financeiro', icon: CreditCard },
];
const PE: DEdge[] = [
  { from: 'a', to: 'b', kind: 'ai' }, { from: 'b', to: 'c1' }, { from: 'b', to: 'c2' }, { from: 'b', to: 'c3' },
  { from: 'c1', to: 'd', kind: 'event', label: 'aprovado' }, { from: 'c2', to: 'd', kind: 'event' }, { from: 'c3', to: 'd', kind: 'event' },
  { from: 'd', to: 'e', kind: 'manual', label: 'entrega' }, { from: 'e', to: 'f' }, { from: 'e', to: 'g', kind: 'event', label: 'alerta' },
  { from: 'f', to: 'h' }, { from: 'g', to: 'h', kind: 'manual', label: 'crédito / ajuste' },
];

function PurchaseFlow() {
  const [sel, setSel] = useState<string | null>(null);
  return (
    <>
      <Diagram ariaLabel="Fluxo de compras e aprovação com alçadas" nodes={PN} edges={PE} height={420} selectedId={sel} onSelect={setSel} deps="chain" legend={['data', 'event', 'manual', 'ai']} />
      <Callout>Alçadas e valores (R$ X, R$ Y) são ilustrativos e serão definidos com sócios, compras e financeiro. Todo pedido sugerido por IA passa por aprovação humana, com registro em trilha de auditoria.</Callout>
    </>
  );
}

const SCEN = [
  { icon: Plug, t: 'API', how: 'A plataforma consulta a Estoca.ai (ou vice-versa) por endpoints REST autenticados.', pros: ['Dados sob demanda', 'Contrato versionado'], req: ['Disponibilidade de API pela Estoca.ai', 'Credenciais por ambiente'] },
  { icon: Webhook, t: 'Eventos', how: 'A Estoca.ai publica eventos (entrega conferida, divergência) consumidos pela plataforma.', pros: ['Tempo quase real', 'Baixo acoplamento'], req: ['Definição do esquema de eventos', 'Endpoint receptor com retry'] },
  { icon: FileText, t: 'Arquivos', how: 'Exportações periódicas (CSV / XML de NF-e) carregadas por ETL.', pros: ['Início mais rápido', 'Não exige desenvolvimento na Estoca.ai'], req: ['Rotina de exportação', 'Validação de layout'] },
  { icon: FileCode2, t: 'Conector próprio', how: 'Conector dedicado mantido pelo time da plataforma, com de-para e regras do grupo.', pros: ['Controle total das regras', 'Reaproveita aprendizado de de-para'], req: ['Acordo técnico e de dados', 'Manutenção contínua'] },
];

function Integration() {
  return (
    <>
      <div className="grid c4">
        {SCEN.map(({ icon: I, t, how, pros, req }) => (
          <article key={t} className="card">
            <div className="row tight"><span className="bubble"><I size={20} /></span><h3 className="h2" style={{ fontSize: 'var(--text-base)' }}>{t}</h3></div>
            <p className="small">{how}</p>
            <div className="stack tight"><span className="eyebrow">VANTAGENS</span><ul className="caption" style={{ margin: 0, paddingLeft: 'var(--space-5)', color: 'var(--color-text)' }}>{pros.map((p) => <li key={p}>{p}</li>)}</ul></div>
            <div className="stack tight"><span className="eyebrow">REQUISITOS</span><ul className="caption" style={{ margin: 0, paddingLeft: 'var(--space-5)', color: 'var(--color-text)' }}>{req.map((p) => <li key={p}>{p}</li>)}</ul></div>
            <Tag status="hypothesis">A validar com a Estoca.ai</Tag>
          </article>
        ))}
      </div>
      <Callout>Recomendação preliminar: iniciar com <strong>arquivos</strong> no piloto (menor dependência) e evoluir para <strong>eventos</strong> quando o esquema for acordado com o time da Estoca.ai.</Callout>
    </>
  );
}
