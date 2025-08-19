import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { adapter } from '@/data';

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
  const [showDate, setShowDate] = useState<boolean>(false);
  const [showTime, setShowTime] = useState<boolean>(false);

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

  const displayDate = useMemo(() => {
    const opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Intl.DateTimeFormat(undefined, opts).format(when);
  }, [when]);

  const displayTime = useMemo(() => {
    const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
    return new Intl.DateTimeFormat(undefined, opts).format(when);
  }, [when]);

  const nextDays = useMemo(() => {
    const days: Date[] = [];
    const base = new Date(when);
    base.setHours(0, 0, 0, 0);
    for (let i = 0; i < 30; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [when]);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(() => [0, 15, 30, 45], []);

  return (
    <View style={styles.container} testID="time-screen">
      <LinearGradient colors={["#FFFFFF", "#FFF0F5"]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.body}>
        <Text style={styles.title}>What time does your date start?</Text>
        <Text style={styles.subtitle}>Pick a date and start time</Text>

        <View style={styles.pickerWrap}>
          <View style={styles.row}>
            <TouchableOpacity style={styles.selector} onPress={() => setShowDate(true)} testID="open-date">
              <Text style={styles.selectorLabel}>Date</Text>
              <Text style={styles.selectorValue}>{displayDate}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.selector} onPress={() => setShowTime(true)} testID="open-time">
              <Text style={styles.selectorLabel}>Time</Text>
              <Text style={styles.selectorValue}>{displayTime}</Text>
            </TouchableOpacity>
          </View>

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

      <Modal visible={showDate} transparent animationType="slide" onRequestClose={() => setShowDate(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowDate(false)} testID="backdrop-date" />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select a date</Text>
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
              {nextDays.map((d, idx) => {
                const label = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(d);
                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.modalItem}
                    onPress={() => {
                      const updated = new Date(when);
                      updated.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
                      setWhen(updated);
                      setShowDate(false);
                    }}
                    testID={`pick-date-${idx}`}
                  >
                    <Text style={styles.modalItemText}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowDate(false)} style={styles.modalClose} testID="close-date"><Text style={styles.modalCloseText}>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showTime} transparent animationType="slide" onRequestClose={() => setShowTime(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowTime(false)} testID="backdrop-time" />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select a time</Text>
            <View style={styles.timeGrid}>
              <ScrollView style={styles.timeCol} contentContainerStyle={styles.modalScrollContent}>
                {hours.map((h) => (
                  <TouchableOpacity key={h} style={styles.modalItem} onPress={() => {
                    const updated = new Date(when);
                    updated.setHours(h, updated.getMinutes(), 0, 0);
                    setWhen(updated);
                  }} testID={`pick-hour-${h}`}>
                    <Text style={styles.modalItemText}>{h.toString().padStart(2, '0')}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <ScrollView style={styles.timeCol} contentContainerStyle={styles.modalScrollContent}>
                {minutes.map((m) => (
                  <TouchableOpacity key={m} style={styles.modalItem} onPress={() => {
                    const updated = new Date(when);
                    updated.setMinutes(m, 0, 0);
                    setWhen(updated);
                  }} testID={`pick-minute-${m}`}>
                    <Text style={styles.modalItemText}>{m.toString().padStart(2, '0')}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <TouchableOpacity onPress={() => setShowTime(false)} style={styles.modalClose} testID="close-time"><Text style={styles.modalCloseText}>Done</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  body: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#222', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 14 },
  pickerWrap: { marginTop: 6, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  selector: { flex: 1, backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12 },
  selectorLabel: { color: '#666', fontSize: 12, marginBottom: 4 },
  selectorValue: { color: '#111', fontSize: 16, fontWeight: '700' },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quick: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#F3F4F6' },
  quickText: { color: '#333', fontWeight: '600' },
  cta: { margin: 20, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  ctaEnabled: { backgroundColor: '#E91E63' },
  ctaDisabled: { backgroundColor: '#f4b5c8' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '70%' },
  modalTitle: { fontSize: 18, fontWeight: '700', padding: 16 },
  modalScroll: { maxHeight: 320 },
  modalScrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  modalItem: { paddingVertical: 12 },
  modalItemText: { fontSize: 16, color: '#111' },
  modalClose: { alignSelf: 'stretch', margin: 16, paddingVertical: 12, backgroundColor: '#111', borderRadius: 12, alignItems: 'center' },
  modalCloseText: { color: '#fff', fontWeight: '700' },
  timeGrid: { flexDirection: 'row', gap: 12, paddingHorizontal: 16 },
  timeCol: { flex: 1 },
});
