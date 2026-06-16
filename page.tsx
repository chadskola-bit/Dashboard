'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, CalendarCheck, CalendarDays, Medal, Users } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { DealRow } from '@/lib/types';
import { groupSum, productMix, unique } from '@/lib/transform';

function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: any }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/60">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        <div className="rounded-2xl bg-direct-cyan/15 p-3 text-direct-cyan">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function dateValue(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

export default function DashboardPage() {
  const [rows, setRows] = useState<DealRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [team, setTeam] = useState('All');
  const [agent, setAgent] = useState('All');
  const [month, setMonth] = useState('All');
  const [howClosed, setHowClosed] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/data', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Unable to load data.');
        setRows(json.rows);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesTeam = team === 'All' || row.team === team;
      const matchesAgent = agent === 'All' || row.agentName === agent;
      const matchesMonth = month === 'All' || row.month === month;
      const matchesHowClosed = howClosed === 'All' || row.howClosed === howClosed;
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || [row.dealId, row.agentName, row.team, row.glps, row.other, row.addOns, row.howClosed]
        .join(' ')
        .toLowerCase()
        .includes(q);
      return matchesTeam && matchesAgent && matchesMonth && matchesHowClosed && matchesSearch;
    });
  }, [rows, team, agent, month, howClosed, search]);

  const summary = useMemo(() => {
    const totalDeals = filtered.reduce((sum, row) => sum + row.totalDeals, 0);
    const agentTotals = groupSum(filtered, 'agentName');
    const activeAgents = agentTotals.length;
    const club30Count = agentTotals.filter((a) => a.deals >= 30).length;
    const weekendDeals = filtered.filter((r) => String(r.weekend).toLowerCase() === 'yes')
      .reduce((sum, row) => sum + row.totalDeals, 0);
    return {
      totalDeals,
      activeAgents,
      averageDealsPerAgent: activeAgents ? (totalDeals / activeAgents).toFixed(1) : '0',
      club30Count,
      weekendDeals
    };
  }, [filtered]);

  const dailyTrend = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((row) => map.set(row.saleDate, (map.get(row.saleDate) ?? 0) + row.totalDeals));
    return Array.from(map.entries())
      .sort((a, b) => dateValue(a[0]) - dateValue(b[0]))
      .map(([date, deals]) => ({ date, deals }));
  }, [filtered]);

  const teams = ['All', ...unique(rows.map((r) => r.team))];
  const agents = ['All', ...unique(rows.map((r) => r.agentName))];
  const months = ['All', ...unique(rows.map((r) => r.month))];
  const closeTypes = ['All', ...unique(rows.map((r) => r.howClosed))];
  const teamData = groupSum(filtered, 'team');
  const agentData = groupSum(filtered, 'agentName').slice(0, 15);
  const closeData = groupSum(filtered, 'howClosed');
  const products = productMix(filtered);


  if (loading) return <main className="min-h-screen p-8"><p>Loading Direct Meds dashboard...</p></main>;
  if (error) return <main className="min-h-screen p-8"><p className="text-red-300">{error}</p></main>;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#0f67b155,transparent_45%),#071a2f] p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-direct-cyan">Direct Meds</p>
            <h1 className="mt-2 text-4xl font-bold">Sales Performance Dashboard</h1>
            <p className="mt-2 max-w-2xl text-white/65">Live reporting from Dashboard_Safe_Data only. PHI fields are not connected to this application.</p>
          </div>
          <div className="flex flex-col gap-2 text-right sm:flex-row sm:items-center">
            <button className="btn" onClick={() => location.reload()}>Refresh Data</button>
          </div>
        </header>

        <section className="card grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <select className="input" value={month} onChange={(e) => setMonth(e.target.value)}>{months.map((v) => <option key={v}>{v}</option>)}</select>
          <select className="input" value={team} onChange={(e) => setTeam(e.target.value)}>{teams.map((v) => <option key={v}>{v}</option>)}</select>
          <select className="input" value={agent} onChange={(e) => setAgent(e.target.value)}>{agents.map((v) => <option key={v}>{v}</option>)}</select>
          <select className="input" value={howClosed} onChange={(e) => setHowClosed(e.target.value)}>{closeTypes.map((v) => <option key={v}>{v}</option>)}</select>
          <input className="input" placeholder="Search deals..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Total deals" value={summary.totalDeals} icon={Activity} />
          <StatCard title="Active agents" value={summary.activeAgents} icon={Users} />
          <StatCard title="Avg deals / agent" value={summary.averageDealsPerAgent} icon={CalendarDays} />
          <StatCard title="Club 30 count" value={summary.club30Count} icon={Medal} />
          <StatCard title="Weekend deals" value={summary.weekendDeals} icon={CalendarCheck} />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="card h-96">
            <h2 className="mb-4 text-xl font-bold">Daily deal trend</h2>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.12)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,.6)" />
                <YAxis stroke="rgba(255,255,255,.6)" />
                <Tooltip contentStyle={{ background: '#102235', border: '1px solid rgba(255,255,255,.15)', borderRadius: 12 }} />
                <Area type="monotone" dataKey="deals" stroke="#36c2f3" fill="#36c2f344" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card h-96">
            <h2 className="mb-4 text-xl font-bold">Team comparison</h2>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={teamData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.12)" />
                <XAxis type="number" stroke="rgba(255,255,255,.6)" />
                <YAxis type="category" dataKey="name" width={120} stroke="rgba(255,255,255,.6)" />
                <Tooltip contentStyle={{ background: '#102235', border: '1px solid rgba(255,255,255,.15)', borderRadius: 12 }} />
                <Bar dataKey="deals" fill="#36c2f3" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="card h-80">
            <h2 className="mb-4 text-xl font-bold">Product mix</h2>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={products} dataKey="deals" nameKey="name" outerRadius={100} label>
                  {products.map((_, index) => <Cell key={index} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#102235', border: '1px solid rgba(255,255,255,.15)', borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card h-80 xl:col-span-2">
            <h2 className="mb-4 text-xl font-bold">Top agents</h2>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={agentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.12)" />
                <XAxis type="number" stroke="rgba(255,255,255,.6)" />
                <YAxis type="category" dataKey="name" width={150} stroke="rgba(255,255,255,.6)" />
                <Tooltip contentStyle={{ background: '#102235', border: '1px solid rgba(255,255,255,.15)', borderRadius: 12 }} />
                <Bar dataKey="deals" fill="#0f67b1" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Deal table</h2>
            <p className="text-sm text-white/55">{filtered.length} rows</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/50">
                <tr>
                  <th className="table-cell">Sale date</th>
                  <th className="table-cell">Agent</th>
                  <th className="table-cell">Team</th>
                  <th className="table-cell">GLPs</th>
                  <th className="table-cell">Other</th>
                  <th className="table-cell">Add-ons</th>
                  <th className="table-cell">Closed</th>
                  <th className="table-cell">Deals</th>
                  <th className="table-cell">Portal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.slice(0, 250).map((row) => (
                  <tr key={row.dealId} className="hover:bg-white/5">
                    <td className="table-cell">{row.saleDate}</td>
                    <td className="table-cell font-semibold">{row.agentName}</td>
                    <td className="table-cell">{row.team}</td>
                    <td className="table-cell">{row.glps}</td>
                    <td className="table-cell">{row.other}</td>
                    <td className="table-cell">{row.addOns}</td>
                    <td className="table-cell">{row.howClosed}</td>
                    <td className="table-cell font-bold">{row.totalDeals}</td>
                    <td className="table-cell">
                      {row.portalAddress ? <a className="btn inline-block" href={row.portalAddress} target="_blank">View</a> : <span className="text-white/40">None</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
