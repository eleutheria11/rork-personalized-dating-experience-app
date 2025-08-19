import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { usePartners } from "@/contexts/PartnersContext";
import { useMutation } from "@tanstack/react-query";
import { 
  X, 
  Target, 
  MapPin, 
  DollarSign,
  Calendar,
  Sparkles,
  Heart,
  MessageCircle,
  PartyPopper
} from "lucide-react-native";
import { DateGoal } from "@/types/types";

const GOALS: Array<{ id: DateGoal; title: string; icon: any; description: string }> = [
  { id: "impress", title: "Impress", icon: Sparkles, description: "Make a lasting impression" },
  { id: "fun", title: "Fun Night", icon: PartyPopper, description: "Have a great time together" },
  { id: "conversation", title: "Deep Talk", icon: MessageCircle, description: "Important conversation" },
  { id: "random", title: "Surprise Me", icon: Heart, description: "Random adventure" },
];

export default function DateDetailsScreen() {
  const { phase } = useLocalSearchParams();
  const { profile } = useUserProfile();
  const { currentPartner } = usePartners();
  const [selectedGoal, setSelectedGoal] = useState<DateGoal>("impress");
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [errorText, setErrorText] = useState<string | null>(null);

  const generateRecommendations = useMutation({
    mutationFn: async () => {
      setErrorText(null);
      const prompt = `Generate 6 specific, real and bookable venue recommendations (only restaurants, bars, cafes, or activities with a physical address).
        - Relationship phase: ${String(phase ?? "")}
        - Goal: ${selectedGoal}
        - Location: ${profile?.city ?? ""}, ${profile?.state ?? ""} ${profile?.zipCode ?? ""}
        - Budget: ${profile?.budget ?? ""}
        - User likes: ${(profile?.likes ?? []).slice(0, 3).join(", ")}
        - Partner name: ${currentPartner?.name ?? ""}
        - Partner likes: ${(currentPartner?.likes ?? []).slice(0, 3).join(", ")}
        
        For each item include: real venue name, neighborhood, full street address, estimated price level (use $, $, $$), and the best time to go. Prefer options that accept reservations.
        Include a direct reservationUrl if possible (OpenTable, Resy, SevenRooms, or venue website). If unknown, leave reservationUrl empty.
        Return ONLY a valid JSON array with objects: { title, description, location, address, estimatedCost, bestTime, tips, reservationUrl }`;

      console.log("DateDetails: generating with prompt", prompt);
      const response = await fetch("https://toolkit.rork.com/text/llm/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are a dating expert. Return ONLY valid JSON. No prose." },
            { role: "user", content: prompt }
          ]
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.log("DateDetails: LLM HTTP error", response.status, text);
        throw new Error(`Server error ${response.status}`);
      }

      const data = await response.json();
      const completion: unknown = (data as any)?.completion;
      console.log("DateDetails: raw completion", completion);

      const extractJsonArray = (input: string): any[] => {
        try {
          const trimmed = input.trim();
          if (trimmed.startsWith("[")) {
            return JSON.parse(trimmed);
          }
        } catch (e) {}
        const match = input.match(/\[[\s\S]*\]/);
        if (match) {
          try { return JSON.parse(match[0]); } catch {}
        }
        return [];
      };

      if (typeof completion === "string") {
        const arr = extractJsonArray(completion);
        if (!Array.isArray(arr) || arr.length === 0) {
          throw new Error("AI returned unexpected format");
        }
        return arr;
      }
      throw new Error("Empty AI response");
    },
    onSuccess: (data) => {
      console.log("DateDetails: parsed recommendations", data);
      setRecommendations(data);
    },
    onError: (err: unknown) => {
      console.log("DateDetails: generation failed", err);
      setErrorText("Couldn’t get AI recommendations. Please try again.");
    },
  });

  const handleGenerate = () => {
    generateRecommendations.mutate();
  };

  const handleSelectDate = (date: any) => {
    router.push({
      pathname: "/booking-assistant" as any,
      params: { dateDetails: JSON.stringify(date) },
    } as never);
  };

  return (
    <SafeAreaView style={styles.container} testID="date-details-screen">
      <LinearGradient
        colors={["#FFFFFF", "#FFF0F5"]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <X size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Plan Your Date</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Heart size={18} color="#E91E63" />
              <Text style={styles.infoText}>
                {currentPartner?.name} • {phase} phase
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={18} color="#E91E63" />
              <Text style={styles.infoText}>
                {profile?.city}, {profile?.state} {profile?.zipCode ? `• ${profile?.zipCode}` : ""}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <DollarSign size={18} color="#E91E63" />
              <Text style={styles.infoText}>
                {profile?.budget} budget
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's your goal?</Text>
            <View style={styles.goalsGrid}>
              {GOALS.map((goal) => {
                const Icon = goal.icon;
                return (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalCard,
                      selectedGoal === goal.id && styles.selectedGoal,
                    ]}
                    onPress={() => setSelectedGoal(goal.id)}
                    activeOpacity={0.7}
                  >
                    <Icon 
                      size={24} 
                      color={selectedGoal === goal.id ? "#E91E63" : "#666"} 
                    />
                    <Text style={[
                      styles.goalTitle,
                      selectedGoal === goal.id && styles.selectedGoalTitle,
                    ]}>
                      {goal.title}
                    </Text>
                    <Text style={styles.goalDescription}>
                      {goal.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerate}
            activeOpacity={0.8}
            disabled={generateRecommendations.isPending}
            testID="get-ai-recommendations"
          >
            <LinearGradient
              colors={["#E91E63", "#F06292"]}
              style={styles.generateGradient}
            >
              {generateRecommendations.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Sparkles size={20} color="#fff" />
                  <Text style={styles.generateText}>Get AI Recommendations</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {errorText && (
            <View style={styles.section}>
              <Text style={styles.errorText}>{errorText}</Text>
            </View>
          )}

          {recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Perfect Dates for You</Text>
              {recommendations.map((rec, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recommendationCard}
                  onPress={() => handleSelectDate(rec)}
                  activeOpacity={0.8}
                  testID={`recommendation-${index}`}
                >
                  <Text style={styles.recTitle}>{rec.title}</Text>
                  <Text style={styles.recDescription}>{rec.description}</Text>
                  <View style={styles.recDetails}>
                    <View style={styles.recDetail}>
                      <MapPin size={14} color="#666" />
                      <Text style={styles.recDetailText}>{rec.location}{rec.address ? ` • ${rec.address}` : ""}</Text>
                    </View>
                    <View style={styles.recDetail}>
                      <DollarSign size={14} color="#666" />
                      <Text style={styles.recDetailText}>{rec.estimatedCost}</Text>
                    </View>
                    <View style={styles.recDetail}>
                      <Calendar size={14} color="#666" />
                      <Text style={styles.recDetailText}>{rec.bestTime}</Text>
                    </View>
                  </View>
                  {rec.tips && (
                    <View style={styles.tipsContainer}>
                      <Text style={styles.tipsLabel}>Pro tip:</Text>
                      <Text style={styles.tipsText}>{rec.tips}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: Platform.OS === "android" ? 40 : 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  goalCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  selectedGoal: {
    borderColor: "#E91E63",
    backgroundColor: "#FFF0F5",
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
    marginBottom: 4,
  },
  selectedGoalTitle: {
    color: "#E91E63",
  },
  goalDescription: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
  },
  generateButton: {
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 30,
  },
  generateGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  generateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  recommendationCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  recTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  recDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    lineHeight: 20,
  },
  recDetails: {
    gap: 10,
  },
  recDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recDetailText: {
    fontSize: 13,
    color: "#666",
  },
  tipsContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#FFF9E6",
    borderRadius: 10,
  },
  tipsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F9A825",
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    backgroundColor: "#FFEBEE",
    borderRadius: 10,
    padding: 12,
  },
});