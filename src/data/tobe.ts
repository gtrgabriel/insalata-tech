import type { DEdge, DGroup, DNode } from '../components/Diagram';
import { Activity, BarChart3, Bell, Bot, Boxes, CheckSquare, ClipboardCheck, Database, FileCog, Gauge, GitBranch, Layers, LayoutDashboard, Library, LineChart, Lock, Monitor, Plug, Radar, Repeat, ScrollText, Server, ShieldCheck, ShoppingCart, Smartphone, Banknote, Users, Webhook, Workflow, Sparkles } from 'lucide-react';

export interface LayerInfo { exec: string; tech: string[]; deps?: string; value?: string; }

export const LAYERS = [
  { id: 'L1', label: '1 · SISTEMAS DE ORIGEM', x: -20 },
  { id: 'L2', label: '2 · INTEGRAÇÃO', x: 290 },
  { id: 'L3', label: '3 · DADOS', x: 600 },
  { id: 'L4', label: '4 · INTELIGÊNCIA', x: 910 },
  { id: 'L5', label: '5 · APLICAÇÕES', x: 1220 },
];

export const TOBE_GROUPS: DGroup[] = [
  ...LAYERS.map((l, i) => ({ id: l.id, x: l.x, y: -50, w: 250, h: 680, label: l.label, tone: (i % 2 ? 'white' : 'light') as DGroup['tone'] })),
  { id: 'L6', x: -20, y: 660, w: 1490, h: 140, label: '6 · GOVERNANÇA TRANSVERSAL', tone: 'dark' },
];

type N = DNode & { info: LayerInfo; execSub: string; techSub: string };
const n = (id: string, col: number, row: number, label: string, execSub: string, techSub: string, icon: DNode['icon'], info: LayerInfo, extra: Partial<DNode> = {}): N =>
  ({ id, x: LAYERS[col].x + 20, y: row * 88, w: 210, label, execSub, techSub, icon, info, ...extra });

