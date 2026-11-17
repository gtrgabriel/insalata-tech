import { useState } from 'react';
import { AlertTriangle, ArrowRight, Banknote, ClipboardCheck, FileSpreadsheet, FileText, Mail, Monitor, PackageSearch, Server, Smartphone, UserRound, Users, Calculator } from 'lucide-react';
import { Diagram, StatusLegend, type DEdge, type DGroup, type DNode } from '../components/Diagram';
import { NodePanel } from '../components/NodePanel';
import { Callout, SectionHeader, Tag } from '../components/ui';
import { useApp } from '../lib/store';

const G: DGroup[] = [
  { id: 'a', x: -20, y: -50, w: 250, h: 560, label: 'SISTEMAS DE ORIGEM' },
  { id: 'b', x: 290, y: -50, w: 270, h: 560, label: 'PROCESSOS MANUAIS', tone: 'outline' },
  { id: 'c', x: 620, y: -50, w: 250, h: 560, label: 'DADOS DISTRIBUÍDOS' },
  { id: 'd', x: 930, y: -50, w: 230, h: 560, label: 'QUEM DECIDE', tone: 'white' },
];

const N: DNode[] = [
  { id: 'pdv', x: 0, y: 0, w: 210, label: 'PDVs por marca', sub: 'padronização a confirmar', icon: Monitor, status: 'hypothesis' },
  { id: 'apps', x: 0, y: 90, w: 210, label: 'Apps de delivery', sub: 'portais separados', icon: Smartphone, status: 'confirmed' },
  { id: 'erp', x: 0, y: 180, w: 210, label: 'ERP', sub: 'fiscal / financeiro', icon: Server, status: 'hypothesis' },
  { id: 'estoca', x: 0, y: 270, w: 210, label: 'Estoca.ai', sub: 'conferência de recebimento', kind: 'estoca', icon: ClipboardCheck, status: 'confirmed' },
  { id: 'nfe', x: 0, y: 360, w: 210, label: 'NF-e de fornecedores', icon: FileText, status: 'confirmed' },

  { id: 'export', x: 310, y: 0, w: 230, label: 'Exportação de relatórios', kind: 'manual', icon: FileSpreadsheet, status: 'hypothesis' },
  { id: 'consol', x: 310, y: 90, w: 230, label: 'Consolidação em planilha', kind: 'manual', icon: Calculator, status: 'hypothesis' },
  { id: 'inv', x: 310, y: 180, w: 230, label: 'Inventário e contagem', kind: 'manual', icon: PackageSearch, status: 'hypothesis' },
  { id: 'pedidos', x: 310, y: 270, w: 230, label: 'Pedidos por WhatsApp / e-mail', kind: 'manual', icon: Mail, status: 'hypothesis' },
  { id: 'ficha', x: 310, y: 360, w: 230, label: 'Fichas técnicas em planilha', kind: 'manual', icon: FileSpreadsheet, status: 'hypothesis' },

  { id: 'rel', x: 640, y: 40, w: 210, label: 'Relatórios por sistema', kind: 'data', status: 'hypothesis' },
  { id: 'base', x: 640, y: 160, w: 210, label: 'Planilhas por marca', kind: 'data', status: 'hypothesis' },
  { id: 'receb', x: 640, y: 280, w: 210, label: 'Dados de recebimento', sub: 'na Estoca.ai', kind: 'data', status: 'confirmed' },

  { id: 'dir', x: 950, y: 20, w: 190, label: 'Sócios e diretoria', icon: Users },
  { id: 'ger', x: 950, y: 120, w: 190, label: 'Gerentes de unidade', icon: UserRound },
  { id: 'comp', x: 950, y: 220, w: 190, label: 'Compras', icon: PackageSearch },
  { id: 'finp', x: 950, y: 320, w: 190, label: 'Financeiro', icon: Banknote },

  { id: 'p1', x: 545, y: 85, kind: 'pain', label: '1' },
  { id: 'p2', x: 215, y: 175, kind: 'pain', label: '2' },
  { id: 'p3', x: 545, y: 175, kind: 'pain', label: '3' },
  { id: 'p4', x: 545, y: 265, kind: 'pain', label: '4' },
  { id: 'p5', x: 215, y: 85, kind: 'pain', label: '5' },
  { id: 'p6', x: 855, y: 155, kind: 'pain', label: '6' },
];

const E: DEdge[] = [
  { from: 'pdv', to: 'export', kind: 'manual' }, { from: 'apps', to: 'export', kind: 'manual' }, { from: 'erp', to: 'export', kind: 'manual' },
  { from: 'export', to: 'consol', kind: 'manual' }, { from: 'consol', to: 'base', kind: 'manual' }, { from: 'consol', to: 'rel', kind: 'manual' },
  { from: 'inv', to: 'base', kind: 'manual' }, { from: 'ficha', to: 'consol', kind: 'manual' },
  { from: 'nfe', to: 'estoca', kind: 'data' }, { from: 'estoca', to: 'receb', kind: 'data' }, { from: 'estoca', to: 'pedidos', kind: 'event', label: 'divergências' },
  { from: 'pedidos', to: 'comp', kind: 'manual' },
  { from: 'rel', to: 'dir', kind: 'manual' }, { from: 'base', to: 'ger', kind: 'manual' }, { from: 'base', to: 'dir', kind: 'manual' },
  { from: 'receb', to: 'comp', kind: 'data' }, { from: 'erp', to: 'finp', kind: 'data' }, { from: 'base', to: 'finp', kind: 'manual' },
];

