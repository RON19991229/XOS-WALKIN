import { redirect } from 'next/navigation';
import { createClient } from './supabase-server';

export async function requireAuth(allowedRoles: ('staff' | 'admin')[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: appUser } = await supabase
    .from('app_users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!appUser) {
    redirect('/login');
  }

  if (!allowedRoles.includes(appUser.role)) {
    if (appUser.role === 'admin') redirect('/admin');
    redirect('/staff');
  }

  return {
    userId: user.id,
    email: user.email!,
    role: appUser.role as 'staff' | 'admin',
    displayName: appUser.display_name || user.email!,
  };
}
