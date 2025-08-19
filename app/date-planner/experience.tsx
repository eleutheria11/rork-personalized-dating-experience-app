import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { adapter } from '@/data';
import { DateExperienceSchema, type Session } from '@/types/schemas';

const EXPERIENCES = DateExperienceSchema.options as readonly string[];

export default function DateExperienceScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await adapter.getSession();
        if (mounted && s?.desiredExperiences) {
          setSelected(s.desiredExperiences);
        }
      } catch (e) {
        console.log('[experience] load session error', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggle = useCallback((exp: string) => {
    setSelected(prev => prev.includes(exp) ? prev.filter(x => x !== exp) : [...prev, exp]);
  }, []);

  const canNext = useMemo(() => selected.length > 0, [selected]);

  const onNext = useCallback(async () => {
    if (!canNext) return;
    try {
      setLoading(true);
      await adapter.updateDesiredExperiences(selected);
      router.push('/date-planner/time' as any);
    } catch (e) {
      console.error('[experience] save error', e);
      Alert.alert('Error', 'Unable to save your selection. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [canNext, selected, router]);

  return (
    <View style={styles.container} testID="experience-screen">
      <LinearGradient colors={["#FFFFFF", "#FFF0F5"]} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What kind of date experience do you want?</Text>
        <Text style={styles.subtitle}>Pick one or more</Text>

        <View style={styles.chipsWrap}>
          {EXPERIENCES.map((exp) => {
            const isActive = selected.includes(exp);
            return (
              <TouchableOpacity
                key={exp}
                onPress={() => toggle(exp)}
                activeOpacity={0.8}
                style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
                testID={`chip-${exp}`}
              >
                <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
                  {exp}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={onNext}
        disabled={!canNext || loading}
        activeOpacity={0.9}
        style={[styles.cta, (!canNext || loading) ? styles.ctaDisabled : styles.ctaEnabled]}
        testID="experience-next"
      >
        <Text style={styles.ctaText}>{loading ? 'Saving...' : 'Next'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#222', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 14 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
  chipInactive: { backgroundColor: '#fff', borderColor: '#eee' },
  chipActive: { backgroundColor: '#FDE7EF', borderColor: '#E91E63' },
  chipText: { fontSize: 14, fontWeight: '600' },
  chipTextInactive: { color: '#444' },
  chipTextActive: { color: '#E91E63' },
  cta: { margin: 20, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  ctaEnabled: { backgroundColor: '#E91E63' },
  ctaDisabled: { backgroundColor: '#f4b5c8' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
