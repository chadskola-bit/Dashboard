import { DealRow } from './types';

export function normalizeRows(values: string[][]): DealRow[] {
  const rows = values.slice(1);
  return rows
    .filter((r) => r[0])
    .map((r) => ({
      timestamp: r[0] ?? '',
      saleDate: r[1] ?? '',
      glps: r[2] ?? '',
      other: r[3] ?? '',
      addOns: r[4] ?? '',
      howClosed: r[5] ?? '',
      team: r[6] ?? '',
      portalAddress: r[7] ?? '',
      agentName: r[8] ?? '',
      dealId: r[9] ?? '',
      totalDeals: Number(r[10] ?? 0),
      dayOfWeek: r[11] ?? '',
      weekStart: r[12] ?? '',
      month: r[13] ?? '',
      weekend: r[14] ?? ''
    }));
}

export function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

export function groupSum(rows: DealRow[], key: keyof DealRow) {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    const label = String(row[key] || 'Unknown');
    map.set(label, (map.get(label) ?? 0) + row.totalDeals);
  });
  return Array.from(map.entries())
    .map(([name, deals]) => ({ name, deals }))
    .sort((a, b) => b.deals - a.deals);
}

export function productMix(rows: DealRow[]) {
  const totals = { GLPs: 0, Other: 0, 'Add-Ons': 0 };
  rows.forEach((row) => {
    totals.GLPs += countProducts(row.glps);
    totals.Other += countProducts(row.other);
    totals['Add-Ons'] += countProducts(row.addOns);
  });
  return Object.entries(totals).map(([name, deals]) => ({ name, deals }));
}

function countProducts(value: string) {
  if (!value) return 0;
  return value
    .replace(/\n/g, ',')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean).length;
}
