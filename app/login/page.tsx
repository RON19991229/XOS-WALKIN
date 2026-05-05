'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import BrandMark from '@/components/BrandMark';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    // Check role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Login failed');
      setLoading(false);
      return;
    }

    const { data: appUser } = await supabase
      .from('app_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (appUser?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/staff');
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-bone">
      <header className="px-6 py-5 border-b-4 border-ink">
        <BrandMark size="md" />
      </header>

      <div className="h-3 stripes-yellow" />

      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="font-mono text-xs tracking-[0.3em] text-ink/60 mb-3">
              // STAFF ACCESS
            </p>
            <h1 className="font-display text-5xl tracking-tighter mb-2">
              SIGN IN
            </h1>
            <div className="h-2 w-16 bg-accent" />
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="font-display text-xs tracking-widest mb-2 block">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="input-field"
              />
            </div>

            <div>
              <label className="font-display text-xs tracking-widest mb-2 block">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
            </div>

            {error && (
              <div className="bg-danger text-bone px-4 py-3 font-display text-sm tracking-wider">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN →'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