const PAINS: Record<string, { t: string; problema: string; impacto: string; oportunidade: string; modulo: string; modLabel: string }> = {
  p1: { t: 'Consolidação manual de vendas e CMV', problema: 'Relatórios de PDV, apps e ERP são exportados e cruzados em planilhas.', impacto: 'Informação de margem chega com dias ou semanas de atraso e com risco de erro.', oportunidade: 'Integração automática das fontes em um núcleo de dados com atualização diária ou intradiária.', modulo: 'to-be', modLabel: 'Arquitetura-alvo' },
  p2: { t: 'Recebimento sem ligação com o ERP e o estoque teórico', problema: 'A Estoca.ai confere a entrega, mas a integração com ERP, fichas técnicas e consumo teórico não é pública.', impacto: 'Divergências detectadas podem não refletir no custo e no saldo de estoque do grupo.', oportunidade: 'Conectar eventos de recebimento ao ERP e ao modelo de estoque.', modulo: 'estoca', modLabel: 'Integração Estoca.ai' },
  p3: { t: 'Inventário por contagem manual', problema: 'Saldo depende de contagens periódicas, sem comparação com o consumo teórico.', impacto: 'Perdas e desvios aparecem apenas no fechamento.', oportunidade: 'Estoque teórico (venda × ficha técnica) comparado ao contado, com alertas de desvio.', modulo: 'ai', modLabel: 'Waste Intelligence' },
  p4: { t: 'Pedidos de compra fora de sistema', problema: 'Pedidos e divergências tratados por WhatsApp ou e-mail.', impacto: 'Sem rastreabilidade, sem histórico de negociação e sem aprovação estruturada.', oportunidade: 'Central de compras com sugestão de pedido e fluxo de aprovação.', modulo: 'modernization', modLabel: 'Central de compras' },
  p5: { t: 'Vendas de apps separadas do PDV', problema: 'Cada app tem seu portal, taxas e repasses próprios.', impacto: 'Rentabilidade por canal difícil de medir; conciliação financeira trabalhosa.', oportunidade: 'Conector de pedidos e repasses, com margem por canal no cockpit.', modulo: 'cockpit', modLabel: 'Intelligence Cockpit' },
  p6: { t: 'Várias versões da verdade', problema: 'Cada área consulta sua própria planilha.', impacto: 'Reuniões discutem o número, não a decisão.', oportunidade: 'Camada semântica única: mesmas definições de receita, CMV e margem para todos.', modulo: 'to-be', modLabel: 'Camada de dados' },
};

export default function M03AsIs() {
  const { go } = useApp();
  const [sel, setSel] = useState<string | null>('p1');
  const node = N.find((n) => n.id === sel) ?? null;
  const pain = sel ? PAINS[sel] : undefined;

  return (
    <>
      <SectionHeader n="03" question="Onde a operação atual perde tempo, dinheiro e visibilidade?"
        title="Estado atual: dados que existem, mas não conversam"
        lead="Fluxograma inicial da arquitetura operacional, construído como hipótese. Os pontos numerados indicam possíveis retrabalhos e lacunas de visibilidade — clique para ver a oportunidade associada."
        aside={<div className="row tight"><Tag status="confirmed" /><Tag status="hypothesis" /></div>} />
      <div className="dsplit">
        <Diagram ariaLabel="Arquitetura operacional atual (AS-IS) com pontos de atenção" nodes={N} edges={E} groups={G} selectedId={sel} onSelect={setSel} height={600}
          legend={['data', 'event', 'manual']} extraLegend={<><StatusLegend /><span className="legend-item"><svg width="14" height="14" aria-hidden><circle cx="7" cy="7" r="6" style={{ fill: 'var(--color-accent)' }} /></svg>Ponto de atenção</span></>} />
        <NodePanel node={node} nodes={N} edges={E} onSelect={setSel} onClose={() => setSel(null)} emptyText="Clique em um ponto de atenção numerado para ver problema, impacto e oportunidade.">
          {pain ? (
            <>
              <div className="row tight"><AlertTriangle size={18} aria-hidden /><strong className="small">{pain.t}</strong></div>
              <dl className="kv">
                <dt>Problema</dt><dd>{pain.problema}</dd>
                <dt>Impacto</dt><dd>{pain.impacto}</dd>
                <dt>Oportunidade</dt><dd>{pain.oportunidade}</dd>
              </dl>
              <Tag status="hypothesis">Hipótese a validar no discovery</Tag>
              <button className="btn sm" onClick={() => go(pain.modulo)}>Ver solução: {pain.modLabel} <ArrowRight size={14} /></button>
            </>
          ) : node && (
            <p className="small">{node.status === 'confirmed' ? 'Elemento confirmado por fonte pública ou briefing.' : 'Elemento hipotético — formato e ferramenta a confirmar nas entrevistas com as áreas.'}</p>
          )}
        </NodePanel>
      </div>
      <div className="grid c3">
        {Object.entries(PAINS).map(([id, p]) => (
          <button key={id} className="card interactive" aria-pressed={sel === id} onClick={() => setSel(id)}>
            <div className="row tight"><span className="bubble sm" style={{ background: 'var(--color-accent)', color: 'var(--color-text)' }}>{id.slice(1)}</span><strong className="small">{p.t}</strong></div>
            <p className="caption" style={{ color: 'var(--color-text)' }}>{p.oportunidade}</p>
          </button>
        ))}
      </div>
      <Callout tone="confirmed">
        <strong>Confirmado:</strong> o grupo já opera a Estoca.ai na conferência de recebimento (cruzamento de NF-e com preço negociado e alertas para compras). <strong>Hipóteses:</strong> todos os processos manuais, a padronização de PDV e o ERP em uso.
      </Callout>
    </>
  );
}
