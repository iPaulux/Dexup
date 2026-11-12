import React, { createContext, useContext, useState } from 'react';

export const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
];

const STORAGE_KEY = 'pc_lang';
const LanguageContext = createContext({ lang: 'fr', setLang: () => {} });

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGUAGES.some((l) => l.code === saved)) return saved;
  } catch (_) {}
  return 'fr';
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);
  const setLang = (code) => {
    setLangState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch (_) {}
  };
  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  return useContext(LanguageContext);
}
