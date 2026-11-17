import { Banknote, Boxes, ClipboardCheck, Factory, FileSpreadsheet, Monitor, ShoppingBag, ShoppingCart, Smartphone, Store, Truck, UtensilsCrossed, Users, Building2, Gift, Bike, Server } from 'lucide-react';
import type { DEdge, DGroup, DNode } from '../components/Diagram';

export interface NodeInfo { tipo: string; dados: string[]; processos: string[]; fonte?: string; }

export const ECO_GROUPS: DGroup[] = [
  { id: 'g-sup', x: -20, y: -40, w: 250, h: 560, label: 'FORNECEDORES' },
  { id: 'g-ops', x: 270, y: -40, w: 230, h: 560, label: 'SUPRIMENTOS' },
  { id: 'g-sys', x: 560, y: -40, w: 260, h: 640, label: 'SISTEMAS E BACKOFFICE', tone: 'white' },
  { id: 'g-brand', x: 870, y: -40, w: 200, h: 760, label: 'MARCAS E UNIDADES' },
  { id: 'g-ch', x: 1120, y: -40, w: 240, h: 560, label: 'CANAIS DE VENDA' },
  { id: 'g-cus', x: 1400, y: -40, w: 230, h: 560, label: 'CLIENTES' },
];

export const ECO_NODES: DNode[] = [
  { id: 'flv', x: 0, y: 20, w: 210, label: 'Hortifruti', sub: 'FLV · alta perecibilidade', icon: Truck },
  { id: 'prot', x: 0, y: 110, w: 210, label: 'Proteínas', sub: 'carnes, peixes, ovos', icon: Truck },
  { id: 'secos', x: 0, y: 200, w: 210, label: 'Secos e mercearia', icon: Truck },
  { id: 'lat', x: 0, y: 290, w: 210, label: 'Laticínios e padaria', icon: Truck },
  { id: 'emb', x: 0, y: 380, w: 210, label: 'Embalagens', sub: 'delivery e varejo', icon: Truck },

  { id: 'compras', x: 290, y: 60, w: 190, label: 'Compras', sub: 'cotação e pedidos', icon: ShoppingCart, status: 'hypothesis' },
  { id: 'estoca', x: 290, y: 200, w: 190, label: 'Estoca.ai', sub: 'conferência de recebimento', kind: 'estoca', icon: ClipboardCheck, status: 'confirmed' },
  { id: 'estoque', x: 290, y: 340, w: 190, label: 'Estoque e produção', sub: 'por unidade / cozinha', icon: Factory, status: 'hypothesis' },

  { id: 'erp', x: 580, y: 20, w: 220, label: 'ERP', sub: 'fornecedor a confirmar', icon: Server, status: 'hypothesis' },
  { id: 'fin', x: 580, y: 110, w: 220, label: 'Financeiro', sub: 'contas, conciliação, DRE', icon: Banknote },
  { id: 'core', x: 615, y: 200, kind: 'core', label: 'Grupo\nInsalata', sub: 'backoffice central' },
  { id: 'pdv', x: 580, y: 380, w: 220, label: 'PDV', sub: 'por unidade · a mapear', icon: Monitor, status: 'hypothesis' },
  { id: 'planilhas', x: 580, y: 470, w: 220, label: 'Planilhas e controles', sub: 'paralelos', kind: 'manual', icon: FileSpreadsheet, status: 'hypothesis' },

  { id: 'insalata', x: 915, y: 0, kind: 'brand', label: 'Insalata', status: 'confirmed' },
  { id: 'goodmarket', x: 915, y: 130, kind: 'brand', label: 'Good\nMarket', status: 'confirmed' },
  { id: 'gelina', x: 915, y: 260, kind: 'brand', label: 'Gelina', status: 'confirmed' },
  { id: 'delivery', x: 915, y: 390, kind: 'brand', label: 'Delivery', status: 'confirmed' },
  { id: 'unidades', x: 880, y: 560, w: 180, label: 'Unidades e cozinhas', sub: 'quantidade a confirmar', icon: Building2, status: 'hypothesis' },

  { id: 'salao', x: 1140, y: 20, w: 200, label: 'Salão', sub: 'consumo no local', icon: UtensilsCrossed },
  { id: 'apps', x: 1140, y: 110, w: 200, label: 'Apps de delivery', sub: 'iFood e outros', icon: Smartphone, status: 'confirmed' },
  { id: 'proprio', x: 1140, y: 200, w: 200, label: 'Delivery próprio', sub: 'site / WhatsApp', icon: Bike, status: 'hypothesis' },
  { id: 'varejo', x: 1140, y: 290, w: 200, label: 'Varejo e conveniência', sub: 'empório, pães, cafés', icon: Store, status: 'confirmed' },
  { id: 'encomendas', x: 1140, y: 380, w: 200, label: 'Encomendas e eventos', icon: Gift, status: 'hypothesis' },

  { id: 'cli-local', x: 1420, y: 60, w: 190, label: 'Clientes presenciais', icon: Users },
  { id: 'cli-del', x: 1420, y: 200, w: 190, label: 'Clientes delivery', icon: ShoppingBag },
  { id: 'cli-b2b', x: 1420, y: 340, w: 190, label: 'Clientes corporativos', icon: Boxes, status: 'hypothesis' },
];

