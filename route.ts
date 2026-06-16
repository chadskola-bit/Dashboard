import { NextResponse } from 'next/server';
import { normalizeRows } from '@/lib/transform';

export const dynamic = 'force-dynamic';

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell);
      if (row.some((value) => value.trim() !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== '')) rows.push(row);
  return rows;
}

export async function GET() {
  try {
    const csvUrl = process.env.DASHBOARD_CSV_URL;

    if (!csvUrl) {
      return NextResponse.json(
        { error: 'Missing DASHBOARD_CSV_URL environment variable.' },
        { status: 500 }
      );
    }

    const response = await fetch(csvUrl, { cache: 'no-store' });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Unable to fetch CSV feed. Google returned ${response.status}.` },
        { status: 500 }
      );
    }

    const csvText = await response.text();
    const values = parseCsv(csvText);
    const rows = normalizeRows(values);

    return NextResponse.json({ rows, refreshedAt: new Date().toISOString() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to load dashboard data.' }, { status: 500 });
  }
}
