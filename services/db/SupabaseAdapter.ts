import { z } from 'zod';
import { RecommendationSchema, SessionSchema, UserSchema, PartnerProfileSchema, type Recommendation, type Session, type User, type PartnerProfile } from '@/types/schemas';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const hasSupabase = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

type Tables = 'users' | 'partners' | 'recommendations' | 'sessions';

type Query = Record<string, string>;

async function sb<T>(table: Tables, init?: RequestInit & { query?: Query }) {
  if (!hasSupabase) throw new Error('Supabase env not set');
  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
  const query = init?.query
    ? '?' + new URLSearchParams(init.query as Record<string, string>).toString()
    : '';
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`[SupabaseAdapter] ${table} error`, res.status, text);
    throw new Error(text || `Supabase error ${res.status}`);
  }
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await res.json()) as T;
  return undefined as unknown as T;
}

function parseArray<T>(schema: z.ZodTypeAny, data: unknown): T[] {
  try {
    return z.array(schema).parse(data) as T[];
  } catch (e) {
    console.error('[SupabaseAdapter] parse array error', e);
    return [] as T[];
  }
}

function parseOne<T>(schema: z.ZodTypeAny, data: unknown): T | null {
  try {
    return schema.parse(data) as T;
  } catch (e) {
    console.error('[SupabaseAdapter] parse one error', e);
    return null;
  }
}

export class SupabaseAdapter {
  async getUser(): Promise<User | null> {
    const rows = await sb<any[]>('users', { query: { select: '*', limit: '1' } });
    const user = rows?.[0] ? parseOne<User>(UserSchema, rows[0]) : null;
    return user;
  }

  async upsertUser(user: User): Promise<void> {
    const validated = UserSchema.parse(user);
    const body = JSON.stringify(validated);
    await sb('users', { method: 'POST', body, headers: { Prefer: 'resolution=merge-duplicates,return=representation' } });
  }

  async deleteUser(hard: boolean = false): Promise<void> {
    const current = await this.getUser();
    if (!current) return;
    if (hard) {
      await sb('users', { method: 'DELETE', query: { id: `eq.${current.id}` } });
    } else {
      const updated = { isDeleted: true, deletedAt: String(Date.now()) } as unknown as User;
      await sb('users', { method: 'PATCH', query: { id: `eq.${current.id}` }, body: JSON.stringify(updated) });
    }
  }

  async getPartners(): Promise<PartnerProfile[]> {
    const rows = await sb<any[]>('partners', { query: { select: '*', isDeleted: 'eq.false', order: 'id.asc' } });
    return parseArray<PartnerProfile>(PartnerProfileSchema, rows);
  }

  async upsertPartner(partner: PartnerProfile): Promise<void> {
    const validated = PartnerProfileSchema.parse(partner);
    await sb('partners', { method: 'POST', body: JSON.stringify(validated), headers: { Prefer: 'resolution=merge-duplicates' } });
  }

  async softDeletePartner(id: string): Promise<void> {
    await sb('partners', { method: 'PATCH', query: { id: `eq.${id}` }, body: JSON.stringify({ isDeleted: true, deletedAt: String(Date.now()) }) });
  }

  async getRecommendations(): Promise<Recommendation[]> {
    const rows = await sb<any[]>('recommendations', { query: { select: '*', order: 'id.asc' } });
    return parseArray<Recommendation>(RecommendationSchema, rows);
  }

  async addRecommendations(recs: Recommendation[]): Promise<void> {
    const validated = z.array(RecommendationSchema).parse(recs);
    await sb('recommendations', { method: 'POST', body: JSON.stringify(validated), headers: { Prefer: 'resolution=merge-duplicates' } });
  }

  async getSession(): Promise<Session | null> {
    const rows = await sb<any[]>('sessions', { query: { select: '*', limit: '1', order: 'createdAt.desc' } });
    const session = rows?.[0] ? parseOne<Session>(SessionSchema, rows[0]) : null;
    return session;
  }

  async upsertSession(session: Session): Promise<void> {
    const validated = SessionSchema.parse(session);
    await sb('sessions', { method: 'POST', body: JSON.stringify(validated), headers: { Prefer: 'resolution=merge-duplicates' } });
  }

  async clearAll(): Promise<void> {
    await sb('recommendations', { method: 'DELETE', query: {} as Query });
    await sb('partners', { method: 'DELETE', query: {} as Query });
    await sb('sessions', { method: 'DELETE', query: {} as Query });
    await sb('users', { method: 'DELETE', query: {} as Query });
  }

  async updateDesiredExperiences(_exps: string[]): Promise<void> {
    const session = await this.getSession();
    const next = { ...(session ?? {}), desiredExperiences: _exps } as Session;
    await this.upsertSession(next);
  }

  async updateDateStartISO(iso: string): Promise<void> {
    const session = await this.getSession();
    const next = { ...(session ?? {}), dateStartISO: iso } as Session;
    await this.upsertSession(next);
  }
}


export function getSupabaseAvailability() {
  return hasSupabase;
}
