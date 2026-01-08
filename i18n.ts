import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import Backend from "i18next-http-backend"
import LanguageDetector from "i18next-browser-languagedetector"

// Check if we're on the client side
const isClient = typeof window !== "undefined"

// Initialize i18next
if (!i18n.isInitialized) {
  const i18nConfig = {
    ns: ["common", "auth", "dashboard", "editor", "community"],
    defaultNS: "common",
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  }

  if (isClient) {
    // Client-side configuration with backend loading
    i18n
      .use(Backend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        ...i18nConfig,
        backend: {
          loadPath: "/locales/{{lng}}/{{ns}}.json",
        },
      })
  } else {
    // Server-side configuration with minimal setup
    i18n
      .use(initReactI18next)
      .init({
        ...i18nConfig,
        resources: {
          en: {
            common: {},
            auth: {},
            dashboard: {},
            editor: {},
            community: {},
          },
          th: {
            common: {},
            auth: {},
            dashboard: {},
            editor: {},
            community: {},
          },
        },
      })
  }
}

export default i18n