export const TOBE_NODES: N[] = [
  n('erp', 0, 0, 'ERP', 'fiscal, custos, contas', 'API REST / banco réplica', Server, { exec: 'Fonte oficial de custos, fiscal e contas a pagar.', tech: ['Extração via API do fornecedor ou réplica de leitura', 'Cadastros mestres: produtos, fornecedores, centros de custo'], deps: 'Acesso e documentação de API do ERP (a confirmar).' }, { status: 'hypothesis' }),
  n('pdv', 0, 1, 'PDV', 'vendas por item e canal', 'API / webhook de venda', Monitor, { exec: 'Cada venda vira dado em minutos, por unidade, item e canal.', tech: ['Webhook de venda fechada ou polling incremental', 'Chave: unidade + ticket + item'], deps: 'Mapeamento dos PDVs usados por marca.' }, { status: 'hypothesis' }),
  n('delivery', 0, 2, 'Apps de delivery', 'pedidos, taxas, repasses', 'API de parceiros / integrador', Smartphone, { exec: 'Margem real por canal, já descontando taxas e repasses.', tech: ['API de parceiro ou integrador de pedidos', 'Relatórios de repasse para conciliação'] }),
  n('estoca', 0, 3, 'Estoca.ai', 'recebimento e NF-e', 'API / exportação a validar', ClipboardCheck, { exec: 'Recebimento conferido: o custo real que entra no estoque.', tech: ['Interface de integração a definir com a Estoca.ai (sem API pública documentada)', 'Eventos: entrega conferida, divergência, preço'], deps: 'Acordo técnico com o time Estoca.ai.' }, { kind: 'estoca', status: 'confirmed' }),
  n('compras', 0, 4, 'Compras', 'pedidos e cotações', 'sistema / planilha atual', ShoppingCart, { exec: 'Pedidos, preços negociados e fornecedores.', tech: ['Origem atual a mapear (ERP, planilha ou mensagens)'] }, { status: 'hypothesis' }),
  n('fin', 0, 5, 'Financeiro', 'recebíveis e DRE', 'ERP / banco / adquirência', Banknote, { exec: 'Fechamento mais rápido e DRE por unidade.', tech: ['Extratos de adquirência e bancos', 'Plano de contas do ERP'] }),
  n('crm', 0, 6, 'CRM / clientes', 'base de clientes', 'apps, delivery próprio', Users, { exec: 'Recorrência e preferências dos clientes.', tech: ['Dados de clientes com base legal LGPD', 'Pseudonimização na camada de dados'] }, { status: 'hypothesis' }),

  n('api', 1, 0.5, 'APIs e conectores', 'fontes conectadas', 'iPaaS ou serviços próprios', Plug, { exec: 'Conecta cada sistema uma única vez, sem digitação.', tech: ['Conectores gerenciados ou serviços em Node/Python', 'Retry, idempotência e controle de versões de API'] }),
  n('events', 1, 2, 'Eventos e webhooks', 'tempo quase real', 'fila / barramento de eventos', Webhook, { exec: 'Alertas no momento em que algo acontece.', tech: ['Fila gerenciada (ex.: Pub/Sub, SQS)', 'Esquema de eventos versionado'] }),
  n('etl', 1, 3.5, 'ETL / ELT', 'cargas programadas', 'ingestão incremental', Workflow, { exec: 'Cargas automáticas de históricos e relatórios.', tech: ['Ferramenta de ELT (ex.: Airbyte, Fivetran) ou jobs orquestrados', 'Carga incremental por data de alteração'] }),
  n('mdm', 1, 5, 'Sincronização e cadastros', 'de-para único', 'master data de itens', Repeat, { exec: 'O mesmo item tem o mesmo nome em todos os sistemas.', tech: ['De-para de produtos, unidades de medida e fornecedores', 'Reaproveita o aprendizado de de-para da Estoca.ai, se disponível'] }),

  n('lake', 2, 0.5, 'Lakehouse / warehouse', 'tudo em um lugar', 'camadas bruta → tratada', Database, { exec: 'Uma única base histórica do grupo.', tech: ['BigQuery, Snowflake ou Databricks (decisão no discovery)', 'Camadas: bruta, tratada e de negócio'] }),
  n('model', 2, 2, 'Modelagem', 'CMV, margem, giro', 'modelos dimensionais', Layers, { exec: 'Indicadores calculados do mesmo jeito para todos.', tech: ['Transformações versionadas (ex.: dbt)', 'Fatos: venda, consumo teórico, recebimento, perda'] }),
  n('quality', 2, 3.5, 'Qualidade de dados', 'confiança no número', 'testes e contratos', CheckSquare, { exec: 'Erros detectados antes de chegar ao relatório.', tech: ['Testes de unicidade, completude e faixas', 'Alertas de pipeline atrasado'] }),
  n('catalog', 2, 5, 'Catálogo e semântica', 'dicionário do negócio', 'camada semântica', Library, { exec: 'Todos sabem o que significa “CMV” e “desperdício”.', tech: ['Glossário e linhagem', 'Métricas definidas uma vez e reutilizadas'] }),

  n('bi', 3, 0, 'BI e análises', 'painéis e relatórios', 'ferramenta de BI', BarChart3, { exec: 'Painéis prontos para cada nível de decisão.', tech: ['Power BI, Looker ou Metabase (decisão no discovery)'] }),
  n('forecast', 3, 1.5, 'Modelos preditivos', 'demanda por item e dia', 'séries temporais', LineChart, { exec: 'Prever quanto vender para produzir e comprar certo.', tech: ['Modelos de séries temporais com sazonalidade, clima e eventos', 'Reavaliação semanal de erro (MAPE)'] }),
  n('optim', 3, 3, 'Otimização', 'pedido sugerido', 'regras + estoque de segurança', Gauge, { exec: 'Quanto pedir, de quem e quando.', tech: ['Política de estoque mínimo e cobertura', 'Restrições de fornecedor e prazo'] }),
  n('anomaly', 3, 4.5, 'Detecção de anomalias', 'perdas e divergências', 'regras + estatística', Radar, { exec: 'Aviso quando algo foge do padrão.', tech: ['Desvio estoque teórico × contado', 'Preço faturado × negociado (Estoca.ai)'] }),
  n('agents', 3, 6, 'Agentes de IA', 'copiloto operacional', 'LLM com ferramentas somente leitura', Bot, { exec: 'Perguntas em linguagem natural, respostas com fonte.', tech: ['LLM com acesso somente leitura à camada semântica', 'Ações críticas exigem aprovação humana'] }, { kind: 'ai' }),

  n('cockpit', 4, 0, 'Cockpit executivo', 'sócios e diretoria', 'web app', LayoutDashboard, { exec: 'O grupo inteiro em uma tela.', tech: ['Web app responsivo sobre a camada semântica'] }, { kind: 'app' }),
  n('portal', 4, 1.5, 'Portal de unidades', 'gerentes e líderes', 'web / mobile', Smartphone, { exec: 'Cada gerente com seus números e tarefas.', tech: ['PWA mobile, perfil por unidade'] }, { kind: 'app' }),
  n('approvals', 4, 3, 'Compras e aprovações', 'pedido sugerido → aprovado', 'workflow', ShoppingCart, { exec: 'Sugestão automática, decisão humana.', tech: ['Fluxo de aprovação por alçada', 'Integração com fornecedor / ERP'] }, { kind: 'app' }),
  n('alerts', 4, 4.5, 'Alertas e notificações', 'WhatsApp, e-mail, app', 'serviço de notificação', Bell, { exec: 'A informação vai até quem precisa agir.', tech: ['Regras de roteamento por papel e unidade'] }, { kind: 'app' }),
  n('custom', 4, 6, 'Aplicações próprias', 'ocorrências, conciliação', 'apps sob medida', Boxes, { exec: 'Lacunas cobertas sem trocar sistemas que funcionam.', tech: ['Construídas sobre a mesma base de dados e identidade'] }, { kind: 'app' }),

  { id: 'sec', x: 0, y: 710, w: 230, label: 'Segurança e acesso', execSub: 'perfis por papel', techSub: 'SSO, RBAC, segredos', icon: Lock, info: { exec: 'Cada pessoa vê apenas o que precisa.', tech: ['SSO e perfis por papel e unidade', 'Cofre de segredos para credenciais de integração'] } } as N,
  { id: 'lgpd', x: 300, y: 710, w: 230, label: 'LGPD', execSub: 'dados de clientes protegidos', techSub: 'pseudonimização, retenção', icon: ShieldCheck, info: { exec: 'Conformidade com a LGPD desde o desenho.', tech: ['Inventário de dados pessoais', 'Pseudonimização e política de retenção'] } } as N,
  { id: 'audit', x: 600, y: 710, w: 230, label: 'Auditoria', execSub: 'quem fez o quê', techSub: 'trilhas imutáveis', icon: ScrollText, info: { exec: 'Toda aprovação e recomendação fica registrada.', tech: ['Log de acessos e decisões', 'Registro das recomendações de IA e da resposta humana'] } } as N,
  { id: 'obs', x: 900, y: 710, w: 230, label: 'Observabilidade', execSub: 'tudo funcionando', techSub: 'métricas, logs, alertas', icon: Activity, info: { exec: 'Sabemos antes do usuário quando algo falha.', tech: ['Monitoramento de pipelines e integrações', 'SLAs de atualização por fonte'] } } as N,
  { id: 'lifecycle', x: 1200, y: 710, w: 250, label: 'Ciclo de vida', execSub: 'evolução contínua', techSub: 'CI/CD, versionamento de modelos', icon: GitBranch, info: { exec: 'Melhorias entregues com segurança.', tech: ['CI/CD para código e transformações', 'Versionamento e monitoramento de modelos'] } } as N,
].map((x) => x);

