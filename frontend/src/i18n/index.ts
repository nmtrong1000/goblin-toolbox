import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '#/i18n/locales/en/common.json';
import vi from '#/i18n/locales/vi/common.json';

export const supportedLocales = ['en', 'vi'] as const;
export type Locale = (typeof supportedLocales)[number];

const savedLocale = localStorage.getItem('goblin.locale');
const browserLocale = navigator.languages
  .map((language) => language.toLowerCase().split('-')[0])
  .find((language): language is Locale => supportedLocales.includes(language as Locale));
const initialLocale = supportedLocales.includes(savedLocale as Locale)
  ? (savedLocale as Locale)
  : (browserLocale ?? 'en');

void i18n.use(initReactI18next).init({
  resources: { en: { common: en }, vi: { common: vi } },
  lng: initialLocale,
  fallbackLng: 'en',
  defaultNS: 'common',
  keySeparator: false,
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (locale) => {
  const selected = supportedLocales.includes(locale as Locale) ? (locale as Locale) : 'en';
  localStorage.setItem('goblin.locale', selected);
  document.documentElement.lang = selected;
});

document.documentElement.lang = initialLocale;

export default i18n;
