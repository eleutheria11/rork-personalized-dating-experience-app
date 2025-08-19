import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useRootNavigationState } from "expo-router";
import { usePartners } from "@/contexts/PartnersContext";
import { User, Plus, Star, MapPin, Heart } from "lucide-react-native";
import { useTranslation } from 'react-i18next';

export default function PartnersScreen() {
  const { partners, currentPartner, setCurrentPartner } = usePartners();
  const navState = useRootNavigationState();
  const { t } = useTranslation();

  const handleSelectPartner = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    if (partner) {
      setCurrentPartner(partner);
    }
  };

  const handleAddPartner = () => {
    if (!navState?.key) {
      console.log('[Partners] Navigation not ready yet');
      return;
    }
    router.push("/partner-setup" as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#FFFFFF", "#FFF0F5"]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('tabs.partners')}</Text>
          <Text style={styles.subtitle}>
            {t('home.letsPlan')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPartner}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#E91E63", "#F06292"]}
            style={styles.addGradient}
          >
            <Plus size={24} color="#fff" />
            <Text style={styles.addText}>{t('home.addPartner')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.partnersList}>
          {partners.length === 0 ? (
            <View style={styles.emptyState}>
              <Heart size={48} color="#E91E63" />
              <Text style={styles.emptyTitle}>{t('profile.myInterests')}</Text>
              <Text style={styles.emptyText}>
                {t('home.addPartner')}
              </Text>
            </View>
          ) : (
            partners.map((partner) => (
              <TouchableOpacity
                key={partner.id}
                style={[
                  styles.partnerCard,
                  currentPartner?.id === partner.id && styles.selectedCard,
                ]}
                onPress={() => handleSelectPartner(partner.id)}
                activeOpacity={0.8}
              >
                <View style={styles.partnerHeader}>
                  <View style={styles.avatarContainer}>
                    <LinearGradient
                      colors={["#E91E63", "#F06292"]}
                      style={styles.avatar}
                    >
                      <User size={24} color="#fff" />
                    </LinearGradient>
                  </View>
                  <View style={styles.partnerInfo}>
                    <Text style={styles.partnerName}>{partner.name}</Text>
                    <Text style={styles.partnerAge}>Age {partner.age}</Text>
                  </View>
                  {currentPartner?.id === partner.id && (
                    <View style={styles.selectedBadge}>
                      <Star size={16} color="#E91E63" fill="#E91E63" />
                      <Text style={styles.selectedText}>Active</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.partnerDetails}>
                  <View style={styles.detailRow}>
                    <MapPin size={14} color="#666" />
                    <Text style={styles.detailText}>
                      {partner.description || "No description"}
                    </Text>
                  </View>
                  <View style={styles.likesContainer}>
                    <Text style={styles.likesLabel}>Top Likes:</Text>
                    <View style={styles.likesList}>
                      {partner.likes?.slice(0, 3).map((like, index) => (
                        <View key={index} style={styles.likeTag}>
                          <Text style={styles.likeText}>{like}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  addButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    gap: 10,
  },
  addText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  partnersList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  partnerCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: "#E91E63",
  },
  partnerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 3,
  },
  partnerAge: {
    fontSize: 14,
    color: "#666",
  },
  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  selectedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#E91E63",
  },
  partnerDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  likesContainer: {
    marginTop: 5,
  },
  likesLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  likesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  likeTag: {
    backgroundColor: "#FFF0F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  likeText: {
    fontSize: 12,
    color: "#E91E63",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});