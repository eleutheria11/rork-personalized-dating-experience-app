import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { adapter } from '@/data';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

function formatTimeZoneOffset(date: Date): string {
  const offsetMin = -date.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const pad = (n: number) => `${Math.floor(Math.abs(n)).toString().padStart(2, '0')}`;
  const hours = pad(offsetMin / 60);
  const minutes = pad(offsetMin % 60);
  return `${sign}${hours}:${minutes}`;
}

function toZonedISOString(date: Date): string {
  const pad = (n: number, l: number = 2) => n.toString().padStart(l, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  const ms = pad(date.getMilliseconds(), 3);
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}.${ms}${formatTimeZoneOffset(date)}`;
}

export default function DateTimeScreen() {
  const router = useRouter();
  const [when, setWhen] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await adapter.getSession();
        if (s?.dateStartISO) {
          const parsed = new Date(s.dateStartISO);
          if (!isNaN(parsed.getTime())) setWhen(parsed);
        }
      } catch (e) {
        console.log('[time] load session error', e);
      }
    })();
  }, []);

  const onChange = useCallback((event: DateTimePickerEvent, date?: Date) => {
    if (date) setWhen(date);
  }, []);

  const onNext = useCallback(async () => {
    try {
      setLoading(true);
      const iso = toZonedISOString(when);
      await adapter.updateDateStartISO(iso);
      router.push('/date-planner/recommendations' as any);
    } catch (e) {
      console.error('[time] save error', e);
      Alert.alert('Error', 'Unable to save date time. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [when, router]);

  return (
    <View style={styles.container} testID="time-screen">
      <LinearGradient colors={["#FFFFFF", "#FFF0F5"]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.body}>
        <Text style={styles.title}>What time does your date start?</Text>
        <Text style={styles.subtitle}>Pick a date and start time</Text>

        <View style={styles.pickerWrap}>
          <DateTimePicker
            testID="native-datetime-picker"
            value={when}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onChange}
          />

          <View style={styles.quickRow}>
            {['Tonight 7:00', 'Tomorrow 7:00', 'This Weekend 6:00'].map((label, idx) => (
              <TouchableOpacity key={idx} style={styles.quick} onPress={() => {
                const now = new Date();
                const d = new Date(now);
                if (idx === 0) {
                  d.setHours(19, 0, 0, 0);
                } else if (idx === 1) {
                  d.setDate(d.getDate() + 1);
                  d.setHours(19, 0, 0, 0);
                } else {
                  const day = d.getDay();
                  const diff = (6 - day + 7) % 7;
                  d.setDate(d.getDate() + diff);
                  d.setHours(18, 0, 0, 0);
                }
                setWhen(d);
              }} testID={`quick-${idx}`}>
                <Text style={styles.quickText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={onNext}
        disabled={loading}
        activeOpacity={0.9}
        style={[styles.cta, loading ? styles.ctaDisabled : styles.ctaEnabled]}
        testID="time-next"
      >
        <Text style={styles.ctaText}>{loading ? 'Saving...' : 'Next'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  body: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#222', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 14 },
  pickerWrap: { marginTop: 6, gap: 12 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quick: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#F3F4F6' },
  quickText: { color: '#333', fontWeight: '600' },
  cta: { margin: 20, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  ctaEnabled: { backgroundColor: '#E91E63' },
  ctaDisabled: { backgroundColor: '#f4b5c8' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
