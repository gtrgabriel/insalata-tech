/**
 * Dados SIMULADOS do Intelligence Cockpit. Determinísticos (seed fixa) para que a
 * demonstração seja reproduzível. Nenhum número representa a operação real do grupo.
 */
import { rngFor } from '../lib/util';

export const BRANDS = ['Insalata', 'Good Market', 'Gelina', 'Delivery'] as const;
export const CHANNELS = ['Salão', 'Apps de delivery', 'Delivery próprio', 'Varejo'] as const;
export type Brand = typeof BRANDS[number];
export type Channel = typeof CHANNELS[number];
export type Period = '7d' | '30d' | '90d' | '12m';

export const UNITS: { id: string; brand: Brand; name: string }[] = [
  { id: 'ins-1', brand: 'Insalata', name: 'Insalata · Unidade 1' },
  { id: 'ins-2', brand: 'Insalata', name: 'Insalata · Unidade 2' },
  { id: 'ins-3', brand: 'Insalata', name: 'Insalata · Unidade 3' },
  { id: 'gm-1', brand: 'Good Market', name: 'Good Market · Unidade 1' },
  { id: 'gm-2', brand: 'Good Market', name: 'Good Market · Unidade 2' },
  { id: 'gel-1', brand: 'Gelina', name: 'Gelina · Unidade 1' },
  { id: 'del-1', brand: 'Delivery', name: 'Delivery · Cozinha 1' },
];

const PROFILE: Record<Brand, { base: number; mix: number[]; cmv: number; waste: number; rupt: number; cover: number }> = {
  Insalata: { base: 21000, mix: [0.45, 0.4, 0.1, 0.05], cmv: 0.31, waste: 0.045, rupt: 0.035, cover: 4.5 },
  'Good Market': { base: 27000, mix: [0.55, 0.1, 0.05, 0.3], cmv: 0.33, waste: 0.055, rupt: 0.028, cover: 6 },
  Gelina: { base: 9000, mix: [0.1, 0.3, 0, 0.6], cmv: 0.28, waste: 0.03, rupt: 0.02, cover: 9 },
  Delivery: { base: 15000, mix: [0, 0.8, 0.2, 0], cmv: 0.32, waste: 0.04, rupt: 0.045, cover: 3.5 },
};
/** Taxa média de canal (comissões de apps etc.) — premissa simulada. */
export const CHANNEL_FEE: Record<Channel, number> = { 'Salão': 0, 'Apps de delivery': 0.23, 'Delivery próprio': 0.05, Varejo: 0 };

const DAYS = 730; // 2 anos para comparar com o período anterior
export const TODAY = new Date(2026, 10, 16);
const dayDate = (d: number) => new Date(TODAY.getTime() - (DAYS - 1 - d) * 86400000);

interface Row { rev: number[]; cmv: number; waste: number; rupt: number; cover: number; }
const DB: Record<string, Row[]> = {};
for (const u of UNITS) {
  const p = PROFILE[u.brand];
  const r = rngFor(u.id);
  const scale = 0.8 + r() * 0.45;
  DB[u.id] = Array.from({ length: DAYS }, (_, d) => {
    const dt = dayDate(d);
    const dow = dt.getDay();
    const week = dow === 0 ? 1.18 : dow === 6 ? 1.25 : dow === 5 ? 1.1 : dow === 1 ? 0.85 : 0.95;
    const season = 1 + 0.08 * Math.sin(((dt.getMonth() + 1) / 12) * Math.PI * 2 - 1.2);
    const growth = 1 + (d / DAYS) * 0.12;
    const noise = 0.9 + r() * 0.2;
    const total = p.base * scale * week * season * growth * noise;
    return {
      rev: p.mix.map((m) => total * m * (0.92 + r() * 0.16)),
      cmv: p.cmv * (0.95 + r() * 0.1) - (d / DAYS) * 0.006,
      waste: p.waste * (0.8 + r() * 0.45),
      rupt: p.rupt * (0.6 + r() * 0.9),
      cover: p.cover * (0.85 + r() * 0.3),
    };
  });
}

export interface Filters { brand: Brand | 'all'; unit: string; channel: Channel | 'all'; period: Period; }

const LEN: Record<Period, number> = { '7d': 7, '30d': 30, '90d': 91, '12m': 364 };
const fmtD = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function unitsFor(f: Filters) {
  return UNITS.filter((u) => (f.brand === 'all' || u.brand === f.brand) && (f.unit === 'all' || u.id === f.unit));
}
const chIdx = (f: Filters) => (f.channel === 'all' ? [0, 1, 2, 3] : [CHANNELS.indexOf(f.channel)]);

