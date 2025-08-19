import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { PartnersProvider } from "@/contexts/PartnersContext";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
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
          title: "Partner Profile",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="date-details" 
        options={{ 
          title: "Date Details",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="booking-assistant" 
        options={{ 
          title: "Booking Assistant",
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