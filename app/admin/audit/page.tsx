import { requireAuth } from '@/lib/auth';
import DashboardNav from '@/components/DashboardNav';
import AuditClient from './AuditClient';

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage() {
  const auth = await requireAuth(['admin']);
  return (
    <div className="min-h-screen">
      <DashboardNav role={auth.role} userName={auth.displayName} />
      <AuditClient />
    </div>
  );
}
