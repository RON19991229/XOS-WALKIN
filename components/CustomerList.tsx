'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { Customer } from '@/lib/types';

interface CustomerListProps {
  baseHref: '/staff/customers' | '/admin/customers';
}

export default function CustomerList({ baseHref }: CustomerListProps) {
  const supabase = createClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'banned' | 'warned'>('all');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    let query = supabase.from('customers').select('*').order('created_at', { ascending: false });

    if (filter === 'active') query = query.eq('status', 'active');
    if (filter === 'banned') query = query.eq('status', 'banned');
    if (filter === 'warned') query = query.gt('warning_count', 0);

    const { data } = await query.limit(500);
    if (data) setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(s) ||
      c.ic.toLowerCase().includes(s) ||
      c.phone.toLowerCase().includes(s)
    );
  });

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'ALL' },
    { key: 'active', label: 'ACTIVE' },
    { key: 'warned', label: 'WARNED' },
    { key: 'banned', label: 'BANNED' },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <p className="font-mono text-xs tracking-[0.3em] text-ink/60 mb-2">// DATABASE</p>
        <h1 className="font-display text-5xl md:text-6xl tracking-tighter mb-2">CUSTOMERS</h1>
        <div className="h-2 w-24 bg-accent" />
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH BY NAME, IC, OR PHONE..."
          className="input-field font-mono text-base"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`font-display text-sm tracking-widest px-4 py-2 border-2 border-ink transition-colors ${
              filter === f.key ? 'bg-ink text-bone' : 'bg-bone hover:bg-accent hover:bg-opacity-40'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card-brutal text-center py-12 font-mono">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card-brutal text-center py-16">
          <p className="font-display text-3xl mb-2">NO CUSTOMERS FOUND</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Link key={c.id} href={`${baseHref}/${c.id}`}>
              <div
                className={`border-4 border-ink p-4 hover:translate-x-1 transition-transform ${
                  c.status === 'banned' ? 'bg-danger text-bone' : 'bg-bone'
                }`}
                style={{ boxShadow: '4px 4px 0 0 #0a0a0a' }}
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-display text-xl tracking-tight truncate">
                        {c.name.toUpperCase()}
                      </p>
                      {c.status === 'banned' && (
                        <span className="font-display text-xs tracking-widest bg-bone text-danger px-2 py-0.5">
                          ✕ BANNED
                        </span>
                      )}
                      {c.status === 'active' && c.warning_count > 0 && (
                        <span className="font-display text-xs tracking-widest bg-accent text-ink px-2 py-0.5">
                          ⚠ {c.warning_count}/3
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-sm opacity-80">{c.ic} · {c.phone}</p>
                  </div>
                  <div className="font-display text-2xl">→</div>
                </div>
              </div>
            </Link>
          ))}
          <div className="text-center font-mono text-xs text-ink/60 pt-4">
            Showing {filtered.length} of {customers.length}
          </div>
        </div>
      )}
    </main>
  );
}
