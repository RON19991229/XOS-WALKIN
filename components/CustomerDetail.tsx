'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Customer, Visit, Warning, CustomerNote } from '@/lib/types';

interface CustomerDetailProps {
  customerId: string;
  role: 'staff' | 'admin';
  userId: string;
  userName: string;
  baseHref: '/staff/customers' | '/admin/customers';
}

export default function CustomerDetail({
  customerId,
  role,
  userId,
  userName,
  baseHref,
}: CustomerDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [loading, setLoading] = useState(true);

  const [showBanModal, setShowBanModal] = useState(false);
  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const [banReason, setBanReason] = useState('');
  const [warningReason, setWarningReason] = useState('');
  const [noteText, setNoteText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAll = async () => {
    const [cust, vis, warns, nts] = await Promise.all([
      supabase.from('customers').select('*').eq('id', customerId).single(),
      supabase.from('visits').select('*').eq('customer_id', customerId).order('visited_at', { ascending: false }).limit(50),
      supabase.from('warnings').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
      supabase.from('customer_notes').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
    ]);

    if (cust.data) setCustomer(cust.data);
    if (vis.data) setVisits(vis.data);
    if (warns.data) setWarnings(warns.data);
    if (nts.data) setNotes(nts.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const logAudit = async (action: string, details: Record<string, unknown> = {}) => {
    await supabase.from('audit_log').insert({
      user_id: userId,
      user_name: userName,
      action,
      customer_id: customerId,
      details,
    });
  };

  const handleAddWarning = async () => {
    if (!customer || !warningReason.trim()) return;
    setActionLoading(true);

    const newCount = Math.min(customer.warning_count + 1, 3);

    await supabase.from('warnings').insert({
      customer_id: customerId,
      reason: warningReason.trim(),
      added_by: userId,
      added_by_name: userName,
    });

    await supabase.from('customers').update({ warning_count: newCount }).eq('id', customerId);

    await logAudit('add_warning', { reason: warningReason.trim(), new_count: newCount });

    setWarningReason('');
    setShowWarningModal(false);
    setActionLoading(false);
    await fetchAll();
  };

  const handleBan = async () => {
    if (!customer || !banReason.trim()) return;
    setActionLoading(true);

    await supabase
      .from('customers')
      .update({
        status: 'banned',
        ban_reason: banReason.trim(),
        banned_at: new Date().toISOString(),
        banned_by: userId,
      })
      .eq('id', customerId);

    await logAudit('ban', { reason: banReason.trim() });

    setBanReason('');
    setShowBanModal(false);
    setActionLoading(false);
    await fetchAll();
  };

  const handleUnban = async () => {
    if (!customer) return;
    setActionLoading(true);

    await supabase
      .from('customers')
      .update({
        status: 'active',
        ban_reason: null,
        banned_at: null,
        banned_by: null,
      })
      .eq('id', customerId);

    await logAudit('unban', {});

    setShowUnbanModal(false);
    setActionLoading(false);
    await fetchAll();
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setActionLoading(true);

    await supabase.from('customer_notes').insert({
      customer_id: customerId,
      note: noteText.trim(),
      added_by: userId,
      added_by_name: userName,
    });

    await logAudit('add_note', { note: noteText.trim() });

    setNoteText('');
    setShowNoteModal(false);
    setActionLoading(false);
    await fetchAll();
  };

  const handleResetWarnings = async () => {
    if (!confirm('Reset warnings to 0?')) return;
    setActionLoading(true);
    await supabase.from('customers').update({ warning_count: 0 }).eq('id', customerId);
    await logAudit('reset_warnings', {});
    setActionLoading(false);
    await fetchAll();
  };

  if (loading) {
    return <main className="max-w-4xl mx-auto px-6 py-8 font-mono">Loading...</main>;
  }

  if (!customer) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-8">
        <p className="font-display text-2xl">CUSTOMER NOT FOUND</p>
      </main>
    );
  }

  const isBanned = customer.status === 'banned';
  const isAdmin = role === 'admin';

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      <button
        onClick={() => router.push(baseHref)}
        className="font-mono text-sm underline underline-offset-4 mb-4"
      >
        ← BACK TO LIST
      </button>

      {/* Status banner */}
      {isBanned && (
        <div className="bg-danger text-bone border-4 border-ink p-5 mb-6" style={{ boxShadow: '6px 6px 0 0 #0a0a0a' }}>
          <p className="font-display text-3xl tracking-tight mb-1">✕ BANNED</p>
          {customer.ban_reason && (
            <p className="font-mono text-sm opacity-90">REASON: {customer.ban_reason}</p>
          )}
          {customer.banned_at && (
            <p className="font-mono text-xs opacity-70 mt-1">
              SINCE: {new Date(customer.banned_at).toLocaleString('en-MY')}
            </p>
          )}
        </div>
      )}

      {!isBanned && customer.warning_count > 0 && (
        <div className="bg-accent text-ink border-4 border-ink p-5 mb-6" style={{ boxShadow: '6px 6px 0 0 #0a0a0a' }}>
          <p className="font-display text-2xl tracking-tight">
            ⚠ {customer.warning_count} OF 3 WARNINGS
          </p>
          <p className="font-mono text-sm mt-1">
            {customer.warning_count >= 3
              ? 'MAXIMUM WARNINGS REACHED — ADMIN REVIEW REQUIRED'
              : 'Continued violations may result in a ban'}
          </p>
        </div>
      )}

      {/* Customer info */}
      <div className="card-brutal mb-6">
        <p className="font-mono text-xs tracking-[0.3em] text-ink/60 mb-2">// PROFILE</p>
        <h1 className="font-display text-4xl md:text-5xl tracking-tighter mb-4 break-words">
          {customer.name.toUpperCase()}
        </h1>
        <div className="h-1 w-16 bg-accent mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="IC / PASSPORT" value={customer.ic} mono />
          <Field label="PHONE" value={customer.phone} mono />
          <Field label="EMERGENCY NAME" value={customer.emergency_contact_name || '—'} />
          <Field label="EMERGENCY PHONE" value={customer.emergency_contact_phone || '—'} mono />
          <Field
            label="MEMBER SINCE"
            value={new Date(customer.created_at).toLocaleDateString('en-MY', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          />
          <Field label="TOTAL VISITS" value={String(visits.filter(v => v.status === 'approved').length)} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        {!isBanned && customer.warning_count < 3 && (
          <button
            onClick={() => setShowWarningModal(true)}
            className="btn-secondary"
            style={{ boxShadow: '4px 4px 0 0 #d4ff00' }}
          >
            + ADD WARNING
          </button>
        )}

        {isAdmin && customer.warning_count > 0 && (
          <button
            onClick={handleResetWarnings}
            className="btn-secondary"
          >
            RESET WARNINGS
          </button>
        )}

        <button
          onClick={() => setShowNoteModal(true)}
          className="btn-secondary"
        >
          + ADD NOTE
        </button>

        {isAdmin && !isBanned && (
          <button
            onClick={() => setShowBanModal(true)}
            className="font-display text-lg tracking-wider px-6 py-4 bg-danger text-bone border-4 border-ink"
            style={{ boxShadow: '4px 4px 0 0 #0a0a0a' }}
          >
            BAN CUSTOMER
          </button>
        )}

        {isAdmin && isBanned && (
          <button
            onClick={() => setShowUnbanModal(true)}
            className="font-display text-lg tracking-wider px-6 py-4 bg-success text-ink border-4 border-ink"
            style={{ boxShadow: '4px 4px 0 0 #0a0a0a' }}
          >
            UNBAN CUSTOMER
          </button>
        )}
      </div>

      {/* Warnings history */}
      {warnings.length > 0 && (
        <Section title="WARNINGS HISTORY">
          {warnings.map((w) => (
            <div key={w.id} className="border-l-4 border-accent bg-bone p-4 mb-2">
              <p className="font-body text-sm mb-1">{w.reason}</p>
              <p className="font-mono text-xs text-ink/60">
                {new Date(w.created_at).toLocaleString('en-MY')} · {w.added_by_name}
              </p>
            </div>
          ))}
        </Section>
      )}

      {/* Notes */}
      {notes.length > 0 && (
        <Section title="STAFF NOTES">
          {notes.map((n) => (
            <div key={n.id} className="border-l-4 border-ink bg-bone p-4 mb-2">
              <p className="font-body text-sm mb-1 whitespace-pre-wrap">{n.note}</p>
              <p className="font-mono text-xs text-ink/60">
                {new Date(n.created_at).toLocaleString('en-MY')} · {n.added_by_name}
              </p>
            </div>
          ))}
        </Section>
      )}

      {/* Visit history */}
      <Section title="VISIT HISTORY">
        {visits.length === 0 ? (
          <p className="font-mono text-sm text-ink/60">No visits yet</p>
        ) : (
          <div className="space-y-1">
            {visits.map((v) => (
              <div
                key={v.id}
                className={`flex items-center justify-between p-3 border-2 border-ink ${
                  v.status === 'denied_banned' ? 'bg-danger text-bone' : 'bg-bone'
                }`}
              >
                <span className="font-mono text-sm">
                  {new Date(v.visited_at).toLocaleString('en-MY', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </span>
                <span className="font-display text-xs tracking-widest">
                  {v.status === 'approved' ? '✓ APPROVED' : '✕ DENIED'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Modals */}
      {showWarningModal && (
        <Modal title="ADD WARNING" onClose={() => setShowWarningModal(false)}>
          <p className="font-mono text-xs mb-4 text-ink/70">
            CURRENT: {customer.warning_count}/3 → AFTER: {Math.min(customer.warning_count + 1, 3)}/3
          </p>
          <textarea
            value={warningReason}
            onChange={(e) => setWarningReason(e.target.value)}
            placeholder="Reason for warning (e.g., wearing slippers, not re-racking weights)"
            className="input-field min-h-[120px] resize-none mb-4"
            autoFocus
          />
          <button
            onClick={handleAddWarning}
            disabled={!warningReason.trim() || actionLoading}
            className="btn-primary w-full"
          >
            {actionLoading ? 'ADDING...' : 'CONFIRM WARNING'}
          </button>
        </Modal>
      )}

      {showBanModal && (
        <Modal title="BAN CUSTOMER" onClose={() => setShowBanModal(false)} danger>
          <p className="font-mono text-xs mb-4 text-ink/70">
            This will block the customer from entering. Reason is required.
          </p>
          <textarea
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Reason for ban (required)"
            className="input-field min-h-[120px] resize-none mb-4"
            autoFocus
          />
          <button
            onClick={handleBan}
            disabled={!banReason.trim() || actionLoading}
            className="font-display text-2xl tracking-wider px-8 py-6 bg-danger text-bone border-4 border-ink w-full"
            style={{ boxShadow: '6px 6px 0 0 #0a0a0a' }}
          >
            {actionLoading ? 'BANNING...' : 'CONFIRM BAN'}
          </button>
        </Modal>
      )}

      {showUnbanModal && (
        <Modal title="UNBAN CUSTOMER" onClose={() => setShowUnbanModal(false)}>
          <p className="font-mono text-sm mb-6">
            Restore access for <strong>{customer.name}</strong>?
            <br />
            <br />
            Warning count will <strong>not</strong> reset automatically.
          </p>
          <button
            onClick={handleUnban}
            disabled={actionLoading}
            className="font-display text-2xl tracking-wider px-8 py-6 bg-success text-ink border-4 border-ink w-full"
            style={{ boxShadow: '6px 6px 0 0 #0a0a0a' }}
          >
            {actionLoading ? 'PROCESSING...' : 'CONFIRM UNBAN'}
          </button>
        </Modal>
      )}

      {showNoteModal && (
        <Modal title="ADD NOTE" onClose={() => setShowNoteModal(false)}>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note about this customer..."
            className="input-field min-h-[120px] resize-none mb-4"
            autoFocus
          />
          <button
            onClick={handleAddNote}
            disabled={!noteText.trim() || actionLoading}
            className="btn-primary w-full"
          >
            {actionLoading ? 'SAVING...' : 'SAVE NOTE'}
          </button>
        </Modal>
      )}
    </main>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-ink/60 mb-1">{label}</p>
      <p className={`text-lg break-words ${mono ? 'font-mono' : 'font-body'}`}>{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-xl tracking-widest mb-3 inline-block bg-ink text-bone px-3 py-1">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Modal({
  title,
  onClose,
  danger,
  children,
}: {
  title: string;
  onClose: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-ink/80 flex items-center justify-center p-4">
      <div className="bg-bone border-4 border-ink max-w-lg w-full" style={{ boxShadow: '8px 8px 0 0 #0a0a0a' }}>
        <div className={`flex items-center justify-between px-5 py-3 border-b-4 border-ink ${
          danger ? 'bg-danger text-bone' : 'bg-ink text-bone'
        }`}>
          <h2 className="font-display text-lg tracking-wider">{title}</h2>
          <button onClick={onClose} className="font-display text-xl">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
