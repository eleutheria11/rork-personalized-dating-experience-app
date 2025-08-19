import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { 
  User, 
  MapPin, 
  DollarSign, 
  Heart, 
  ThumbsDown,
  Edit,
  CreditCard,
  Lock,
  LogOut,
  Shield,
  FileText,
  HelpCircle,
  Mail
} from "lucide-react-native";

export default function ProfileScreen() {
  const { profile, deleteMyData } = useUserProfile();

  const handleEditProfile = () => {
    router.push("/onboarding" as any);
  };

  const handleDeleteData = () => {
    Alert.alert(
      "Delete My Data",
      "This will permanently delete all local data on this device. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteMyData();
            router.replace("/onboarding" as any);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#FFFFFF", "#FFF0F5"]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LinearGradient
            colors={["#E91E63", "#F06292"]}
            style={styles.profileGradient}
          >
            <View style={styles.avatarContainer}>
              <User size={48} color="#fff" />
            </View>
            <Text style={styles.name}>{profile?.name || "User"}</Text>
            <Text style={styles.info}>
              {profile?.age} years • {profile?.gender}
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Budget</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MapPin size={20} color="#E91E63" />
              <Text style={styles.infoText}>
                {profile?.city}, {profile?.zipCode} • {profile?.country}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <DollarSign size={20} color="#E91E63" />
              <Text style={styles.infoText}>
                {profile?.budget || "Medium"} Budget
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Interests</Text>
          <View style={styles.interestsCard}>
            <View style={styles.interestSection}>
              <View style={styles.interestHeader}>
                <Heart size={18} color="#4CAF50" />
                <Text style={styles.interestLabel}>Likes</Text>
              </View>
              <View style={styles.tagsList}>
                {profile?.likes?.map((like, index) => (
                  <View key={index} style={[styles.tag, styles.likeTag]}>
                    <Text style={styles.likeTagText}>{like}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.interestSection}>
              <View style={styles.interestHeader}>
                <ThumbsDown size={18} color="#F44336" />
                <Text style={styles.interestLabel}>Dislikes</Text>
              </View>
              <View style={styles.tagsList}>
                {profile?.dislikes?.map((dislike, index) => (
                  <View key={index} style={[styles.tag, styles.dislikeTag]}>
                    <Text style={styles.dislikeTagText}>{dislike}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleEditProfile}
            activeOpacity={0.7}
          >
            <Edit size={20} color="#666" />
            <Text style={styles.settingText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.settingItem}
            activeOpacity={0.7}
            onPress={() => router.push('/settings/legal' as any)}
          >
            <Shield size={20} color="#666" />
            <Text style={styles.settingText}>Legal & Safety</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            activeOpacity={0.7}
            onPress={() => router.push('/settings/support' as any)}
          >
            <HelpCircle size={20} color="#666" />
            <Text style={styles.settingText}>Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            activeOpacity={0.7}
          >
            <CreditCard size={20} color="#666" />
            <Text style={styles.settingText}>Payment Methods</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.settingItem}
            activeOpacity={0.7}
          >
            <Lock size={20} color="#666" />
            <Text style={styles.settingText}>Saved Passwords</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            testID="delete-my-data"
            style={[styles.settingItem, styles.logoutItem]}
            onPress={handleDeleteData}
            activeOpacity={0.7}
          >
            <LogOut size={20} color="#F44336" />
            <Text style={[styles.settingText, styles.logoutText]}>Delete My Data</Text>
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
    marginBottom: 20,
  },
  profileGradient: {
    paddingTop: Platform.OS === "android" ? 60 : 40,
    paddingBottom: 30,
    alignItems: "center",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  info: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 15,
  },
  interestsCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  interestSection: {
    gap: 10,
  },
  interestHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  interestLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  likeTag: {
    backgroundColor: "#E8F5E9",
  },
  likeTagText: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "500",
  },
  dislikeTag: {
    backgroundColor: "#FFEBEE",
  },
  dislikeTagText: {
    fontSize: 13,
    color: "#F44336",
    fontWeight: "500",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  settingText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  logoutItem: {
    marginTop: 10,
  },
  logoutText: {
    color: "#F44336",
  },
});