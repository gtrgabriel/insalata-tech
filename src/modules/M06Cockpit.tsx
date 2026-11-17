import { useEffect, useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { HBars, LineChart, SERIES, StackedBars } from '../components/Charts';
import { Callout, SectionHeader, Skeleton, Stat, Tag } from '../components/ui';
import { BRANDS, CHANNELS, UNITS, query, type Filters } from '../data/cockpit';
import { brlShort, num, pct } from '../lib/util';

const DEFAULT: Filters = { brand: 'all', unit: 'all', channel: 'all', period: '30d' };
const PERIODS = [{ v: '7d', l: 'Últimos 7 dias' }, { v: '30d', l: 'Últimos 30 dias' }, { v: '90d', l: 'Últimos 90 dias' }, { v: '12m', l: 'Últimos 12 meses' }];

function delta(cur: number, prev: number, pp = false) {
  if (!prev) return '—';
  if (pp) { const d = (cur - prev) * 100; return `${d >= 0 ? '+' : ''}${num(d, 1)} p.p. vs. período anterior`; }
  const d = cur / prev - 1;
  return `${d >= 0 ? '+' : ''}${num(d * 100, 1)}% vs. período anterior`;
}

export default function M06Cockpit() {
  const [f, setF] = useState<Filters>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const data = useMemo(() => query(f), [f]);
  useEffect(() => { setLoading(true); const t = setTimeout(() => setLoading(false), 380); return () => clearTimeout(t); }, [f]);

  const units = UNITS.filter((u) => f.brand === 'all' || u.brand === f.brand);
  const upd = (p: Partial<Filters>) => setF((cur) => ({ ...cur, ...p, ...(p.brand !== undefined ? { unit: 'all' } : {}) }));
  const { cur, prev } = data;

  return (
    <>
      <SectionHeader n="06" question="O que os sócios veriam todas as manhãs?"
        title="Intelligence Cockpit"
        lead="Receita, CMV, margem, desperdício, estoque e fornecedores em uma única tela, com o mesmo cálculo para todas as marcas. Os filtros funcionam — explore por marca, unidade, canal e período."
        aside={<Tag status="simulated">Todos os dados desta tela são simulados</Tag>} />

      <section className="card" aria-label="Filtros do cockpit">
        <div className="grid filters" style={{ alignItems: 'end' }}>
          <div className="field"><label htmlFor="f-brand">Marca</label>
            <select id="f-brand" className="select" value={f.brand} onChange={(e) => upd({ brand: e.target.value as Filters['brand'] })}>
              <option value="all">Todas as marcas</option>{BRANDS.map((b) => <option key={b}>{b}</option>)}
            </select></div>
          <div className="field"><label htmlFor="f-unit">Unidade</label>
            <select id="f-unit" className="select" value={f.unit} onChange={(e) => upd({ unit: e.target.value })}>
              <option value="all">Todas as unidades ({units.length})</option>{units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select></div>
          <div className="field"><label htmlFor="f-ch">Canal</label>
            <select id="f-ch" className="select" value={f.channel} onChange={(e) => upd({ channel: e.target.value as Filters['channel'] })}>
              <option value="all">Todos os canais</option>{CHANNELS.map((c) => <option key={c}>{c}</option>)}
            </select></div>
          <div className="field"><label htmlFor="f-per">Período</label>
            <div className="row tight">
              <select id="f-per" className="select" style={{ flex: 1 }} value={f.period} onChange={(e) => upd({ period: e.target.value as Filters['period'] })}>
                {PERIODS.map((p) => <option key={p.v} value={p.v}>{p.l}</option>)}
              </select>
              <button className="icon-btn" aria-label="Limpar filtros" onClick={() => setF(DEFAULT)} disabled={JSON.stringify(f) === JSON.stringify(DEFAULT)}><RotateCcw size={16} /></button>
            </div></div>
        </div>
      </section>

      {cur.rev === 0 && !loading ? (
        <div className="card"><p className="small">Não há vendas para essa combinação de filtros (ex.: canal sem operação na marca selecionada). <button className="btn sm ghost" onClick={() => upd({ channel: 'all' })}>Ver todos os canais</button></p></div>
      ) : (
        <>
          <section className="grid kpis" aria-label="Indicadores principais" aria-busy={loading}>
            {loading ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} h={112} />) : (
              <>
                <div className="card"><Stat label="Receita" value={brlShort(cur.rev)} delta={delta(cur.rev, prev.rev)} good={cur.rev >= prev.rev} /></div>
                <div className="card"><Stat label="CMV" value={pct(cur.cmvPct)} delta={delta(cur.cmvPct, prev.cmvPct, true)} good={cur.cmvPct <= prev.cmvPct} /></div>
                <div className="card"><Stat label="Margem de contribuição" value={pct(cur.marginPct)} delta={delta(cur.marginPct, prev.marginPct, true)} good={cur.marginPct >= prev.marginPct} /></div>
                <div className="card"><Stat label="Desperdício (% receita)" value={pct(cur.wastePct)} delta={delta(cur.wastePct, prev.wastePct, true)} good={cur.wastePct <= prev.wastePct} /></div>
                <div className="card"><Stat label="Giro · dias de cobertura" value={`${num(cur.cover, 1)} dias`} delta={`${num(30 / cur.cover, 1)} giros/mês`} good={cur.cover <= prev.cover} /></div>
                <div className="card"><Stat label="Ruptura (itens)" value={pct(cur.rupt)} delta={delta(cur.rupt, prev.rupt, true)} good={cur.rupt <= prev.rupt} /></div>
              </>
            )}
          </section>

          <section className="grid c2">
            <div className="card">
              <div className="card-head"><strong className="small">Receita no período</strong><span className="caption">{PERIODS.find((p) => p.v === f.period)!.l.toLowerCase()} · {data.unitCount} unidade(s)</span></div>
              {loading ? <Skeleton h={260} /> : <LineChart ariaLabel="Receita no período comparada ao período anterior" labels={data.labels} fmt={brlShort}
                series={[{ name: 'Período atual', values: data.revSeries }, { name: 'Período anterior', values: data.prevSeries, dashed: true, color: 'var(--color-border-strong)' }]} />}
            </div>
            <div className="card">
              <div className="card-head"><strong className="small">Vendas por canal</strong><span className="caption">taxas de apps consideradas na margem</span></div>
              {loading ? <Skeleton h={260} /> : <StackedBars ariaLabel="Vendas por canal ao longo do período" labels={data.labels} fmt={brlShort}
                series={CHANNELS.map((c, i) => ({ name: c, values: data.byCh[i], color: SERIES[i] })).filter((s) => s.values.some((v) => v > 0))} />}
            </div>
          </section>

          <section className="grid c2">
            <div className="card">
              <div className="card-head"><strong className="small">Rentabilidade por unidade</strong><span className="caption">ordenado por margem</span></div>
              {loading ? <Skeleton h={240} /> : (
                <div className="table-wrap">
                  <table className="data">
                    <thead><tr><th>Unidade</th><th className="num">Receita</th><th className="num">CMV</th><th className="num">Desperd.</th><th className="num">Margem</th><th style={{ width: '22%' }} aria-label="Barra de margem" /></tr></thead>
                    <tbody>{data.unitsTable.map((u) => (
                      <tr key={u.id}><td>{u.name}</td><td className="num">{brlShort(u.rev)}</td><td className="num">{pct(u.cmvPct)}</td>
                        <td className="num" style={{ fontWeight: u.wastePct > 0.055 ? 600 : 400 }}>{pct(u.wastePct)}</td><td className="num">{pct(u.marginPct)}</td>
                        <td><div className="bar green"><span style={{ width: `${Math.min(100, (Math.max(0, u.marginPct) / 0.75) * 100)}%` }} /></div></td></tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="card">
              <div className="card-head"><strong className="small">Previsão de demanda · próximos 14 dias</strong><Tag status="proposed">Modelo proposto</Tag></div>
              {loading ? <Skeleton h={240} /> : (
                <>
                  <LineChart ariaLabel="Receita real dos últimos 28 dias e previsão para 14 dias" labels={data.forecast.labels} fmt={brlShort} height={220}
                    series={[{ name: 'Real', values: data.forecast.actual }, { name: 'Previsto', values: data.forecast.predicted, dashed: true, color: 'var(--color-accent)' }]}
                    band={{ lo: data.forecast.lo, hi: data.forecast.hi }} />
                  <p className="caption">Previsão total: <strong>{brlShort(data.forecast.total)}</strong>. Método ilustrativo (média por dia da semana); o modelo real incluirá clima, eventos e sazonalidade.</p>
                </>
              )}
            </div>
          </section>

          <section className="grid c2">
            <div className="card">
              <div className="card-head"><strong className="small">Participação por canal</strong></div>
              {loading ? <Skeleton h={180} /> : <HBars ariaLabel="Receita por canal" items={data.channelTotals.map((c) => ({ ...c, note: pct(c.value / cur.rev, 0), color: SERIES[CHANNELS.indexOf(c.label as typeof CHANNELS[number])] }))} fmt={brlShort} />}
            </div>
            <div className="card">
              <div className="card-head"><strong className="small">Desempenho de fornecedores</strong><span className="caption">dados de recebimento (Estoca.ai) · simulados</span></div>
              {loading ? <Skeleton h={180} /> : (
                <div className="table-wrap">
                  <table className="data">
                    <thead><tr><th>Fornecedor</th><th className="num">OTIF</th><th className="num">Diverg. preço</th><th className="num">Qualidade</th><th className="num">Impacto</th></tr></thead>
                    <tbody>{data.suppliers.map((s) => (
                      <tr key={s.name}><td>{s.name}</td><td className="num">{pct(s.otif, 0)}</td><td className="num" style={{ fontWeight: s.div > 0.03 ? 600 : 400 }}>{pct(s.div)}</td>
                        <td className="num">{num(s.quality, 1)} / 5</td><td className="num">{brlShort(s.impact)}</td></tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
          <Callout>Definições propostas: <strong>CMV</strong> = custo dos insumos ÷ receita; <strong>margem de contribuição</strong> = receita − CMV − taxas de canal; <strong>desperdício</strong> = perdas registradas ÷ receita; <strong>OTIF</strong> = entregas no prazo e completas. As definições finais serão acordadas na camada semântica.</Callout>
        </>
      )}
    </>
  );
}