const sup = ['flv', 'prot', 'secos', 'lat', 'emb'];
export const ECO_EDGES: DEdge[] = [
  ...sup.map((s) => ({ from: 'compras', to: s, kind: 'manual' as const })),
  ...sup.map((s) => ({ from: s, to: 'estoca', kind: 'data' as const })),
  { from: 'estoca', to: 'compras', kind: 'event', label: 'divergências' },
  { from: 'estoca', to: 'estoque', kind: 'data' },
  { from: 'estoca', to: 'erp', kind: 'batch' },
  { from: 'erp', to: 'core', kind: 'data' },
  { from: 'fin', to: 'core', kind: 'data' },
  { from: 'pdv', to: 'core', kind: 'data' },
  { from: 'planilhas', to: 'core', kind: 'manual' },
  { from: 'estoque', to: 'unidades', kind: 'manual' },
  { from: 'unidades', to: 'insalata', kind: 'data' },
  { from: 'unidades', to: 'goodmarket', kind: 'data' },
  { from: 'unidades', to: 'gelina', kind: 'data' },
  { from: 'unidades', to: 'delivery', kind: 'data' },
  { from: 'insalata', to: 'pdv', kind: 'data' },
  { from: 'goodmarket', to: 'pdv', kind: 'data' },
  { from: 'insalata', to: 'salao' }, { from: 'insalata', to: 'apps' },
  { from: 'goodmarket', to: 'salao' }, { from: 'goodmarket', to: 'varejo' }, { from: 'goodmarket', to: 'encomendas' },
  { from: 'gelina', to: 'varejo' }, { from: 'gelina', to: 'apps' },
  { from: 'delivery', to: 'apps' }, { from: 'delivery', to: 'proprio' },
  { from: 'apps', to: 'pdv', kind: 'event', label: 'pedidos' },
  { from: 'salao', to: 'cli-local' }, { from: 'varejo', to: 'cli-local' },
  { from: 'apps', to: 'cli-del' }, { from: 'proprio', to: 'cli-del' },
  { from: 'encomendas', to: 'cli-b2b' },
];

const supplier = (cat: string): NodeInfo => ({
  tipo: 'Fornecedor',
  dados: [`Catálogo e preços negociados (${cat})`, 'Notas fiscais (NF-e)', 'Prazo e qualidade de entrega'],
  processos: ['Recebe pedido de compras', 'Entrega nas unidades / cozinha', 'Conferência via Estoca.ai'],
});

