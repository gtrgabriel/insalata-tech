import { useState } from 'react';
import { Diagram, StatusLegend } from '../components/Diagram';
import { NodePanel } from '../components/NodePanel';
import { Callout, SectionHeader, Segmented } from '../components/ui';
import { ECO_EDGES, ECO_GROUPS, ECO_INFO, ECO_NODES } from '../data/ecosystem';

export default function M02Ecosystem() {
  const [sel, setSel] = useState<string | null>('estoca');
  const [deps, setDeps] = useState<'direct' | 'chain'>('direct');
  const node = ECO_NODES.find((n) => n.id === sel) ?? null;
  const info = sel ? ECO_INFO[sel] : undefined;

  return (
    <>
      <SectionHeader n="02" question="Como as operações do grupo se conectam hoje — de quem fornece a quem compra?"
        title="Um ecossistema de marcas, canais e fornecedores"
        lead="Mapa das relações entre fornecedores, suprimentos, sistemas, marcas, canais e clientes. Selecione qualquer elemento para ver dados, processos e conexões."
        aside={<Segmented label="Destaque de relações" value={deps} onChange={setDeps} options={[{ value: 'direct', label: 'Relações diretas' }, { value: 'chain', label: 'Cadeia completa' }]} />} />
      <div className="dsplit">
        <Diagram ariaLabel="Mapa do ecossistema operacional do Grupo Insalata" nodes={ECO_NODES} edges={ECO_EDGES} groups={ECO_GROUPS}
          selectedId={sel} onSelect={setSel} deps={deps} height={640} legend={['data', 'event', 'batch', 'manual']} extraLegend={<StatusLegend />} />
        <NodePanel node={node} nodes={ECO_NODES} edges={ECO_EDGES} onSelect={setSel} onClose={() => setSel(null)} emptyText="Selecione uma marca, sistema, canal ou fornecedor para ver seus dados, processos e relações.">
          {info && (
            <>
              <dl className="kv"><dt>Tipo</dt><dd>{info.tipo}</dd></dl>
              <div className="stack tight"><span className="eyebrow">DADOS</span><ul>{info.dados.map((d) => <li key={d}>{d}</li>)}</ul></div>
              <div className="stack tight"><span className="eyebrow">PROCESSOS</span><ul>{info.processos.map((d) => <li key={d}>{d}</li>)}</ul></div>
              {info.fonte && <p className="caption">Fonte / observação: {info.fonte}</p>}
            </>
          )}
        </NodePanel>
      </div>
      <Callout>
        Mapa construído a partir de informações públicas e do briefing. Quantidade de unidades, fornecedores de ERP e PDV, modelo de compras e canais próprios são <strong>hipóteses de discovery</strong> (borda tracejada) e serão validados nas entrevistas com as áreas.
      </Callout>
    </>
  );
}
