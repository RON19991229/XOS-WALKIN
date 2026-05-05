'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

interface DailyStat {
  date: string;
  total: number;
  approved: number;
  denied: number;
}

interface HourStat {
  hour: number;
  count: number;
}

export default function ReportsClient() {
  const supabase = createClient();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [hourStats, setHourStats] = useState<HourStat[]>([]);
  const [totals, setTotals] = useState({ total: 0, approved: 0, denied: 0, customers: 0, banned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data: visits } = await supabase
        .from('visits')
        .select('*')
        .gte('visited_at', since.toISOString());

      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      const { count: bannedCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'banned');

      // Group by day
      const byDay = new Map<string, DailyStat>();
      const byHour = new Map<number, number>();

      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        byDay.set(key, { date: key, total: 0, approved: 0, denied: 0 });
      }

      for (let h = 0; h < 24; h++) byHour.set(h, 0);

      visits?.forEach((v) => {
        const date = new Date(v.visited_at);
        const dayKey = date.toISOString().split('T')[0];
        const hour = date.getHours();

        const day = byDay.get(dayKey);
        if (day) {
          day.total++;
          if (v.status === 'approved') day.approved++;
          else day.denied++;
        }

        byHour.set(hour, (byHour.get(hour) || 0) + 1);
      });

      const dailyArr = Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date));
      const hourArr = Array.from(byHour.entries()).map(([hour, count]) => ({ hour, count }));

      setDailyStats(dailyArr);
      setHourStats(hourArr);
      setTotals({
        total: visits?.length || 0,
        approved: visits?.filter((v) => v.status === 'approved').length || 0,
        denied: visits?.filter((v) => v.status === 'denied_banned').length || 0,
        customers: customerCount || 0,
        banned: bannedCount || 0,
      });
      setLoading(false);
    };

    fetchData();
  }, [period, supabase]);

  const exportCSV = async () => {
    const { data: customers } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!customers) return;

    const header = 'IC,Name,Phone,Emergency Name,Emergency Phone,Status,Warnings,Ban Reason,Created At';
    const rows = customers.map((c) =>
      [
        c.ic,
        `"${c.name.replace(/"/g, '""')}"`,
        c.phone,
        c.emergency_contact_name ? `"${c.emergency_contact_name.replace(/"/g, '""')}"` : '',
        c.emergency_contact_phone || '',
        c.status,
        c.warning_count,
        c.ban_reason ? `"${c.ban_reason.replace(/"/g, '""')}"` : '',
        c.created_at,
      ].join(',')
    );

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xfitness-customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxDaily = Math.max(...dailyStats.map((d) => d.total), 1);
  const maxHourly = Math.max(...hourStats.map((h) => h.count), 1);
  const peakHour = hourStats.reduce((acc, h) => (h.count > acc.count ? h : acc), { hour: 0, count: 0 });

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] text-ink/60 mb-2">// ANALYTICS</p>
          <h1 className="font-display text-5xl md:text-6xl tracking-tighter mb-2">REPORTS</h1>
          <div className="h-2 w-24 bg-accent" />
        </div>
        <button onClick={exportCSV} className="btn-secondary">
          ↓ EXPORT CSV
        </button>
      </div>

      {/* Period selector */}
      <div className="flex gap-2 mb-6">
        {(['7d', '30d', '90d'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`font-display text-sm tracking-widest px-4 py-2 border-2 border-ink ${
              period === p ? 'bg-ink text-bone' : 'bg-bone'
            }`}
          >
            {p === '7d' ? '7 DAYS' : p === '30d' ? '30 DAYS' : '90 DAYS'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-mono">Loading...</p>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            <Stat label="WALK-INS" value={totals.total} />
            <Stat label="APPROVED" value={totals.approved} accent="green" />
            <Stat label="DENIED" value={totals.denied} accent="red" />
            <Stat label="CUSTOMERS" value={totals.customers} />
            <Stat label="BANNED" value={totals.banned} accent="red" />
          </div>

          {/* Daily chart */}
          <div className="card-brutal mb-6">
            <h2 className="font-display text-xl tracking-widest mb-4">DAILY VOLUME</h2>
            <div className="flex items-end gap-1 h-48 overflow-x-auto">
              {dailyStats.map((d) => (
                <div key={d.date} className="flex-1 min-w-[20px] flex flex-col items-center group">
                  <div className="text-xs font-mono mb-1 opacity-0 group-hover:opacity-100">
                    {d.total}
                  </div>
                  <div className="w-full flex flex-col-reverse" style={{ height: '160px' }}>
                    <div
                      className="bg-success border-l-2 border-r-2 border-ink"
                      style={{ height: `${(d.approved / maxDaily) * 100}%` }}
                    />
                    <div
                      className="bg-danger border-l-2 border-r-2 border-ink"
                      style={{ height: `${(d.denied / maxDaily) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 font-mono text-xs">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-success border border-ink" /> APPROVED
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-danger border border-ink" /> DENIED
              </span>
            </div>
          </div>

          {/* Peak hours */}
          <div className="card-brutal">
            <div className="flex items-end justify-between mb-4">
              <h2 className="font-display text-xl tracking-widest">PEAK HOURS</h2>
              <p className="font-mono text-sm">
                BUSIEST: {String(peakHour.hour).padStart(2, '0')}:00 ({peakHour.count} visits)
              </p>
            </div>
            <div className="flex items-end gap-1 h-32">
              {hourStats.map((h) => (
                <div key={h.hour} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col-reverse" style={{ height: '100px' }}>
                    <div
                      className="bg-ink"
                      style={{ height: `${(h.count / maxHourly) * 100}%`, minHeight: h.count > 0 ? '2px' : '0' }}
                    />
                  </div>
                  <div className="font-mono text-[9px] mt-1">{String(h.hour).padStart(2, '0')}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: 'green' | 'red' }) {
  const color = accent === 'green' ? 'text-success' : accent === 'red' ? 'text-danger' : '';
  return (
    <div className="card-brutal text-center">
      <p className="font-mono text-xs tracking-widest text-ink/60 mb-1">{label}</p>
      <p className={`font-display text-3xl md:text-4xl ${color}`}>{value}</p>
    </div>
  );
}
