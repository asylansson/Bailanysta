import { createContext, useContext, useMemo, useCallback } from "react";
import { TRANSLATIONS } from "./translations.js";

const I18nContext = createContext(null);

function resolve(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

function interpolate(str, params) {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, key) => (params[key] !== undefined ? String(params[key]) : `{${key}}`));
}

function pluralSuffix(lang, count) {
  if (lang === "ru") {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return "_one";
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "_few";
    return "_many";
  }
  if (lang === "en") {
    return count === 1 ? "_one" : "_many";
  }
  return "_many";
}

export function I18nProvider({ language, setLanguage, children }) {
  const dict = TRANSLATIONS[language] || TRANSLATIONS.ru;

  const t = useCallback(
    (path, params) => {
      const value = resolve(dict, path) ?? resolve(TRANSLATIONS.ru, path) ?? path;
      return interpolate(value, params);
    },
    [dict]
  );

  const tp = useCallback(
    (basePath, count, params) => {
      const suffix = pluralSuffix(language, count);
      return t(`${basePath}${suffix}`, { count, ...params });
    },
    [language, t]
  );

  const value = useMemo(() => ({ language, setLanguage, t, tp }), [language, setLanguage, t, tp]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
