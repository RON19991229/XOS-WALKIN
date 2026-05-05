'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';

interface VisitRow {
  id: string;
  visited_at: string;
  visit_status: 'approved' | 'denied_banned';
  customer_id: string;
  ic: string;
  name: string;
  phone: string;
  customer_status: 'active' | 'banned';
  warning_count: number;
  ban_reason: string | null;
}

interface TodayListProps {
  baseHref: '/staff/customers' | '/admin/customers';
}

export default function TodayList({ baseHref }: TodayListProps) {
  const supabase = createClient();
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState('');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(
        d.toLocaleString('en-MY', {
          weekday: 'long',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  const fetchVisits = async () => {
    const { data } = await supabase
      .from('todays_visits')
      .select('*');
    if (data) setVisits(data as VisitRow[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchVisits();

    // Subscribe to realtime
    const channel = supabase
      .channel('today-visits')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visits' }, () => {
        fetchVisits();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'customers' }, () => {
        fetchVisits();
      })
      .subscribe();

    // Auto-refresh every 30s as fallback
    const interval = setInterval(fetchVisits, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = {
    total: visits.length,
    approved: visits.filter((v) => v.visit_status === 'approved').length,
    denied: visits.filter((v) => v.visit_status === 'denied_banned').length,
  };

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-xs tracking-[0.3em] text-ink/60 mb-2">
          // LIVE FEED
        </p>
        <div className="flex items-end justify-between flex-wrap gap-4 mb-3">
          <h1 className="font-display text-5xl md:text-6xl tracking-tighter">TODAY</h1>
          <div className="font-mono text-sm md:text-base">
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse-slow" />
              {now}
            </span>
          </div>
        </div>
        <div className="h-2 w-24 bg-accent" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
        <StatCard label="TOTAL" value={stats.total} />
        <StatCard label="APPROVED" value={stats.approved} accent="green" />
        <StatCard label="DENIED" value={stats.denied} accent="red" />
      </div>

      {/* List */}
      {loading ? (
        <div className="card-brutal text-center py-12 font-mono">Loading...</div>
      ) : visits.length === 0 ? (
        <div className="card-brutal text-center py-16">
          <p className="font-display text-3xl mb-2">NO CHECK-INS YET</p>
          <p className="font-mono text-sm text-ink/60">Waiting for first walk-in of the day</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((v) => (
            <VisitCard key={v.id} visit={v} baseHref={baseHref} />
          ))}
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: 'green' | 'red' }) {
  const colorMap = {
    green: 'text-success',
    red: 'text-danger',
  };
  return (
    <div className="card-brutal text-center">
      <p className="font-mono text-xs tracking-widest text-ink/60 mb-1">{label}</p>
      <p className={`font-display text-4xl md:text-5xl ${accent ? colorMap[accent] : ''}`}>
        {value}
      </p>
    </div>
  );
}

function VisitCard({ visit, baseHref }: { visit: VisitRow; baseHref: string }) {
  const time = new Date(visit.visited_at).toLocaleTimeString('en-MY', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const isBanned = visit.visit_status === 'denied_banned' || visit.customer_status === 'banned';
  const hasWarnings = visit.warning_count > 0;

  // Banned: full red background
  if (isBanned) {
    return (
      <Link href={`${baseHref}/${visit.customer_id}`}>
        <div className="bg-danger text-bone border-4 border-ink p-4 md:p-5 hover:translate-x-1 transition-transform animate-flash-danger" style={{ boxShadow: '6px 6px 0 0 #0a0a0a' }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-sm">{time}</span>
                <span className="font-display text-xs tracking-widest bg-bone text-danger px-2 py-1">
                  ✕ BANNED
                </span>
              </div>
              <p className="font-display text-xl md:text-2xl tracking-tight truncate">
                {visit.name?.toUpperCase() || 'UNKNOWN'}
              </p>
              <p className="font-mono text-sm opacity-90">{visit.ic} · {visit.phone}</p>
              {visit.ban_reason && (
                <p className="font-mono text-xs mt-1 opacity-80">↳ {visit.ban_reason}</p>
              )}
            </div>
            <div className="font-display text-3xl">→</div>
          </div>
        </div>
      </Link>
    );
  }

  // Approved with warnings: yellow accent
  if (hasWarnings) {
    return (
      <Link href={`${baseHref}/${visit.customer_id}`}>
        <div className="bg-bone border-4 border-ink p-4 md:p-5 hover:translate-x-1 transition-transform" style={{ boxShadow: '6px 6px 0 0 #d4ff00' }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-sm">{time}</span>
                <span className="font-display text-xs tracking-widest bg-accent text-ink px-2 py-1">
                  ⚠ {visit.warning_count}/3 WARNING{visit.warning_count > 1 ? 'S' : ''}
                </span>
              </div>
              <p className="font-display text-xl md:text-2xl tracking-tight truncate">
                {visit.name?.toUpperCase()}
              </p>
              <p className="font-mono text-sm text-ink/70">{visit.ic} · {visit.phone}</p>
            </div>
            <div className="font-display text-3xl">→</div>
          </div>
        </div>
      </Link>
    );
  }

  // Normal approved
  return (
    <Link href={`${baseHref}/${visit.customer_id}`}>
      <div className="card-brutal hover:translate-x-1 transition-transform">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-sm">{time}</span>
              <span className="font-display text-xs tracking-widest bg-success text-ink px-2 py-1">
                ✓ APPROVED
              </span>
            </div>
            <p className="font-display text-xl md:text-2xl tracking-tight truncate">
              {visit.name?.toUpperCase()}
            </p>
            <p className="font-mono text-sm text-ink/70">{visit.ic} · {visit.phone}</p>
          </div>
          <div className="font-display text-3xl">→</div>
        </div>
      </div>
    </Link>
  );
}
