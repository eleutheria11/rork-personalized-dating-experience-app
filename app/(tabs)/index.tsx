import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { usePartners } from "@/contexts/PartnersContext";
import { Heart, Gift, MessageCircle, Sparkles, Plus, MapPin, DollarSign } from "lucide-react-native";
import { RelationshipPhase } from "@/types/types";

const { width } = Dimensions.get("window");

const RELATIONSHIP_PHASES: Array<{
  id: RelationshipPhase;
  title: string;
  subtitle: string;
  icon: any;
  gradient: readonly [string, string];
}> = [
  {
    id: "beginning",
    title: "Beginning",
    subtitle: "1-3 dates",
    icon: Sparkles,
    gradient: ["#FF6B6B", "#FF8E53"] as const,
  },
  {
    id: "courtship",
    title: "Courtship",
    subtitle: "3-15 dates",
    icon: Heart,
    gradient: ["#E91E63", "#F06292"] as const,
  },
  {
    id: "dating",
    title: "Dating",
    subtitle: "15+ dates",
    icon: Gift,
    gradient: ["#9C27B0", "#BA68C8"] as const,
  },
  {
    id: "reconciliation",
    title: "Reconciliation",
    subtitle: "Making up",
    icon: MessageCircle,
    gradient: ["#3F51B5", "#7986CB"] as const,
  },
];

export default function DiscoverScreen() {
  const { profile, isProfileComplete } = useUserProfile();
  const { partners, currentPartner } = usePartners();
  const [selectedPhase, setSelectedPhase] = useState<RelationshipPhase>("beginning");

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        if (!isProfileComplete()) {
          console.log("DiscoverScreen: redirecting to onboarding");
          router.replace("/onboarding" as any);
        }
      } catch (e) {
        console.log("DiscoverScreen: Redirect check failed", e);
      }
    }, 0);
    return () => clearTimeout(id);
  }, [isProfileComplete]);

  const handlePhaseSelect = (phase: RelationshipPhase) => {
    setSelectedPhase(phase);
    if (!currentPartner) {
      router.push("/partner-setup" as any);
    } else {
      router.push({
        pathname: "/date-details" as any,
        params: { phase },
      } as never);
    }
  };

  const handleAddPartner = () => {
    router.push("/partner-setup" as any);
  };

  return (
    <SafeAreaView style={styles.container} testID="discover-screen">
      <LinearGradient
        colors={["#FFFFFF", "#FFF0F5"]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello, {profile?.name || "there"}! 💕
          </Text>
          <Text style={styles.subtitle}>
            Let's plan something special
          </Text>
        </View>

        {currentPartner && (
          <View style={styles.currentPartnerCard}>
            <LinearGradient
              colors={["#E91E63", "#F06292"]}
              style={styles.partnerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.partnerInfo}>
                <Text style={styles.partnerLabel}>Planning for</Text>
                <Text style={styles.partnerName}>{currentPartner.name}</Text>
                <View style={styles.partnerDetails}>
                  <View style={styles.detailItem}>
                    <MapPin size={14} color="#fff" />
                    <Text style={styles.detailText}>
                      {profile?.city}, {profile?.state} {profile?.zipCode ? `• ${profile?.zipCode}` : ""}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <DollarSign size={14} color="#fff" />
                    <Text style={styles.detailText}>
                      {profile?.budget || "Medium"} Budget
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        <View style={styles.phasesSection}>
          <Text style={styles.sectionTitle}>Choose Relationship Phase</Text>
          <View style={styles.phasesGrid}>
            {RELATIONSHIP_PHASES.map((phase) => {
              const Icon = phase.icon;
              return (
                <TouchableOpacity
                  key={phase.id}
                  style={styles.phaseCard}
                  onPress={() => handlePhaseSelect(phase.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={phase.gradient}
                    style={styles.phaseGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Icon size={32} color="#fff" />
                    <Text style={styles.phaseTitle}>{phase.title}</Text>
                    <Text style={styles.phaseSubtitle}>{phase.subtitle}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {!currentPartner && (
          <TouchableOpacity
            style={styles.addPartnerButton}
            onPress={handleAddPartner}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#4CAF50", "#66BB6A"]}
              style={styles.addPartnerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Plus size={24} color="#fff" />
              <Text style={styles.addPartnerText}>Add Partner Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/booking-assistant" as any)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#2196F3", "#64B5F6"]}
              style={styles.actionGradient}
            >
              <Sparkles size={24} color="#fff" />
              <Text style={styles.actionText}>AI Booking Assistant</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === "android" ? 40 : 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  currentPartnerCard: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  partnerGradient: {
    padding: 20,
  },
  partnerInfo: {
    alignItems: "center",
  },
  partnerLabel: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 5,
  },
  partnerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  partnerDetails: {
    flexDirection: "row",
    gap: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  detailText: {
    fontSize: 14,
    color: "#fff",
  },
  phasesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  phasesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  phaseCard: {
    width: (width - 55) / 2,
    height: 140,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  phaseGradient: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  phaseSubtitle: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
    marginTop: 3,
  },
  addPartnerButton: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addPartnerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    gap: 10,
  },
  addPartnerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionCard: {
    borderRadius: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    gap: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
