'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

interface AuditEntry {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  customer_id: string;
  details: Record<string, unknown>;
  created_at: string;
}

export default function AuditClient() {
  const supabase = createClient();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (data) setEntries(data);
      setLoading(false);
    };
    fetch();
  }, [supabase]);

  const actionLabel = (a: string) => {
    const map: Record<string, { label: string; color: string }> = {
      ban: { label: 'BAN', color: 'bg-danger text-bone' },
      unban: { label: 'UNBAN', color: 'bg-success text-ink' },
      add_warning: { label: 'WARNING', color: 'bg-accent text-ink' },
      reset_warnings: { label: 'RESET WARNINGS', color: 'bg-bone text-ink border-2 border-ink' },
      add_note: { label: 'NOTE', color: 'bg-ink text-bone' },
    };
    return map[a] || { label: a.toUpperCase(), color: 'bg-ink text-bone' };
  };

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <p className="font-mono text-xs tracking-[0.3em] text-ink/60 mb-2">// ACTIVITY LOG</p>
        <h1 className="font-display text-5xl md:text-6xl tracking-tighter mb-2">AUDIT</h1>
        <div className="h-2 w-24 bg-accent" />
      </div>

      {loading ? (
        <p className="font-mono">Loading...</p>
      ) : entries.length === 0 ? (
        <div className="card-brutal text-center py-16">
          <p className="font-display text-2xl">NO AUDIT ENTRIES</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => {
            const { label, color } = actionLabel(e.action);
            return (
              <div key={e.id} className="border-4 border-ink bg-bone p-4" style={{ boxShadow: '4px 4px 0 0 #0a0a0a' }}>
                <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-display text-xs tracking-widest px-2 py-1 ${color}`}>
                      {label}
                    </span>
                    <span className="font-mono text-sm">{e.user_name}</span>
                  </div>
                  <span className="font-mono text-xs text-ink/60">
                    {new Date(e.created_at).toLocaleString('en-MY')}
                  </span>
                </div>
                {e.details && Object.keys(e.details).length > 0 && (
                  <pre className="font-mono text-xs bg-ink/5 p-2 mt-2 overflow-x-auto">
                    {JSON.stringify(e.details, null, 2)}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
