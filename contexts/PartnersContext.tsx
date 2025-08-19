import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback } from "react";
import { adapter } from "@/services/db";
import { z } from "zod";
import { PartnerProfileSchema, type PartnerProfile } from "@/types/schemas";

export const [PartnersProvider, usePartners] = createContextHook(() => {
  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [currentPartner, setCurrentPartner] = useState<PartnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadPartners = useCallback(async () => {
    try {
      const list = await adapter.getPartners();
      setPartners(list);
      const session = await adapter.getSession();
      if (session && list.length > 0) {
        setCurrentPartner(list[0]);
      }
    } catch (error) {
      console.error("Error loading partners:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPartners();
  }, [loadPartners]);

  const addPartner = useCallback(async (partner: PartnerProfile) => {
    const validated = PartnerProfileSchema.parse(partner);
    await adapter.upsertPartner(validated);
    const list = await adapter.getPartners();
    setPartners(list);
  }, []);

  const updatePartner = useCallback(async (id: string, data: Partial<PartnerProfile>) => {
    const existing = partners.find(p => p.id === id);
    if (!existing) return;
    const next = PartnerProfileSchema.parse({ ...existing, ...data });
    await adapter.upsertPartner(next);
    const list = await adapter.getPartners();
    setPartners(list);
  }, [partners]);

  const deletePartner = useCallback(async (id: string) => {
    await adapter.softDeletePartner(id);
    const list = await adapter.getPartners();
    setPartners(list);
    if (currentPartner?.id === id) {
      setCurrentPartner(null);
    }
  }, [currentPartner]);

  const setCurrentPartnerWithStorage = useCallback(async (partner: PartnerProfile | null) => {
    setCurrentPartner(partner);
  }, []);

  return {
    partners,
    currentPartner,
    isLoading,
    addPartner,
    updatePartner,
    deletePartner,
    setCurrentPartner: setCurrentPartnerWithStorage,
  };
});