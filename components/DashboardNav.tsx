'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import BrandMark from './BrandMark';

interface DashboardNavProps {
  role: 'staff' | 'admin';
  userName: string;
}

export default function DashboardNav({ role, userName }: DashboardNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const links = role === 'admin'
    ? [
        { href: '/admin', label: 'TODAY' },
        { href: '/admin/customers', label: 'CUSTOMERS' },
        { href: '/admin/reports', label: 'REPORTS' },
        { href: '/admin/audit', label: 'AUDIT' },
      ]
    : [
        { href: '/staff', label: 'TODAY' },
        { href: '/staff/customers', label: 'CUSTOMERS' },
      ];

  return (
    <header className="border-b-4 border-ink bg-bone sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <BrandMark size="md" />
          <span className="hidden md:inline-block font-mono text-xs tracking-widest bg-ink text-bone px-2 py-1">
            {role.toUpperCase()}
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== '/admin' && link.href !== '/staff' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`hidden md:inline-block font-display text-sm tracking-widest px-4 py-2 transition-colors ${
                  active ? 'bg-ink text-bone' : 'hover:bg-accent hover:bg-opacity-40'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <span className="hidden lg:inline-block font-mono text-xs ml-4 px-3 py-1 border-2 border-ink">
            {userName}
          </span>

          <button
            onClick={handleLogout}
            className="font-display text-sm tracking-widest px-4 py-2 ml-2 hover:bg-danger hover:text-bone transition-colors"
          >
            EXIT
          </button>
        </nav>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden flex border-t-2 border-ink overflow-x-auto">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== '/admin' && link.href !== '/staff' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`font-display text-xs tracking-widest px-4 py-3 whitespace-nowrap ${
                active ? 'bg-ink text-bone' : ''
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
