import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { type Recommendation } from '@/types/schemas';

function parseItems(param: string | string[] | undefined): Recommendation[] {
  try {
    const raw = typeof param === 'string' ? decodeURIComponent(param) : Array.isArray(param) ? decodeURIComponent(param[0] ?? '') : '';
    if (!raw) return [];
    const arr = JSON.parse(raw) as Recommendation[];
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.log('[itinerary] parse error', e);
    return [];
  }
}

function planItinerary(items: Recommendation[], startISO?: string) {
  const start = startISO ? new Date(startISO) : new Date();
  const slotMinutes = 75;
  const travelGap = 15;
  let cursor = new Date(start);
  return items.map((it, idx) => {
    const begin = new Date(cursor);
    const end = new Date(begin.getTime() + slotMinutes * 60000);
    cursor = new Date(end.getTime() + travelGap * 60000);
    return {
      id: it.id,
      title: it.title,
      start: begin,
      end,
      checklist: [
        'Confirm reservation if needed',
        'Plan travel between spots',
        'Bring essentials (wallet, keys, etc.)',
      ],
    };
  });
}

export default function ItineraryScreen() {
  const { items } = useLocalSearchParams();
  const recs = useMemo(() => parseItems(items), [items]);
  const plan = useMemo(() => planItinerary(recs), [recs]);

  return (
    <View style={styles.container} testID="itinerary-screen">
      <LinearGradient colors={["#FFFFFF", "#FFF0F5"]} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Your Itinerary</Text>
        {plan.map((p) => (
          <View key={p.id} style={styles.block}>
            <Text style={styles.blockTime}>
              {p.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {p.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.blockTitle}>{p.title}</Text>
            <View style={styles.checklist}>
              {p.checklist.map((c, i) => (
                <Text key={i} style={styles.checkItem}>• {c}</Text>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#222', marginBottom: 12 },
  block: { backgroundColor: '#FDF2F8', borderRadius: 16, padding: 14, marginBottom: 12 },
  blockTime: { color: '#9D174D', fontWeight: '700' },
  blockTitle: { color: '#111', fontSize: 16, fontWeight: '700', marginTop: 4, marginBottom: 8 },
  checklist: { gap: 4 },
  checkItem: { color: '#374151' },
});
