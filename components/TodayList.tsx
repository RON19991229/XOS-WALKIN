'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { formatTime } from '@/lib/utils';

interface VisitRow {
  id: string;
  visited_at: string;
  visit_status: 'approved' | 'denied_banned' | 'denied_age';
  customer_id: string;
  ic: string;
  name: string;
  phone: string;
  nationality: string;
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
      const date = d.toLocaleDateString('en-MY', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kuala_Lumpur',
      });
      setNow(`${date} · ${formatTime(d)}`);
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  const fetchVisits = async () => {
    const { data } = await supabase.from('todays_visits').select('*');
    if (data) setVisits(data as VisitRow[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchVisits();

    const channel = supabase
      .channel('today-visits')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'visits' },
        () => fetchVisits()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'customers' },
        () => fetchVisits()
      )
      .subscribe();

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
    denied: visits.filter((v) => v.visit_status !== 'approved').length,
  };

  return (
    <div className="dashboard-light min-h-screen">
      {/* Header section */}
      <div className="bg-white border-b border-neutral-200 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-neutral-500 mb-1">
              // LIVE FEED
            </p>
            <h1 className="font-display text-3xl md:text-4xl tracking-tight">TODAY</h1>
            <p className="font-mono text-xs text-neutral-600 mt-1">
              <span className="inline-block w-1.5 h-1.5 bg-success rounded-full mr-1.5 animate-pulse-slow align-middle" />
              {now}
            </p>
          </div>
          <div className="flex gap-3">
            <Stat label="TOTAL" value={stats.total} />
            <Stat label="OK" value={stats.approved} color="green" />
            <Stat label="DENIED" value={stats.denied} color="red" />
          </div>
        </div>
      </div>

      {/* Column headers (desktop) */}
      <div className="hidden md:grid bg-ink text-accent px-6 py-2 font-mono text-[10px] tracking-[0.15em] sticky top-[60px] z-10"
        style={{ gridTemplateColumns: '90px 1fr 200px 180px 100px' }}>
        <div>TIME</div>
        <div>NAME</div>
        <div>IC / PASSPORT</div>
        <div>PHONE</div>
        <div className="text-center">STATUS</div>
      </div>

      {/* Rows */}
      {loading ? (
        <div className="text-center py-16 font-mono text-neutral-500">Loading...</div>
      ) : visits.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-2xl mb-2 text-neutral-700">NO CHECK-INS YET</p>
          <p className="font-mono text-xs text-neutral-500">Waiting for first walk-in of the day</p>
        </div>
      ) : (
        <div>
          {visits.map((v) => (
            <VisitRow key={v.id} visit={v} baseHref={baseHref} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: 'green' | 'red' }) {
  const colorClass = color === 'green' ? 'text-success' : color === 'red' ? 'text-danger' : '';
  return (
    <div className="text-center">
      <div className="font-mono text-[10px] tracking-widest text-neutral-500">{label}</div>
      <div className={`font-display text-2xl md:text-3xl ${colorClass}`}>{value}</div>
    </div>
  );
}

function VisitRow({ visit, baseHref }: { visit: VisitRow; baseHref: string }) {
  const time = formatTime(visit.visited_at);
  const isBanned = visit.visit_status === 'denied_banned' || visit.customer_status === 'banned';
  const isDeniedAge = visit.visit_status === 'denied_age';
  const hasWarnings = visit.warning_count > 0 && visit.customer_status !== 'banned';

  let bgClass = 'bg-white hover:bg-yellow-50';
  let statusLabel = '✓ OK';
  let statusClass = 'bg-success text-white';
  let nameDisplay = visit.name?.toUpperCase() || 'UNKNOWN';

  if (isBanned) {
    bgClass = 'bg-red-50 hover:bg-red-100';
    statusLabel = '✕ BANNED';
    statusClass = 'bg-danger text-white animate-flash-danger';
  } else if (isDeniedAge) {
    bgClass = 'bg-red-50 hover:bg-red-100';
    statusLabel = '✕ AGE';
    statusClass = 'bg-danger text-white';
    nameDisplay = nameDisplay === 'UNKNOWN' ? 'UNDERAGE' : nameDisplay;
  } else if (hasWarnings) {
    bgClass = 'bg-yellow-50 hover:bg-yellow-100';
    statusLabel = `⚠ ${visit.warning_count}/3`;
    statusClass = 'bg-accent text-ink';
  }

  // Skip rendering if there's no customer_id (orphaned underage attempt)
  if (!visit.customer_id) {
    return (
      <div
        className={`grid items-center px-4 md:px-6 py-2.5 border-b border-neutral-200 ${bgClass}`}
        style={{ gridTemplateColumns: '90px 1fr 200px 180px 100px' }}
      >
        <div className="font-mono text-sm font-bold">{time}</div>
        <div className="font-bold text-sm md:text-base truncate">UNDERAGE ATTEMPT</div>
        <div className="hidden md:block font-mono text-xs text-neutral-600 truncate">{visit.ic}</div>
        <div className="hidden md:block font-mono text-xs text-neutral-600">—</div>
        <div className="text-center">
          <span className={`font-display text-[10px] tracking-widest px-2 py-1 ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Link href={`${baseHref}/${visit.customer_id}`}>
      <div
        className={`md:grid flex flex-col gap-1 items-center px-4 md:px-6 py-2.5 border-b border-neutral-200 cursor-pointer transition-colors ${bgClass}`}
        style={{ gridTemplateColumns: '90px 1fr 200px 180px 100px' }}
      >
        {/* Mobile: stacked layout */}
        <div className="md:hidden w-full">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold">{time}</span>
              <span className={`font-display text-[10px] tracking-widest px-2 py-0.5 ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
            <span className="text-xs text-neutral-400">→</span>
          </div>
          <div className="font-bold text-sm truncate">{nameDisplay}</div>
          <div className="font-mono text-[11px] text-neutral-600 truncate">
            {visit.ic} · {visit.phone || '—'}
          </div>
        </div>

        {/* Desktop: table layout */}
        <div className="hidden md:block font-mono text-sm font-bold">{time}</div>
        <div className="hidden md:block font-bold text-sm truncate">{nameDisplay}</div>
        <div className="hidden md:block font-mono text-xs text-neutral-600 truncate">
          {visit.nationality === 'foreigner' && <span className="text-accent mr-1">🌍</span>}
          {visit.ic}
        </div>
        <div className="hidden md:block font-mono text-xs text-neutral-600 truncate">
          {visit.phone || '—'}
        </div>
        <div className="hidden md:block text-center">
          <span className={`font-display text-[10px] tracking-widest px-2 py-1 ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
