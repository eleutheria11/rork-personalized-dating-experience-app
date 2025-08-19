import React, { useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mail, HelpCircle, ExternalLink } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SupportScreen() {
  const { t } = useTranslation();
  const email = t('support.contactEmail');

  const emailSupport = useCallback(async () => {
    const url = `mailto:${email}`;
    try {
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url);
      else Alert.alert('Error', 'Cannot open mail app');
    } catch (e) {
      console.error('[Support] email error', e);
      Alert.alert('Error', 'Failed to open mail app');
    }
  }, [email]);

  return (
    <ScrollView contentContainerStyle={styles.container} testID="support-screen">
      <LinearGradient colors={["#FFFFFF", "#FFF0F5"]} style={styles.bg} />

      <View style={styles.card}>
        <View style={styles.row}>
          <Mail size={20} color="#E91E63" />
          <Text style={styles.title}>{t('support.title')}</Text>
        </View>
        <Text style={styles.body}>{email}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={emailSupport} testID="email-support">
          <Text style={styles.primaryText}>{t('support.emailUs')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <HelpCircle size={20} color="#E91E63" />
          <Text style={styles.title}>{t('support.faqTitle')}</Text>
        </View>
        <Text style={styles.body}>{t('support.stub')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  bg: { ...StyleSheet.absoluteFillObject },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#333' },
  body: { fontSize: 14, color: '#555' },
  primaryBtn: { backgroundColor: '#E91E63', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  primaryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