export const ECO_INFO: Record<string, NodeInfo> = {
  flv: supplier('hortifruti'), prot: supplier('proteínas'), secos: supplier('secos'), lat: supplier('laticínios'), emb: supplier('embalagens'),
  compras: { tipo: 'Processo de suprimentos', dados: ['Pedidos e cotações', 'Preços negociados', 'Alertas de divergência'], processos: ['Cotação com fornecedores', 'Emissão de pedido', 'Tratamento de divergências apontadas pela Estoca.ai'], fonte: 'Formato atual (centralizado ou por unidade) a confirmar no discovery.' },
  estoca: { tipo: 'Plataforma do grupo · recebimento', dados: ['Itens recebidos x NF-e', 'Preço negociado x faturado', 'Desempenho por unidade e fornecedor'], processos: ['Conferência digital da entrega', 'De-para de itens da nota', 'Conversão unitária automática', 'Alerta instantâneo para compras'], fonte: 'Capacidades confirmadas em estoca.ai (nov/2026). A Estoca.ai nasceu dentro do Grupo Insalata.' },
  estoque: { tipo: 'Operação', dados: ['Saldo por item e unidade', 'Produção e porcionamento', 'Perdas'], processos: ['Armazenagem', 'Produção', 'Inventário', 'Abastecimento das unidades'], fonte: 'Modelo de estoque (central x por unidade) é hipótese.' },
  erp: { tipo: 'Sistema de gestão', dados: ['Cadastros mestres', 'Notas e contas a pagar', 'Custos'], processos: ['Fiscal', 'Contábil', 'Compras (possivelmente)'], fonte: 'Fornecedor e módulos em uso a confirmar.' },
  fin: { tipo: 'Backoffice', dados: ['Contas a pagar e receber', 'Repasses de apps', 'DRE por unidade'], processos: ['Conciliação de recebíveis', 'Fechamento mensal'] },
  core: { tipo: 'Gestão do grupo', dados: ['Visão consolidada (hoje possivelmente manual)'], processos: ['Gestão das marcas', 'Decisões de expansão e mix', 'Acompanhamento de margem'] },
  pdv: { tipo: 'Sistema de vendas', dados: ['Tickets e itens vendidos', 'Formas de pagamento', 'Vendas por canal'], processos: ['Venda no salão e balcão', 'Recebimento de pedidos de apps (via integrador)'], fonte: 'Fornecedor(es) e padronização entre marcas a confirmar.' },
  planilhas: { tipo: 'Controles paralelos', dados: ['Fichas técnicas', 'Consolidações de venda e CMV', 'Controles de perda'], processos: ['Consolidação manual', 'Relatórios gerenciais'], fonte: 'Hipótese comum em grupos multimarca; validar no discovery.' },
  insalata: { tipo: 'Marca', dados: ['Vendas por canal', 'Mix de pratos', 'CMV'], processos: ['Salão', 'Delivery'], fonte: 'Restaurante de saladas e bowls em São Paulo.' },
  goodmarket: { tipo: 'Marca', dados: ['Vendas de café, brunch, padaria e conveniência'], processos: ['Salão', 'Varejo / empório', 'Encomendas'], fonte: 'Cafés, brunch, pães artesanais e conveniência (agoodmarket.com.br).' },
  gelina: { tipo: 'Marca', dados: ['Vendas por canal', 'Mix de produtos'], processos: ['Canais a confirmar'], fonte: 'Informada no briefing; operação e canais a detalhar no discovery.' },
  delivery: { tipo: 'Operação de delivery', dados: ['Pedidos por app', 'Taxas e repasses', 'Tempo de preparo'], processos: ['Preparo', 'Despacho', 'Atendimento'], fonte: 'Grupo eleito Melhor Delivery Saudável de SP — iFood 2025 (fonte: estoca.ai).' },
  unidades: { tipo: 'Estrutura física', dados: ['Faturamento por unidade', 'Equipe', 'Estoque local'], processos: ['Operação diária', 'Inventário', 'Pedidos internos'], fonte: 'Número de unidades e cozinhas a confirmar.' },
  salao: { tipo: 'Canal', dados: ['Ticket médio', 'Fluxo por horário'], processos: ['Atendimento', 'Venda no PDV'] },
  apps: { tipo: 'Canal', dados: ['Pedidos', 'Avaliações', 'Taxas'], processos: ['Recebimento de pedido', 'Repasse financeiro'] },
  proprio: { tipo: 'Canal', dados: ['Pedidos diretos', 'Base de clientes própria'], processos: ['Pedido via site/WhatsApp'], fonte: 'Existência e volume a confirmar.' },
  varejo: { tipo: 'Canal', dados: ['Itens de conveniência', 'Giro de prateleira'], processos: ['Venda de balcão', 'Reposição'] },
  encomendas: { tipo: 'Canal', dados: ['Pedidos antecipados'], processos: ['Encomenda', 'Produção programada'], fonte: 'Hipótese.' },
  'cli-local': { tipo: 'Cliente', dados: ['Frequência', 'Ticket'], processos: ['Consumo no local'] },
  'cli-del': { tipo: 'Cliente', dados: ['Recorrência por app', 'Avaliações'], processos: ['Pedido online'] },
  'cli-b2b': { tipo: 'Cliente', dados: ['Contratos e pedidos recorrentes'], processos: ['Eventos e corporativo'], fonte: 'Hipótese.' },
};
