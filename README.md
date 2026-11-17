# Insalata Intelligence

Proposta interativa de transformação digital para o Grupo Insalata × Estoca.ai, construída com o design system documentado em `DESIGN.md` e `SKILL.md`.

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/index.html (arquivo único, pode ser enviado aos sócios)
```

## Módulos

| # | Módulo | Pergunta estratégica | Interação principal |
|---|--------|----------------------|---------------------|
| 01 | Executive Experience | Por que dados e IA? | Narrativa em 3 estados (Hoje → Integração → Inteligência), autoplay |
| 02 | Business Ecosystem | Como as operações se conectam? | Diagrama com seleção, relações e cadeia completa |
| 03 | AS-IS | Onde se perde tempo e margem? | Pontos de atenção clicáveis → oportunidade → módulo da solução |
| 04 | TO-BE | Qual arquitetura? | 6 camadas, zoom/pan, fluxo animado, dependências, visão executiva × técnica, jornada do dado |
| 05 | Estoca.ai | Como fechar o ciclo de abastecimento? | Simulação com aprovação humana, fluxo de compras, cenários de integração |
| 06 | Cockpit | O que os sócios veriam todo dia? | Filtros de marca, unidade, canal e período (dados simulados) |
| 07 | IA aplicada | Onde a IA gera valor? | 6 demos com entrada → processamento → saída |
| 08 | Modernização | Integrar, modernizar, desenvolver ou substituir? | Matriz impacto × complexidade com filtro |
| 09 | Roadmap | Em que ordem? | Gantt expansível, dependências, entregáveis |
| 10 | Business case | Qual o retorno e como começar? | Calculadora de ROI/payback, modalidades, piloto, próximos passos |

Recursos globais: alternância **Visão executiva / Aprofundamento técnico**, **Modo apresentação** (tela cheia, ← → para navegar, Esc para sair), navegação por hash (`#/to-be`), estados de carregamento (lazy loading + skeletons), teclado em todos os diagramas (Tab, Enter, +/−, setas, Esc).

## Auditoria do design system

`DESIGN.md` e `SKILL.md` descrevem o mesmo sistema, extraído de **agoodmarket.com.br** (Good Market). Todos os valores estão em `src/styles/tokens.css`; os componentes usam apenas `var(--*)`.

`SKILL.md` não define stack, biblioteca de componentes nem padrão de fluxogramas. Por isso, as decisões técnicas seguiram o nível 5 da hierarquia: Vite + React + TypeScript, CSS com tokens (sem Tailwind ou bibliotecas visuais) e motor de diagramas próprio em SVG (`src/components/Diagram.tsx`), reutilizado nos 7 diagramas.

Conflitos encontrados (arquivos originais não foram alterados):

1. **Raios**: só 50% e 100px são permitidos → botões, chips e nós em pílula ou círculo; cards com cantos retos.
2. **Contraste**: `#609778` (3,7:1) e `#D1709C` (3,4:1) não atingem WCAG AA em texto pequeno → usados só em gráficos, marcadores e destaques; texto secundário em `#3B4282`.
3. **`--border-color` duplicado** → separado em `--color-border-strong` (#C9CCC4) e `--color-border` (#D8D8D8).
4. **Espaçamento**: a escala inclui 5px e 22px, fora da grade de 4px → não usados.
5. **`#25D366`** (verde do WhatsApp) → restrito ao indicador de "ao vivo / simulação".
6. **Nome**: o briefing cita "Good Marketing"; os arquivos documentam a marca **Good Market**, que pertence ao grupo.
7. Algumas dimensões de layout (largura da sidebar, colunas do Gantt, ícones) não têm token correspondente e usam valores fixos.

## Fontes e transparência

- **Estoca.ai** (estoca.ai, consultado em 17/11/2026): conferência de recebimento; de-para preço negociado × NF-e; alertas para compras; homologação nutricional; conversões unitárias; visão por unidade e fornecedor; recomendações. Nasceu dentro do Grupo Insalata. **Não há API pública nem integrações documentadas.** Previsão, reposição e aprovação aparecem como **propostas**.
- Status visual em toda a experiência: **Confirmado** (verde), **Hipótese de discovery** (rosa, borda tracejada), **Proposto** (índigo), **Dado simulado**.
- Unidades, fornecedores, valores do cockpit, simulações e premissas do business case são **simulados** e editáveis. Nenhum preço comercial foi definido.

## Estrutura

```
src/
  styles/tokens.css      tokens Good Market
  styles/base.css        componentes base (botões, tags, cards, diagrama, gantt…)
  components/            Diagram, NodePanel, Charts, ui
  data/                  ecossistema, arquitetura, dados simulados do cockpit
  modules/M01…M10        os dez módulos
```
