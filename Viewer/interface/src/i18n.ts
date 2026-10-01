import i18n from "i18next";
import uiChinese from "./locales/ui.zh-CN.json";
import { initReactI18next } from "react-i18next";

import en from "./locales/en";
import zh from "./locales/zh-CN";

const saved = localStorage.getItem("gtfo-replay.language");
void i18n.use(initReactI18next).init({
    resources: { en: { translation: en, ui: Object.fromEntries(Object.keys(uiChinese).map(key => [key, key])) }, "zh-CN": { translation: zh, ui: uiChinese } },
    lng: saved === "en" || saved === "zh-CN" ? saved : "en",
    fallbackLng: "en", interpolation: { escapeValue: false }, initImmediate: false
});
i18n.on("languageChanged", language => {
    localStorage.setItem("gtfo-replay.language", language);
    document.documentElement.lang = language;
    window.dispatchEvent(new Event("replay-language-changed"));
});
document.documentElement.lang = i18n.language;
export const t = (key: string, values?: Record<string, unknown>): string => String(i18n.t(key, values));
export const ui = (text: string, values?: Record<string, unknown>): string => String(i18n.t(text, { ...values, ns: "ui", keySeparator: false, defaultValue: text }));
export default i18n;
