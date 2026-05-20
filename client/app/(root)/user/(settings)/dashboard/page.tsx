'use client';

import { useQuery } from '@tanstack/react-query';
import { Eye, FileText, MessageSquare, Star } from 'lucide-react';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { StatCard } from '@/components/shared/StatCard';
import { getUserDashboard } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

type DashboardData = Awaited<ReturnType<typeof getUserDashboard>>;

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ['dashboard', user?.username],
    queryFn: () => getUserDashboard(user!.username),
    enabled: !!user,
  });

  if (isLoading) return null;
  if (isError || !data) return (
    <p className="text-red-400 text-sm">Failed to load dashboard.</p>
  );

  const { summary, pastesByMonth, likesByMonth, commentsByMonth, topPastes } = data;

  const pastesChart = pastesByMonth.map((r) => ({ month: r.month, Pastes: Number(r.count) }));
  const likesChart = likesByMonth.map((r) => ({ month: r.month, Likes: Number(r.count) }));
  const commentsChart = commentsByMonth.map((r) => ({ month: r.month, Comments: Number(r.count) }));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold border-b border-zinc-300 dark:border-zinc-700 pb-2">
        My Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Pastes"   value={summary.totalPastes}   icon={FileText}      iconColor="text-sky-500" />
        <StatCard label="Total Views"    value={summary.totalViews}    icon={Eye}           iconColor="text-emerald-500" />
        <StatCard label="Total Likes"    value={summary.totalLikes}    icon={Star}          iconColor="text-yellow-500" />
        <StatCard label="Total Comments" value={summary.totalComments} icon={MessageSquare} iconColor="text-purple-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartCard title="Pastes Created" data={pastesChart} dataKey="Pastes" color="#38bdf8" />
        <ChartCard title="Likes Received" data={likesChart}  dataKey="Likes"  color="#facc15" />
        <ChartCard title="Comments Received" data={commentsChart} dataKey="Comments" color="#a78bfa" />
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3 text-neutral-700 dark:text-neutral-300">
          Top 5 Pastes by Views
        </h2>
        {topPastes.length === 0 ? (
          <p className="text-sm text-zinc-500">No pastes yet.</p>
        ) : (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Syntax</th>
                  <th className="px-4 py-2 text-left">Exposure</th>
                  <th className="px-4 py-2 text-right">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {topPastes.map((paste) => (
                  <tr key={paste.id} className="bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors">
                    <td className="px-4 py-2.5">
                      <Link href={`/${paste.link_endpoint}`} className="text-sky-600 dark:text-sky-400 hover:underline truncate block max-w-[240px]">
                        {paste.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">
                      {paste.syntaxHighlight?.language ?? '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        paste.exposure === 'public'   ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        paste.exposure === 'private'  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                                        'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                      }`}>
                        {paste.exposure}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-neutral-700 dark:text-neutral-300">
                      {paste.view_count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  data,
  dataKey,
  color,
}: {
  title: string;
  data: Record<string, string | number>[];
  dataKey: string;
  color: string;
}) {
  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
      <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-3">{title}</h3>
      {data.length === 0 ? (
        <p className="text-xs text-zinc-400 text-center py-8">No data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '6px', fontSize: '12px' }}
              labelStyle={{ color: '#a1a1aa' }}
              itemStyle={{ color: color }}
            />
            <Bar dataKey={dataKey} fill={color} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
