Data Security and Privacy Baseline

Scope
- Local-only storage using AsyncStorage in Expo Go v53
- No external backend enabled by default

Data Collected
- User (minimal PII): id, name, age, gender, optional email
- Preferences: city, state, zipCode, budget, likes, dislikes
- Partner profiles: id, name, optional age, description, likes, optional socialProfiles
- Recommendations: venue suggestions with optional reservation URL
- Session: id, createdAt, lastActiveAt

Retention
- Data persists on device until user deletes it
- Soft-delete flags for users and partners (isDeleted, deletedAt)
- "Delete My Data" performs a hard wipe of all locally stored keys

Security Controls
- Zod runtime validation on all persistence boundaries
- Unique constraints at adapter level for id and email
- Privacy by default: store minimal PII only; email is optional
- No analytics or tracking libraries enabled

How to swap in an external DB (Supabase) with RLS
- Implement DataAdapter in /data as SupabaseAdapter
- Enforce row-level security with policies like: user_id = auth.uid()
- Schema guidelines:
  - users(id PK, email UNIQUE, name, age, gender, preferences JSONB, is_deleted, deleted_at)
  - partners(id PK, user_id FK, UNIQUE(id,user_id), is_deleted, deleted_at)
  - recommendations(id PK, user_id FK)
  - sessions(id PK, user_id FK)
- Client: authenticate user, pass JWT to Supabase client
- Validate all inbound/outbound payloads with the same Zod schemas

Incident Response
- Users can permanently wipe local data from Settings: the app clears AsyncStorage keys and returns to Welcome/Onboarding

Threat Model Notes
- AsyncStorage is not encrypted. Do not store secrets or high-sensitivity PII
- Avoid storing precise locations or tokens
- Consider SecureStore for secrets if needed (mobile only)
