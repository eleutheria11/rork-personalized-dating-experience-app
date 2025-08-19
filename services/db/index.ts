import { adapter as localAdapter, LocalStorageAdapter, type DataAdapter } from '@/data';
import { SupabaseAdapter, getSupabaseAvailability } from './SupabaseAdapter';

// Create a structural adapter wrapper to satisfy the DataAdapter interface at compile time
const supabase = new SupabaseAdapter();
const supabaseAdapter: DataAdapter = {
  getUser: () => supabase.getUser(),
  upsertUser: (u) => supabase.upsertUser(u),
  deleteUser: (hard?: boolean) => supabase.deleteUser(hard),

  getPartners: () => supabase.getPartners(),
  upsertPartner: (p) => supabase.upsertPartner(p),
  softDeletePartner: (id: string) => supabase.softDeletePartner(id),

  getRecommendations: () => supabase.getRecommendations(),
  addRecommendations: (r) => supabase.addRecommendations(r),

  getSession: () => supabase.getSession(),
  upsertSession: (s) => supabase.upsertSession(s),
  clearAll: () => supabase.clearAll(),

  updateDesiredExperiences: (e) => supabase.updateDesiredExperiences(e),
  updateDateStartISO: (iso) => supabase.updateDateStartISO(iso),
};

let adapter: DataAdapter;

if (getSupabaseAvailability()) {
  adapter = supabaseAdapter;
  console.log('[DB] Using SupabaseAdapter');
} else {
  adapter = localAdapter;
  console.log('[DB] Using LocalStorageAdapter');
}

export { adapter, LocalStorageAdapter, SupabaseAdapter };

export async function deleteMyAccount(): Promise<void> {
  try {
    console.log('[DB] deleteMyAccount called');
    await adapter.deleteUser(true);
  } catch (e) {
    console.error('[DB] deleteMyAccount error', e);
    throw e as Error;
  }
}
