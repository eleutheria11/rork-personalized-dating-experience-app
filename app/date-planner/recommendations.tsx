import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { adapter } from '@/data';
import { RecommendationSchema, type Recommendation, type Session } from '@/types/schemas';
import { Clock, DollarSign, MapPin, Sparkles, RefreshCw, SlidersHorizontal, CheckCircle2, HelpCircle } from 'lucide-react-native';
import { INTERESTS_OPTIONS } from '@/constants/interests';
import { GUIDE_ENABLED } from '@/constants/flags';
import { buildGuide, type GuideFilters } from '@/lib/dateGuide';

type Filters = GuideFilters;

const GOALS: Filters['goal'][] = ['Impress', 'Fun Night', 'Deep Talk', 'Romantic', 'Surprise Me', 'Any'];
const BUDGETS: Filters['budget'][] = ['$', '$$', '$$-$$$', '$$$', 'Any'];

function buildStubRecommendations(session: Session | null, filters: Filters): Recommendation[] {
  const base: Recommendation[] = [
    {
      id: 'rec-1',
      title: 'Cozy Italian Dinner',
      description: 'A romantic trattoria with candlelight and fresh pasta.',
      location: 'Downtown',
      estimatedCost: '$$',
      bestTime: '7:00 PM',
      tips: 'Ask for a corner table.',
      address: '123 Main St',
      reservationUrl: 'https://example.com/reserve'
    },
    {
      id: 'rec-2',
      title: 'Rooftop Cocktails',
      description: 'Chic lounge with skyline views and live DJ.',
      location: 'Midtown',
      estimatedCost: '$$-$$$',
      bestTime: '9:00 PM',
    },
    {
      id: 'rec-3',
      title: 'Sunset Walk in the Park',
      description: 'Scenic trail perfect for deep conversation.',
      location: 'City Park',
      estimatedCost: '$',
      bestTime: '6:30 PM',
      tips: 'Bring a light jacket.'
    },
    {
      id: 'rec-4',
      title: 'Speakeasy Dessert Bar',
      description: 'Secret spot with craft desserts and mocktails.',
      location: 'Old Town',
      estimatedCost: '$$',
      bestTime: '10:00 PM',
    },
    {
      id: 'rec-5',
      title: 'Museum Late Night',
      description: 'After-hours art exhibit with live quartet.',
      location: 'Arts District',
      estimatedCost: '$$-$$$',
      bestTime: '8:00 PM',
    },
  ];
  try { RecommendationSchema.array().parse(base); } catch {}

  const filtered = base.filter((r) => {
    const budgetOk = filters.budget === 'Any' ? true : r.estimatedCost === filters.budget || (filters.budget === '$$-$$$' && r.estimatedCost === '$$-$$$');
    const likesOk = filters.likes.length === 0 ? true : filters.likes.some((l) => r.title.toLowerCase().includes(l.toLowerCase()) || (r.description?.toLowerCase().includes(l.toLowerCase()) ?? false));
    return budgetOk && likesOk;
  });
  return filtered;
}

