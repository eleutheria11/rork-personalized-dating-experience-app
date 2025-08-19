import React, { useState, useEffect } from "react";
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
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { ChevronRight, ChevronLeft } from "lucide-react-native";
import { INTERESTS_OPTIONS } from "@/constants/interests";

const { width } = Dimensions.get("window");

type OnboardingStep = "welcome" | "basic" | "location" | "likes" | "dislikes" | "complete";

export default function OnboardingScreen() {
  const { profile, updateProfile, isProfileComplete } = useUserProfile();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    age: profile?.age || "",
    gender: profile?.gender || "",
    city: profile?.city || "",
    state: profile?.state || "",
    zipCode: profile?.zipCode || "",
    budget: profile?.budget || "medium",
    likes: profile?.likes || [],
    dislikes: profile?.dislikes || [],
  });

  useEffect(() => {
    if (isProfileComplete() && currentStep === "welcome") {
      setCurrentStep("basic");
    }
  }, []);

  const handleNext = () => {
    const steps: OnboardingStep[] = ["welcome", "basic", "location", "likes", "dislikes", "complete"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: OnboardingStep[] = ["welcome", "basic", "location", "likes", "dislikes", "complete"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleComplete = async () => {
    await updateProfile(formData);
    router.replace("/(tabs)");
  };

  const toggleInterest = (interest: string, type: "likes" | "dislikes") => {
    const current = formData[type];
    if (current.includes(interest)) {
      setFormData({
        ...formData,
        [type]: current.filter((i) => i !== interest),
      });
    } else {
      setFormData({
        ...formData,
        [type]: [...current, interest],
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.welcomeTitle}>Welcome to DateSpark 💕</Text>
            <Text style={styles.welcomeSubtitle}>
              Your AI-powered dating companion
            </Text>
            <Text style={styles.welcomeDescription}>
              Get personalized date recommendations tailored to your relationship phase,
              preferences, and budget.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#E91E63", "#F06292"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Get Started</Text>
                <ChevronRight size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );

      case "basic":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Tell us about yourself</Text>
            <Text style={styles.stepSubtitle}>Basic information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter your name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                placeholder="Enter your age"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderOptions}>
                {["Male", "Female", "Other"].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.optionButton,
                      formData.gender === gender && styles.selectedOption,
                    ]}
                    onPress={() => setFormData({ ...formData, gender })}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.gender === gender && styles.selectedOptionText,
                      ]}
                    >
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <ChevronLeft size={20} color="#E91E63" />
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNext}
                activeOpacity={0.8}
                disabled={!formData.name || !formData.age || !formData.gender}
              >
                <LinearGradient
                  colors={["#E91E63", "#F06292"]}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Next</Text>
                  <ChevronRight size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        );

      case "location":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Location & Budget</Text>
            <Text style={styles.stepSubtitle}>Help us find the best spots</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholder="Enter your city"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={formData.state}
                onChangeText={(text) => setFormData({ ...formData, state: text })}
                placeholder="Enter your state"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Zip Code</Text>
              <TextInput
                style={styles.input}
                value={formData.zipCode}
                onChangeText={(text) => setFormData({ ...formData, zipCode: text })}
                placeholder="Enter your zip"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Budget</Text>
              <View style={styles.budgetOptions}>
                {[
                  { value: "low", label: "Low ($)" },
                  { value: "medium", label: "Medium ($$)" },
                  { value: "high", label: "High ($$$)" },
                ].map((budget) => (
                  <TouchableOpacity
                    key={budget.value}
                    style={[
                      styles.optionButton,
                      formData.budget === budget.value && styles.selectedOption,
                    ]}
                    onPress={() => setFormData({ ...formData, budget: budget.value })}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.budget === budget.value && styles.selectedOptionText,
                      ]}
                    >
                      {budget.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <ChevronLeft size={20} color="#E91E63" />
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNext}
                activeOpacity={0.8}
                disabled={!formData.city || !formData.state || !formData.zipCode}
              >
                <LinearGradient
                  colors={["#E91E63", "#F06292"]}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Next</Text>
                  <ChevronRight size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        );

      case "likes":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What do you enjoy?</Text>
            <Text style={styles.stepSubtitle}>Select your interests (rank by preference)</Text>
            
            <ScrollView style={styles.interestsScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.interestsGrid}>
                {INTERESTS_OPTIONS.map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    style={[
                      styles.interestChip,
                      formData.likes.includes(interest) && styles.selectedInterest,
                    ]}
                    onPress={() => toggleInterest(interest, "likes")}
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
            </ScrollView>

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <ChevronLeft size={20} color="#E91E63" />
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNext}
                activeOpacity={0.8}
                disabled={formData.likes.length === 0}
              >
                <LinearGradient
                  colors={["#E91E63", "#F06292"]}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Next</Text>
                  <ChevronRight size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        );

      case "dislikes":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What to avoid?</Text>
            <Text style={styles.stepSubtitle}>Select things you'd rather skip</Text>
            
            <ScrollView style={styles.interestsScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.interestsGrid}>
                {INTERESTS_OPTIONS.map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    style={[
                      styles.interestChip,
                      formData.dislikes.includes(interest) && styles.dislikedInterest,
                    ]}
                    onPress={() => toggleInterest(interest, "dislikes")}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.interestText,
                        formData.dislikes.includes(interest) && styles.dislikedInterestText,
                      ]}
                    >
                      {interest}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <ChevronLeft size={20} color="#E91E63" />
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#E91E63", "#F06292"]}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Next</Text>
                  <ChevronRight size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        );

      case "complete":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.welcomeTitle}>All Set! 🎉</Text>
            <Text style={styles.welcomeSubtitle}>
              Your profile is ready
            </Text>
            <Text style={styles.welcomeDescription}>
              Let's start planning amazing dates tailored just for you!
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleComplete}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#E91E63", "#F06292"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Start Dating</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
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
        {renderStep()}
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
  stepContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  welcomeDescription: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 50,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
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
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  genderOptions: {
    flexDirection: "row",
    gap: 10,
  },
  budgetOptions: {
    flexDirection: "row",
    gap: 10,
  },
  optionButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedOption: {
    backgroundColor: "#FFF0F5",
    borderColor: "#E91E63",
  },
  optionText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "#E91E63",
  },
  interestsScroll: {
    flex: 1,
    marginBottom: 20,
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
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },
  dislikedInterest: {
    backgroundColor: "#FFEBEE",
    borderColor: "#F44336",
  },
  interestText: {
    fontSize: 14,
    color: "#666",
  },
  selectedInterestText: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  dislikedInterestText: {
    color: "#F44336",
    fontWeight: "500",
  },
  navigationButtons: {
    flexDirection: "row",
    gap: 15,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 25,
    overflow: "hidden",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#E91E63",
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E91E63",
  },
});