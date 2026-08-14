import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import id from './id.json';

/** 
 * Mengambil preferensi bahasa yang tersimpan sebelumnya di localStorage
 */
const savedLanguage = localStorage.getItem('preferred_lang') || 'id';

/**
 * Konfigurasi i18next
 */
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      id: { translation: id },
    },
    lng: savedLanguage, 
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // Menonaktifkan escape bawaan React
    },
  });

export default i18n;