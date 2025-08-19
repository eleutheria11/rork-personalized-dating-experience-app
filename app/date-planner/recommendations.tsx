import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { adapter } from '@/data';
import { RecommendationSchema, type Recommendation, type Session } from '@/types/schemas';
import { Calendar, Clock, DollarSign, MapPin, Sparkles } from 'lucide-react-native';

function buildStubRecommendations(session: Session | null): Recommendation[] {
  const base = [
    {
      id: 'rec-1',
      title: 'Cozy Italian Dinner',
      description: 'A romantic trattoria with candlelight and fresh pasta.',
      location: 'Downtown',
      estimatedCost: '$$'
      ,bestTime: '7:00 PM',
      tips: 'Ask for a corner table.',
      address: '123 Main St',
      reservationUrl: 'https://example.com/reserve'
    },
    {
      id: 'rec-2',
      title: 'Rooftop Cocktails',
      description: 'Chic lounge with skyline views and live DJ.',
      location: 'Midtown',
      estimatedCost: '$$-$$$'
      ,bestTime: '9:00 PM',
    },
    {
      id: 'rec-3',
      title: 'Sunset Walk in the Park',
      description: 'Scenic trail perfect for deep conversation.',
      location: 'City Park',
      estimatedCost: '$'
      ,bestTime: '6:30 PM',
      tips: 'Bring a light jacket.'
    }
  ];
  try { RecommendationSchema.array().parse(base); } catch {}
  return base;
}

export default function RecommendationsScreen() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const s = await adapter.getSession();
      if (!mounted) return;
      setSession(s);
      const list = buildStubRecommendations(s);
      setRecs(list);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const onUse = useCallback(async (rec: Recommendation) => {
    await adapter.addRecommendations([rec]);
  }, []);

  return (
    <View style={styles.container} testID="recs-screen">
      <LinearGradient colors={["#FFFFFF", "#FFF0F5"]} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Recommendations</Text>
        <Text style={styles.subtitle}>Based on your picks{session?.desiredExperiences && session.desiredExperiences.length > 0 ? `: ${session.desiredExperiences.join(', ')}` : ''}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#E91E63" />
        ) : (
          <View style={styles.list}>
            {recs.map((rec) => (
              <TouchableOpacity key={rec.id} style={styles.card} activeOpacity={0.85} testID={`rec-${rec.id}`}>
                <LinearGradient colors={["#E91E63", "#F06292"]} style={styles.cardGradient}>
                  <Text style={styles.cardTitle}>{rec.title}</Text>
                  <Text style={styles.cardDesc}>{rec.description}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}><MapPin size={14} color="#fff" /><Text style={styles.metaText}>{rec.location}</Text></View>
                    <View style={styles.metaItem}><DollarSign size={14} color="#fff" /><Text style={styles.metaText}>{rec.estimatedCost}</Text></View>
                    <View style={styles.metaItem}><Clock size={14} color="#fff" /><Text style={styles.metaText}>{rec.bestTime}</Text></View>
                  </View>
                  <TouchableOpacity style={styles.useBtn} onPress={() => onUse(rec)} testID={`use-${rec.id}`}>
                    <Sparkles size={18} color="#E91E63" />
                    <Text style={styles.useText}>Use this</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#222', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 14 },
  list: { gap: 14 },
  card: { borderRadius: 18, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  cardGradient: { padding: 16 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  cardDesc: { color: '#fff', opacity: 0.95, marginBottom: 10 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#fff' },
  useBtn: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, alignSelf: 'flex-start', flexDirection: 'row', gap: 8 },
  useText: { color: '#E91E63', fontWeight: '700' },
});
