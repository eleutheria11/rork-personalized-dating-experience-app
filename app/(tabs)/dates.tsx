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
import { Calendar, MapPin, DollarSign, Clock, Heart } from "lucide-react-native";
import { useTranslation } from 'react-i18next';

export default function DatesScreen() {
  const { t } = useTranslation();
  const upcomingDates = [
    {
      id: "1",
      title: "Romantic Dinner",
      partner: "Sarah",
      date: "Dec 15, 2024",
      time: "7:00 PM",
      location: "The French Laundry",
      price: "$$",
      phase: "courtship",
    },
    {
      id: "2",
      title: "Wine Tasting",
      partner: "Sarah",
      date: "Dec 20, 2024",
      time: "2:00 PM",
      location: "Napa Valley",
      price: "$",
      phase: "dating",
    },
  ];

  const pastDates = [
    {
      id: "3",
      title: "Coffee Date",
      partner: "Sarah",
      date: "Dec 10, 2024",
      time: "10:00 AM",
      location: "Blue Bottle Coffee",
      price: "$",
      phase: "beginning",
      rating: 5,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#FFFFFF", "#FFF0F5"]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('dates.title')}</Text>
          <Text style={styles.subtitle}>
            {t('dates.subtitle')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dates.upcoming')}</Text>
          {upcomingDates.map((date) => (
            <TouchableOpacity
              key={date.id}
              style={styles.dateCard}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#E91E63", "#F06292"]}
                style={styles.dateGradient}
              >
                <View style={styles.dateHeader}>
                  <Text style={styles.dateTitle}>{date.title}</Text>
                  <Text style={styles.datePartner}>with {date.partner}</Text>
                </View>
                
                <View style={styles.dateDetails}>
                  <View style={styles.detailItem}>
                    <Calendar size={14} color="#fff" />
                    <Text style={styles.detailText}>{date.date}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Clock size={14} color="#fff" />
                    <Text style={styles.detailText}>{date.time}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MapPin size={14} color="#fff" />
                    <Text style={styles.detailText}>{date.location}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <DollarSign size={14} color="#fff" />
                    <Text style={styles.detailText}>{date.price}</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dates.past')}</Text>
          {pastDates.map((date) => (
            <View key={date.id} style={styles.pastDateCard}>
              <View style={styles.pastDateHeader}>
                <View>
                  <Text style={styles.pastDateTitle}>{date.title}</Text>
                  <Text style={styles.pastDatePartner}>with {date.partner}</Text>
                </View>
                <View style={styles.ratingContainer}>
                  {[...Array(5)].map((_, i) => (
                    <Heart
                      key={i}
                      size={16}
                      color="#E91E63"
                      fill={i < date.rating ? "#E91E63" : "transparent"}
                    />
                  ))}
                </View>
              </View>
              
              <View style={styles.pastDateDetails}>
                <Text style={styles.pastDetailText}>
                  {date.date} • {date.location}
                </Text>
              </View>
            </View>
          ))}
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  dateCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dateGradient: {
    padding: 20,
  },
  dateHeader: {
    marginBottom: 15,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 3,
  },
  datePartner: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  dateDetails: {
    gap: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#fff",
  },
  pastDateCard: {
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
  pastDateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  pastDateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 3,
  },
  pastDatePartner: {
    fontSize: 14,
    color: "#666",
  },
  pastDateDetails: {
    marginTop: 5,
  },
  pastDetailText: {
    fontSize: 13,
    color: "#999",
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 3,
  },
});