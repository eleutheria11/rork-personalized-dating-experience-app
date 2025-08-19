import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';
import { UserSchema, PartnerProfileSchema, RecommendationSchema, SessionSchema, type User, type PartnerProfile, type Recommendation, type Session } from '@/types/schemas';

export interface DataAdapter {
  getUser(): Promise<User | null>;
  upsertUser(user: User): Promise<void>;
  deleteUser(hard?: boolean): Promise<void>;

  getPartners(): Promise<PartnerProfile[]>;
  upsertPartner(partner: PartnerProfile): Promise<void>;
  softDeletePartner(id: string): Promise<void>;

  getRecommendations(): Promise<Recommendation[]>;
  addRecommendations(recs: Recommendation[]): Promise<void>;

  getSession(): Promise<Session | null>;
  upsertSession(session: Session): Promise<void>;
  clearAll(): Promise<void>;

  // Planner additions
  updateDesiredExperiences(exps: string[]): Promise<void>;
  updateDateStartISO(iso: string): Promise<void>;
}

const KEYS = {
  user: 'user',
  partners: 'partners',
  recs: 'recs',
  session: 'session',
} as const;

function uniqueById<T extends { id: string }>(arr: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of arr) {
    if (!map.has(item.id)) map.set(item.id, item);
  }
  return Array.from(map.values());
}

export class LocalStorageAdapter implements DataAdapter {
  async getUser(): Promise<User | null> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.user);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const user = UserSchema.parse(parsed);
      return user;
    } catch (e) {
      console.error('[LocalStorageAdapter:getUser] parse error', e);
      return null;
    }
  }

  async upsertUser(user: User): Promise<void> {
    const validated = UserSchema.parse(user);
    if (validated.email) {
      // unique constraint placeholder: single-user local store already unique
    }
    await AsyncStorage.setItem(KEYS.user, JSON.stringify(validated));
  }

  async deleteUser(hard: boolean = false): Promise<void> {
    if (hard) {
      await AsyncStorage.removeItem(KEYS.user);
    } else {
      const existing = await this.getUser();
      if (existing) {
        const updated = { ...existing, isDeleted: true, deletedAt: Date.now() } as User;
        await this.upsertUser(updated);
      }
    }
  }

  async getPartners(): Promise<PartnerProfile[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.partners);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const arr = z.array(PartnerProfileSchema).parse(parsed);
      return arr.filter(p => !p.isDeleted);
    } catch (e) {
      console.error('[LocalStorageAdapter:getPartners] parse error', e);
      return [];
    }
  }

  async upsertPartner(partner: PartnerProfile): Promise<void> {
    const validated = PartnerProfileSchema.parse(partner);
    const list = await this.getPartners();
    const updated = uniqueById([...list, validated]);
    await AsyncStorage.setItem(KEYS.partners, JSON.stringify(updated));
  }

  async softDeletePartner(id: string): Promise<void> {
    const listRaw = await AsyncStorage.getItem(KEYS.partners);
    const list = listRaw ? z.array(PartnerProfileSchema).parse(JSON.parse(listRaw)) : [];
    const updated = list.map(p => p.id === id ? { ...p, isDeleted: true, deletedAt: Date.now() } : p);
    await AsyncStorage.setItem(KEYS.partners, JSON.stringify(updated));
  }

  async getRecommendations(): Promise<Recommendation[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.recs);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const recs = z.array(RecommendationSchema).parse(parsed);
      return recs;
    } catch (e) {
      console.error('[LocalStorageAdapter:getRecommendations] parse error', e);
      return [];
    }
  }

  async addRecommendations(recs: Recommendation[]): Promise<void> {
    const validated = z.array(RecommendationSchema).parse(recs);
    const existing = await this.getRecommendations();
    const merged = uniqueById([...validated, ...existing]);
    await AsyncStorage.setItem(KEYS.recs, JSON.stringify(merged));
  }

  async getSession(): Promise<Session | null> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.session);
      if (!raw) return null;
      const session = SessionSchema.parse(JSON.parse(raw));
      return session;
    } catch (e) {
      console.error('[LocalStorageAdapter:getSession] parse error', e);
      return null;
    }
  }

  async upsertSession(session: Session): Promise<void> {
    const existingRaw = await AsyncStorage.getItem(KEYS.session);
    const existing = existingRaw ? SessionSchema.partial().parse(JSON.parse(existingRaw)) : {} as Partial<Session>;
    const merged: Session = SessionSchema.parse({ ...existing, ...session, lastActiveAt: Date.now() });
    await AsyncStorage.setItem(KEYS.session, JSON.stringify(merged));
  }

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  }

  async updateDesiredExperiences(exps: string[]): Promise<void> {
    const existing = await this.getSession();
    const merged: Session = SessionSchema.parse({
      id: existing?.id ?? 'session-1',
      createdAt: existing?.createdAt ?? Date.now(),
      lastActiveAt: Date.now(),
      currentPartnerId: existing?.currentPartnerId ?? null,
      selectedPhase: existing?.selectedPhase,
      desiredExperiences: exps as any,
      dateStartISO: existing?.dateStartISO,
    });
    await AsyncStorage.setItem(KEYS.session, JSON.stringify(merged));
  }

  async updateDateStartISO(iso: string): Promise<void> {
    const existing = await this.getSession();
    const merged: Session = SessionSchema.parse({
      id: existing?.id ?? 'session-1',
      createdAt: existing?.createdAt ?? Date.now(),
      lastActiveAt: Date.now(),
      currentPartnerId: existing?.currentPartnerId ?? null,
      selectedPhase: existing?.selectedPhase,
      desiredExperiences: existing?.desiredExperiences ?? [],
      dateStartISO: iso,
    });
    await AsyncStorage.setItem(KEYS.session, JSON.stringify(merged));
  }
}

export const adapter: DataAdapter = new LocalStorageAdapter();

// TODO: SupabaseAdapter implementing DataAdapter with RLS and row-level access by user.id
// - Tables: users, partners, recommendations, sessions
// - Use RLS policies: user_id = auth.uid() to restrict rows per user
// - Unique constraints: users.email unique, partners.id unique, recommendations.id unique
