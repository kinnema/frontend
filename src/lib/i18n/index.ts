import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";

const loadTranslations = async (language: string) => {
  const translations = await import(`./locales/${language}.json`);
  return translations.default;
};

const resources = {
  en: {
    translation: en,
  },
  tr: {
    translation: await loadTranslations("tr"),
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "tr",
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18n;