function aggregate(units: typeof UNITS, chs: number[], from: number, to: number) {
  let rev = 0, cmv = 0, waste = 0, rupt = 0, cover = 0, fees = 0, n = 0;
  for (const u of units) for (let d = from; d < to; d++) {
    const row = DB[u.id][d];
    const rv = chs.reduce((a, c) => a + row.rev[c], 0);
    rev += rv; cmv += rv * row.cmv; waste += rv * row.waste; rupt += row.rupt; cover += row.cover; n++;
    fees += chs.reduce((a, c) => a + row.rev[c] * CHANNEL_FEE[CHANNELS[c]], 0);
  }
  return { rev, cmvPct: rev ? cmv / rev : 0, wastePct: rev ? waste / rev : 0, marginPct: rev ? (rev - cmv - fees) / rev : 0, rupt: n ? rupt / n : 0, cover: n ? cover / n : 0 };
}

export function query(f: Filters) {
  const units = unitsFor(f);
  const chs = chIdx(f);
  const len = LEN[f.period];
  const end = DAYS, start = DAYS - len, prevStart = start - len;
  const cur = aggregate(units, chs, start, end);
  const prev = aggregate(units, chs, prevStart, start);

  // série temporal (dia, semana ou mês)
  const bucket = f.period === '90d' ? 7 : f.period === '12m' ? 28 : 1;
  const nb = Math.ceil(len / bucket);
  const labels: string[] = [];
  const revSeries: number[] = [], prevSeries: number[] = [];
  const byCh: number[][] = CHANNELS.map(() => []);
  for (let b = 0; b < nb; b++) {
    const s = start + b * bucket, e = Math.min(end, s + bucket);
    const dt = dayDate(s);
    labels.push(bucket === 28 ? `${MONTHS[dayDate(e - 1).getMonth()]}` : fmtD(dt));
    let tot = 0, ptot = 0;
    CHANNELS.forEach((_, c) => {
      let v = 0;
      if (chs.includes(c)) for (const u of units) for (let d = s; d < e; d++) v += DB[u.id][d].rev[c];
      byCh[c].push(v); tot += v;
    });
    for (const u of units) for (let d = s - len; d < e - len; d++) ptot += chs.reduce((a, c) => a + DB[u.id][d].rev[c], 0);
    revSeries.push(tot); prevSeries.push(ptot);
  }

  const unitsTable = units.map((u) => ({ ...u, ...aggregate([u], chs, start, end) })).sort((a, b) => b.marginPct - a.marginPct);
  const channelTotals = CHANNELS.map((c, i) => ({ label: c, value: chs.includes(i) ? byCh[i].reduce((a, b) => a + b, 0) : 0 })).filter((c) => c.value > 0).sort((a, b) => b.value - a.value);

  // Previsão: últimos 28 dias reais + 14 dias previstos (média por dia da semana × tendência)
  const hist = 28, horizon = 14;
  const daily = (d: number) => units.reduce((a, u) => a + chs.reduce((x, c) => x + DB[u.id][d].rev[c], 0), 0);
  const actual = Array.from({ length: hist }, (_, i) => daily(DAYS - hist + i));
  const dowAvg = Array.from({ length: 7 }, (_, k) => { const v = actual.filter((_, i) => i % 7 === k); return v.reduce((a, b) => a + b, 0) / v.length; });
  const fc = Array.from({ length: horizon }, (_, i) => dowAvg[(hist + i) % 7] * 1.01);
  const fLabels = Array.from({ length: hist + horizon }, (_, i) => fmtD(new Date(TODAY.getTime() + (i - hist + 1) * 86400000)));
  const forecast = {
    labels: fLabels,
    actual: [...actual, ...Array(horizon).fill(null)] as (number | null)[],
    predicted: [...Array(hist - 1).fill(null), actual[hist - 1], ...fc] as (number | null)[],
    lo: [...Array(hist).fill(null), ...fc.map((v, i) => v * (1 - 0.06 - i * 0.004))] as (number | null)[],
    hi: [...Array(hist).fill(null), ...fc.map((v, i) => v * (1 + 0.06 + i * 0.004))] as (number | null)[],
    total: fc.reduce((a, b) => a + b, 0),
  };

  // Fornecedores (simulados), escalados pelo volume selecionado
  const r = rngFor(`sup-${f.brand}-${f.unit}`);
  const SUP = ['Hortifruti A', 'Hortifruti B', 'Pescados A', 'Carnes A', 'Laticínios A', 'Secos A', 'Embalagens A'];
  const suppliers = SUP.map((name) => {
    const otif = 0.82 + r() * 0.16, div = r() * 0.05, quality = 3.4 + r() * 1.5;
    return { name, otif, div, quality, impact: cur.rev * cur.cmvPct * (1 / SUP.length) * div };
  }).sort((a, b) => b.impact - a.impact);

  return { cur, prev, labels, revSeries, prevSeries, byCh, unitsTable, channelTotals, forecast, suppliers, unitCount: units.length };
}
