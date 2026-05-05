export type CustomerStatus = 'active' | 'banned';

export interface Customer {
  id: string;
  ic: string;
  name: string;
  phone: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  status: CustomerStatus;
  warning_count: number;
  ban_reason: string | null;
  banned_at: string | null;
  banned_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  customer_id: string | null;
  ic: string;
  status: 'approved' | 'denied_banned';
  visited_at: string;
}

export interface Warning {
  id: string;
  customer_id: string;
  reason: string;
  added_by: string;
  added_by_name: string | null;
  created_at: string;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  note: string;
  added_by: string;
  added_by_name: string | null;
  created_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  display_name: string | null;
  role: 'staff' | 'admin';
  created_at: string;
}
