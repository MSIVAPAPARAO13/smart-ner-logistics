import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { TRANSLATIONS, type SupportedLanguage, type Translations } from './translations';

const STORAGE_KEY = 'sih26002_language';

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    return (stored && TRANSLATIONS[stored]) ? stored : 'en';
  });

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    if (TRANSLATIONS[lang]) {
      setLanguageState(lang);
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }, []);

  const t = TRANSLATIONS[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * useTranslation — returns { t, language, setLanguage }.
 * Immediate UI switch with zero full page reload.
 * Missing key falls back to English, never returns undefined.
 */
export const useTranslation = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Graceful fallback when used outside provider (should not happen in prod)
    return {
      language: 'en',
      setLanguage: () => {},
      t: TRANSLATIONS['en'],
    };
  }
  return ctx;
};
