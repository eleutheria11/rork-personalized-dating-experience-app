import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { PartnersProvider } from "@/contexts/PartnersContext";
import { trpc, trpcClient } from "@/lib/trpc";
import '@/lib/i18n';
import { useTranslation } from 'react-i18next';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { t } = useTranslation();
  return (
    <Stack screenOptions={{ headerBackTitle: t('common.back') }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="onboarding" 
        options={{ 
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom"
        }} 
      />
      <Stack.Screen 
        name="partner-setup" 
        options={{ 
          title: t('profile.editProfile'),
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="date-details" 
        options={{ 
          title: t('planner.recommendations'),
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="booking-assistant" 
        options={{ 
          title: t('guide.title'),
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="date-feedback" 
        options={{ 
          title: "Date Feedback",
          presentation: "modal"
        }} 
      />
      <Stack.Screen name="date-planner/experience" options={{ title: t('planner.experienceTitle') }} />
      <Stack.Screen name="date-planner/time" options={{ title: t('planner.timeTitle') }} />
      <Stack.Screen name="date-planner/recommendations" options={{ title: t('planner.recommendations') }} />
      <Stack.Screen name="date-planner/itinerary" options={{ title: "Itinerary" }} />
      <Stack.Screen name="settings/legal" options={{ title: t('settings.legalAndSafety') }} />
      <Stack.Screen name="settings/support" options={{ title: t('settings.support') }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <UserProfileProvider>
            <PartnersProvider>
              <RootLayoutNav />
            </PartnersProvider>
          </UserProfileProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}