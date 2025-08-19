import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "@/types/types";
import { adapter } from "@/services/db";
import { z } from "zod";

const UserProfileZ = z.object({
  name: z.string().min(1),
  age: z.string().min(1),
  gender: z.string().min(1),
  country: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().optional().default(""),
  budget: z.string().min(1),
  likes: z.array(z.string()).default([]),
  dislikes: z.array(z.string()).default([]),
});

type Ctx = {
  profile: UserProfile | null;
  isLoading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearProfile: () => Promise<void>;
  deleteMyData: () => Promise<void>;
  isProfileComplete: () => boolean;
};

export const [UserProfileProvider, useUserProfile] = createContextHook<Ctx>(() => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    void loadProfile();
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const user = await adapter.getUser();
      if (user) {
        const ui: UserProfile = {
          name: user.name,
          age: String(user.age ?? ""),
          gender: user.gender,
          country: (user as any).preferences?.country ?? (user as any).country ?? "",
          city: user.preferences.city,
          zipCode: user.preferences.zipCode ?? "",
          budget: user.preferences.budget,
          likes: user.preferences.likes ?? [],
          dislikes: user.preferences.dislikes ?? [],
        } as UserProfile;
        const validated = UserProfileZ.parse(ui);
        setProfile(validated);
      } else {
        const legacyRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('userProfile') : null;
        if (legacyRaw) {
          try {
            const parsed = JSON.parse(legacyRaw) as unknown;
            const validated = UserProfileZ.parse(parsed);
            setProfile(validated);
          } catch (e) {
            console.log('[UserProfile] legacy parse failed', e);
          }
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    const next = { ...(profile ?? {
      name: "",
      age: "",
      gender: "",
      country: "",
      city: "",
      zipCode: "",
      budget: "",
      likes: [],
      dislikes: [],
    }), ...data } as UserProfile;
    const validated = UserProfileZ.parse(next);
    setProfile(validated);

    const user = {
      id: 'user-1',
      name: validated.name,
      age: validated.age,
      gender: validated.gender,
      preferences: {
        country: validated.country,
        city: validated.city,
        zipCode: validated.zipCode ?? "",
        budget: validated.budget,
        likes: validated.likes,
        dislikes: validated.dislikes,
      },
      isDeleted: false,
      deletedAt: null,
    } as const;
    await adapter.upsertUser(user as any);
  }, [profile]);

  const clearProfile = useCallback(async () => {
    setProfile(null);
    await adapter.deleteUser(false);
  }, []);

  const deleteMyData = useCallback(async () => {
    setProfile(null);
    await adapter.clearAll();
  }, []);

  const isProfileComplete = useCallback(() => {
    return !!(
      profile?.name &&
      profile?.age &&
      profile?.gender &&
      profile?.country &&
      profile?.city &&
      (profile?.likes?.length ?? 0) > 0
    );
  }, [profile]);

  return {
    profile,
    isLoading,
    updateProfile,
    clearProfile,
    deleteMyData,
    isProfileComplete,
  };
});