export default function RecommendationsScreen() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({ budget: 'Any', goal: 'Any', likes: [] });
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const s = await adapter.getSession();
      if (!mounted) return;
      setSession(s);
      const list = buildStubRecommendations(s, filters);
      setRecs(list);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const list = buildStubRecommendations(session, filters);
    setRecs(list);
  }, [filters, session]);

  const onUse = useCallback(async (rec: Recommendation) => {
    await adapter.addRecommendations([rec]);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);

  const canOrganize = useMemo(() => selectedIds.length >= 2, [selectedIds]);

  const onOrganize = useCallback(() => {
    const chosen = recs.filter((r) => selectedIds.includes(r.id));
    const payload = encodeURIComponent(JSON.stringify(chosen));
    router.push({ pathname: '/date-planner/itinerary', params: { items: payload } } as any);
  }, [recs, selectedIds, router]);

  const onMore = useCallback(() => {
    const more = buildStubRecommendations(session, filters).map((r) => ({ ...r, id: `${r.id}-m${Math.floor(Math.random()*10000)}` }));
    setRecs((prev) => [...prev, ...more]);
  }, [session, filters]);

  const toggleFilter = useCallback(<T extends string>(type: 'goal' | 'budget', value: T) => {
    setFilters((prev) => ({ ...prev, [type]: prev[type as keyof Filters] === value ? 'Any' : (value as any) }));
  }, []);

  const toggleLike = useCallback((like: string) => {
    setFilters((prev) => ({ ...prev, likes: prev.likes.includes(like) ? prev.likes.filter((l) => l !== like) : [...prev.likes, like] }));
  }, []);

  return (
    <View style={styles.container} testID="recs-screen">
      <LinearGradient colors={["#FFFFFF", "#FFF0F5"]} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Recommendations</Text>
        <Text style={styles.subtitle}>Based on your picks{session?.desiredExperiences && session.desiredExperiences.length > 0 ? `: ${session.desiredExperiences.join(', ')}` : ''}</Text>

        <View style={styles.filterPills}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
            <View style={styles.pill}><Text style={styles.pillLabel}>Budget</Text><Text style={styles.pillValue}>{filters.budget}</Text></View>
            <View style={styles.pill}><Text style={styles.pillLabel}>Goal</Text><Text style={styles.pillValue}>{filters.goal}</Text></View>
            {filters.likes.length > 0 && (
              <View style={styles.pill}><Text style={styles.pillLabel}>Likes</Text><Text style={styles.pillValue}>{filters.likes.join(', ')}</Text></View>
            )}
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#E91E63" />
        ) : (
          <View style={styles.list}>
            {recs.map((rec) => {
              const isSelected = selectedIds.includes(rec.id);
              return (
                <TouchableOpacity key={rec.id} style={styles.card} activeOpacity={0.85} testID={`rec-${rec.id}`} onPress={() => toggleSelect(rec.id)}>
                  <LinearGradient colors={["#E91E63", "#F06292"]} style={styles.cardGradient}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{rec.title}</Text>
                      {isSelected && <CheckCircle2 color="#fff" size={22} />}
                    </View>
                    <Text style={styles.cardDesc}>{rec.description}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}><MapPin size={14} color="#fff" /><Text style={styles.metaText}>{rec.location}</Text></View>
                      <View style={styles.metaItem}><DollarSign size={14} color="#fff" /><Text style={styles.metaText}>{rec.estimatedCost}</Text></View>
                      <View style={styles.metaItem}><Clock size={14} color="#fff" /><Text style={styles.metaText}>{rec.bestTime}</Text></View>
                    </View>
                    {GUIDE_ENABLED && (
                      <View style={styles.guideBox} testID={`guide-${rec.id}`}>
                        <View style={styles.guideHeader}>
                          <HelpCircle size={16} color="#111" />
                          <Text style={styles.guideTitle}>Date Guide</Text>
                        </View>
                        {(() => {
                          const g = buildGuide(rec, filters, session);
                          return (
                            <View>
                              <Text style={styles.guideWhy}>{g.why}</Text>
                              <Text style={styles.guideTweak}>{g.tweak}</Text>
                            </View>
                          );
                        })()}
                      </View>
                    )}
                    <TouchableOpacity style={styles.useBtn} onPress={() => onUse(rec)} testID={`use-${rec.id}`}>
                      <Sparkles size={18} color="#E91E63" />
                      <Text style={styles.useText}>Use this</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onMore} testID="cta-more">
          <RefreshCw size={18} color="#E91E63" />
          <Text style={styles.secondaryText}>Give me more</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowFilters(true)} testID="cta-edit">
          <SlidersHorizontal size={18} color="#E91E63" />
          <Text style={styles.secondaryText}>Edit Preferences</Text>
        </TouchableOpacity>
        {canOrganize && (
          <TouchableOpacity style={styles.primaryBtn} onPress={onOrganize} testID="cta-organize">
            <Text style={styles.primaryText}>Organize my Date</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Preferences</Text>

            <Text style={styles.sectionTitle}>Budget</Text>
            <View style={styles.rowWrap}>
              {BUDGETS.map((b) => (
                <TouchableOpacity key={b} style={[styles.chip, filters.budget === b ? styles.chipActive : styles.chipInactive]} onPress={() => toggleFilter('budget', b)} testID={`budget-${b}`}>
                  <Text style={[styles.chipText, filters.budget === b ? styles.chipTextActive : styles.chipTextInactive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Goal</Text>
            <View style={styles.rowWrap}>
              {GOALS.map((g) => (
                <TouchableOpacity key={g} style={[styles.chip, filters.goal === g ? styles.chipActive : styles.chipInactive]} onPress={() => toggleFilter('goal', g)} testID={`goal-${g}`}>
                  <Text style={[styles.chipText, filters.goal === g ? styles.chipTextActive : styles.chipTextInactive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Likes</Text>
            <View style={styles.rowWrap}>
              {INTERESTS_OPTIONS.map((like) => {
                const active = filters.likes.includes(like);
                return (
                  <TouchableOpacity key={like} style={[styles.chip, active ? styles.chipActive : styles.chipInactive]} onPress={() => toggleLike(like)} testID={`like-${like}`}>
                    <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>{like}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity onPress={() => setShowFilters(false)} style={styles.modalClose} testID="close-filters"><Text style={styles.modalCloseText}>Done</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20, paddingBottom: 120 },
  title: { fontSize: 24, fontWeight: '700', color: '#222', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 14 },
  filterPills: { marginBottom: 8 },
  pillsRow: { gap: 8, paddingVertical: 4 },
  pill: { backgroundColor: '#F3F4F6', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, marginRight: 8 },
  pillLabel: { color: '#6B7280', fontSize: 12 },
  pillValue: { color: '#111827', fontWeight: '700' },
  list: { gap: 14 },
  card: { borderRadius: 18, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  cardGradient: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  cardDesc: { color: '#fff', opacity: 0.95, marginBottom: 10 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#fff' },
  useBtn: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, alignSelf: 'flex-start', flexDirection: 'row', gap: 8 },
  useText: { color: '#E91E63', fontWeight: '700' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, backgroundColor: '#ffffffEE', flexDirection: 'row', alignItems: 'center', gap: 10 },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FDF2F8', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 },
  secondaryText: { color: '#E91E63', fontWeight: '700' },
  primaryBtn: { marginLeft: 'auto', backgroundColor: '#E91E63', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12 },
  primaryText: { color: '#fff', fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '70%', paddingBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', paddingHorizontal: 16, marginTop: 6, marginBottom: 4, color: '#374151' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  chip: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 },
  chipInactive: { backgroundColor: '#fff', borderColor: '#eee' },
  chipActive: { backgroundColor: '#FDE7EF', borderColor: '#E91E63' },
  chipText: { fontSize: 14, fontWeight: '600' },
  chipTextInactive: { color: '#444' },
  chipTextActive: { color: '#E91E63' },
  modalClose: { alignSelf: 'stretch', margin: 16, paddingVertical: 12, backgroundColor: '#111', borderRadius: 12, alignItems: 'center' },
  modalCloseText: { color: '#fff', fontWeight: '700' },
  guideBox: { backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#F3F4F6' },
  guideHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  guideTitle: { fontWeight: '800', color: '#111' },
  guideWhy: { color: '#111' },
  guideTweak: { color: '#111', opacity: 0.8, marginTop: 4 },
});
