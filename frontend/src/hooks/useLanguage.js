import { useCallback, useState } from "react";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "../i18n/translations.js";

const STORAGE_KEY = "bailanysta_language";

function readInitialLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return SUPPORTED_LANGUAGES.includes(stored) ? stored : DEFAULT_LANGUAGE;
}

export function useLanguage() {
  const [language, setLanguageState] = useState(readInitialLanguage);

  const setLanguage = useCallback((lang) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  return { language, setLanguage };
}