export const TOBE_EDGES: DEdge[] = [
  { from: 'erp', to: 'api', kind: 'data' }, { from: 'pdv', to: 'events', kind: 'event' }, { from: 'pdv', to: 'api', kind: 'data' },
  { from: 'delivery', to: 'events', kind: 'event' }, { from: 'estoca', to: 'events', kind: 'event' }, { from: 'estoca', to: 'etl', kind: 'batch' },
  { from: 'compras', to: 'etl', kind: 'batch' }, { from: 'fin', to: 'etl', kind: 'batch' }, { from: 'crm', to: 'mdm', kind: 'data' }, { from: 'erp', to: 'mdm', kind: 'data' },
  { from: 'api', to: 'lake', kind: 'data' }, { from: 'events', to: 'lake', kind: 'data' }, { from: 'etl', to: 'lake', kind: 'batch' }, { from: 'mdm', to: 'model', kind: 'data' },
  { from: 'lake', to: 'model', kind: 'data' }, { from: 'model', to: 'quality', kind: 'data' }, { from: 'quality', to: 'catalog', kind: 'data' },
  { from: 'model', to: 'bi', kind: 'data' }, { from: 'model', to: 'forecast', kind: 'data' }, { from: 'catalog', to: 'agents', kind: 'data' }, { from: 'quality', to: 'anomaly', kind: 'data' },
  { from: 'forecast', to: 'optim', kind: 'ai' }, { from: 'events', to: 'anomaly', kind: 'event' },
  { from: 'bi', to: 'cockpit', kind: 'data' }, { from: 'bi', to: 'portal', kind: 'data' }, { from: 'forecast', to: 'portal', kind: 'ai' },
  { from: 'optim', to: 'approvals', kind: 'ai' }, { from: 'anomaly', to: 'alerts', kind: 'ai' }, { from: 'agents', to: 'cockpit', kind: 'ai' }, { from: 'agents', to: 'custom', kind: 'ai' },
  { from: 'approvals', to: 'compras', kind: 'event', label: 'pedido aprovado' },
];

