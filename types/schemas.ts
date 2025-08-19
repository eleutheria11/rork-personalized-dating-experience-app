import { z } from 'zod';

export const RelationshipPhaseSchema = z.enum([
  'beginning',
  'courting',
  'exclusive',
  'casual',
  'patching',
]);
export type RelationshipPhase = z.infer<typeof RelationshipPhaseSchema>;

export const PreferencesSchema = z.object({
  country: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(1),
  budget: z.string().min(1),
  likes: z.array(z.string()).default([]),
  dislikes: z.array(z.string()).default([]),
});
export type Preferences = z.infer<typeof PreferencesSchema>;

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  age: z.union([z.string(), z.number()]),
  gender: z.string().min(1),
  email: z.string().email().optional(),
  preferences: PreferencesSchema,
  isDeleted: z.boolean().default(false),
  deletedAt: z.number().nullable().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const PartnerProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  age: z.union([z.string(), z.number()]).optional(),
  description: z.string().optional().default(''),
  likes: z.array(z.string()).default([]),
  socialProfiles: z.string().url().optional(),
  relationshipPhase: RelationshipPhaseSchema.optional(),
  isDeleted: z.boolean().default(false),
  deletedAt: z.number().nullable().optional(),
});
export type PartnerProfile = z.infer<typeof PartnerProfileSchema>;

export const RecommendationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  estimatedCost: z.string().min(1),
  bestTime: z.string().min(1),
  tips: z.string().optional(),
  address: z.string().optional(),
  reservationUrl: z.string().url().optional(),
});
export type Recommendation = z.infer<typeof RecommendationSchema>;

export const DateExperienceSchema = z.enum([
  'Romantic',
  'Fun Night',
  'Deep Talk',
  'Impress',
  'Surprise Me',
  'Outdoors',
  'Low-key',
]);
export type DateExperience = z.infer<typeof DateExperienceSchema>;

export const SessionSchema = z.object({
  id: z.string().min(1),
  createdAt: z.number(),
  lastActiveAt: z.number(),
  currentPartnerId: z.string().optional().nullable(),
  selectedPhase: RelationshipPhaseSchema.optional(),
  desiredExperiences: z.array(DateExperienceSchema).optional().default([]),
  dateStartISO: z.string().datetime().optional(),
});
export type Session = z.infer<typeof SessionSchema>;
