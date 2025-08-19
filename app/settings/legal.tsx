import React, { useMemo, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FileText, Shield, ExternalLink, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { adapter } from '@/services/db';

export default function LegalScreen() {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const termsUrl = t('legal.placeholderUrl');
  const privacyUrl = t('legal.placeholderUrl');

  const openUrl = useCallback(async (url: string) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url);
      else Alert.alert('Error', 'Cannot open link');
    } catch (e) {
      console.error('[Legal] openUrl error', e);
      Alert.alert('Error', 'Failed to open link');
    }
  }, []);

  const onDeleteAccount = useCallback(() => {
    Alert.alert(
      t('settings.deleteAccount'),
      t('safety.confirmDeleteAccount'),
      [
        { text: t('safety.cancel'), style: 'cancel' },
        {
          text: t('safety.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              try {
                await adapter.deleteUser(true);
                Alert.alert(t('settings.deleteAccount'), t('safety.deletionQueued'));
              } catch (err) {
                Alert.alert(t('settings.deleteAccount'), t('safety.deletionQueued'));
              }
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  }, [t]);

  const onDeleteLocal = useCallback(() => {
    Alert.alert(
      t('settings.deleteLocal'),
      t('safety.confirmDeleteLocal'),
      [
        { text: t('safety.cancel'), style: 'cancel' },
        {
          text: t('safety.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await adapter.clearAll();
              Alert.alert(t('settings.deleteLocal'), t('profile.deleteBody'));
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  }, [t]);

  return (
    <ScrollView contentContainerStyle={styles.container} testID="legal-screen">
      <LinearGradient colors={["#FFFFFF", "#FFF0F5"]} style={styles.bg} />

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FileText size={20} color="#E91E63" />
          <Text style={styles.cardTitle}>{t('legal.termsTitle')}</Text>
        </View>
        <Text style={styles.md}>
{`# Terms of Use\n\nThis is a placeholder Terms of Use. We'll replace it with real legal copy.\n\n- You agree to be kind.\n- No spam.\n- Respect privacy.\n`}
        </Text>
        <TouchableOpacity style={styles.linkBtn} onPress={() => openUrl(termsUrl)} testID="open-terms-url">
          <ExternalLink size={18} color="#E91E63" />
          <Text style={styles.linkText}>{t('legal.externalLink')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Shield size={20} color="#E91E63" />
          <Text style={styles.cardTitle}>{t('legal.privacyTitle')}</Text>
        </View>
        <Text style={styles.md}>
{`# Privacy Policy\n\nThis is a placeholder Privacy Policy. We'll replace it with real legal copy.\n\nWe respect your privacy and only store data required to provide the service.`}
        </Text>
        <TouchableOpacity style={styles.linkBtn} onPress={() => openUrl(privacyUrl)} testID="open-privacy-url">
          <ExternalLink size={18} color="#E91E63" />
          <Text style={styles.linkText}>{t('legal.externalLink')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Trash2 size={20} color="#E91E63" />
          <Text style={styles.cardTitle}>{t('settings.deleteAccount')}</Text>
        </View>
        <TouchableOpacity style={styles.dangerBtn} onPress={onDeleteAccount} disabled={isProcessing} testID="delete-account">
          <Text style={styles.dangerText}>{t('settings.deleteAccount')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onDeleteLocal} disabled={isProcessing} testID="delete-local">
          <Text style={styles.secondaryText}>{t('settings.deleteLocal')}</Text>
        </TouchableOpacity>
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  md: { fontSize: 14, color: '#444', lineHeight: 20 },
  linkBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 10 },
  linkText: { color: '#E91E63', fontSize: 14, fontWeight: '600' },
  dangerBtn: { backgroundColor: '#FDE7EA', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  dangerText: { color: '#E91E63', fontSize: 15, fontWeight: '700' },
  secondaryBtn: { backgroundColor: '#f7f7f7', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  secondaryText: { color: '#333', fontSize: 14, fontWeight: '600' },
});