export const JOURNEY: { node: DNode; t: string; d: string }[] = [
  { node: { id: 'j1', x: 0, y: 0, label: 'Venda no PDV', sub: '12:41 · unidade Jardins (ex.)', icon: Monitor }, t: 'Evento', d: 'Um bowl é vendido. O PDV registra item, quantidade, canal e unidade.' },
  { node: { id: 'j2', x: 240, y: 0, label: 'Captura', sub: 'webhook / API', icon: Webhook }, t: 'Integração', d: 'O evento é capturado em segundos e enfileirado — sem exportação manual.' },
  { node: { id: 'j3', x: 480, y: 0, label: 'Ingestão', sub: 'camada bruta', icon: Database }, t: 'Dados', d: 'Armazenado como chegou, com histórico completo para auditoria.' },
  { node: { id: 'j4', x: 720, y: 0, label: 'Qualidade', sub: 'testes e de-para', icon: CheckSquare }, t: 'Dados', d: 'Validado e padronizado: o item do PDV é ligado à ficha técnica.' },
  { node: { id: 'j5', x: 720, y: 140, label: 'Modelo semântico', sub: 'consumo teórico, CMV', icon: Layers }, t: 'Dados', d: 'A venda baixa o consumo teórico dos insumos e atualiza CMV e margem.' },
  { node: { id: 'j6', x: 480, y: 140, label: 'Modelo preditivo', sub: 'demanda e estoque', icon: LineChart, kind: 'ai' }, t: 'Inteligência', d: 'O modelo compara o ritmo de vendas com a previsão e o estoque projetado.' },
  { node: { id: 'j7', x: 240, y: 140, label: 'Recomendação', sub: 'reposição sugerida', icon: Sparkles, kind: 'ai' }, t: 'Inteligência', d: 'Detecta risco de ruptura de folhas no sábado e sugere antecipar o pedido.' },
  { node: { id: 'j8', x: 0, y: 140, label: 'Decisão humana', sub: 'gestor aprova', icon: Users, kind: 'app' }, t: 'Aplicação', d: 'O comprador revisa e aprova. A decisão fica registrada em auditoria.' },
  { node: { id: 'j9', x: 0, y: 280, w: 960, label: 'Aprendizado: o resultado (vendeu, sobrou, faltou) retorna ao modelo', icon: FileCog, kind: 'data' }, t: 'Ciclo', d: 'O que realmente aconteceu volta para o modelo e melhora a próxima previsão.' },
];
export const JOURNEY_EDGES: DEdge[] = [
  { from: 'j1', to: 'j2', kind: 'event' }, { from: 'j2', to: 'j3' }, { from: 'j3', to: 'j4' }, { from: 'j4', to: 'j5' }, { from: 'j5', to: 'j6' },
  { from: 'j6', to: 'j7', kind: 'ai' }, { from: 'j7', to: 'j8', kind: 'ai' }, { from: 'j8', to: 'j9', kind: 'event' },
];
