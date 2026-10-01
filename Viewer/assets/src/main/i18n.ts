import { computed, signal } from "@/rhu/signal.js";

// React and the profile UI share the same i18next instance and preference.
export const language = signal(document.documentElement.lang);
window.addEventListener("replay-language-changed", () => language(document.documentElement.lang));
export const ui = (text: string, values?: Record<string, unknown>) => window.ReplayInterface.ui(text, values);
const labels = new Map<string, ReturnType<typeof computed<string>>>();
export function uiText(text: string) {
    let label = labels.get(text);
    if (!label) labels.set(text, label = computed<string>(set => { set(ui(text)); }, [language]));
    return label;
}
export const translated = (key: string) => computed<string>(set => { set(window.ReplayInterface.t(key)); }, [language]);

export function uiAttribute(element: Element, attribute: string, text: string, signal?: AbortSignal) {
    language.on(() => element.setAttribute(attribute, ui(text)), { signal });
}
