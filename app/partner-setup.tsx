import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { usePartners } from "@/contexts/PartnersContext";
import { X, Plus } from "lucide-react-native";
import { INTERESTS_OPTIONS } from "@/constants/interests";

export default function PartnerSetupScreen() {
  const { addPartner, setCurrentPartner } = usePartners();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    description: "",
    likes: [] as string[],
    socialProfiles: "",
  });

  const toggleLike = (interest: string) => {
    if (formData.likes.includes(interest)) {
      setFormData({
        ...formData,
        likes: formData.likes.filter((i) => i !== interest),
      });
    } else {
      setFormData({
        ...formData,
        likes: [...formData.likes, interest],
      });
    }
  };

  const handleSave = () => {
    const partner = {
      id: Date.now().toString(),
      name: formData.name,
      age: formData.age,
      description: formData.description,
      likes: formData.likes,
      socialProfiles: formData.socialProfiles,
    };
    
    addPartner(partner);
    setCurrentPartner(partner);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#FFFFFF", "#FFF0F5"]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <X size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Partner Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Partner's name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                placeholder="Partner's age"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Tell us about your partner..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Their Interests</Text>
              <Text style={styles.sublabel}>Select what they enjoy</Text>
              <View style={styles.interestsGrid}>
                {INTERESTS_OPTIONS.map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    style={[
                      styles.interestChip,
                      formData.likes.includes(interest) && styles.selectedInterest,
                    ]}
                    onPress={() => toggleLike(interest)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.interestText,
                        formData.likes.includes(interest) && styles.selectedInterestText,
                      ]}
                    >
                      {interest}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Social Profiles (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.socialProfiles}
                onChangeText={(text) => setFormData({ ...formData, socialProfiles: text })}
                placeholder="LinkedIn, Instagram, etc."
                placeholderTextColor="#999"
                multiline
                numberOfLines={2}
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={!formData.name || !formData.age}
            >
              <LinearGradient
                colors={["#E91E63", "#F06292"]}
                style={styles.saveGradient}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.saveText}>Save Partner</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
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
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  sublabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  interestChip: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedInterest: {
    backgroundColor: "#FFF0F5",
    borderColor: "#E91E63",
  },
  interestText: {
    fontSize: 14,
    color: "#666",
  },
  selectedInterestText: {
    color: "#E91E63",
    fontWeight: "500",
  },
  saveButton: {
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 20,
  },
  saveGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});