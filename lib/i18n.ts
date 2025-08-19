import * as Localization from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
} as const;

if (!i18next.isInitialized) {
  void i18next
    .use(initReactI18next)
    .init({
      resources,
      lng: Localization.getLocales?.()[0]?.languageTag?.split('-')[0] ?? 'en',
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      compatibilityJSON: 'v4',
    });
}

export default i18next;
