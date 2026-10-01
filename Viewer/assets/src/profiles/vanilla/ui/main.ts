import { uiAttribute } from "@esm/@root/main/i18n.js";
import { html } from "@esm/@/rhu/html.js";
import { Signal, signal } from "@esm/@/rhu/signal.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import { Render } from "@esm/@root/main/routes/player/index.js";

let disposeController = new AbortController();
export const dispose = {
    get signal() {
        return disposeController.signal;
    } 
};

const ref: { value: undefined | html<typeof UI> } = { value: undefined };
export function ui(): html<typeof UI> {
    if (ref.value === undefined) {
        if (disposeController !== undefined) disposeController.abort();
        disposeController = new AbortController();
        ref.value = UI();
    }
    return ref.value;
}

// NOTE(randomuserhi): Save state for hot reload
module.destructor = () => {
    disposeController?.abort();

    const view = ui()?.view();
    if (view === undefined) return;

    const r = view.renderer;
    r.get("Controls")?.saveState();
};

module.ready();

/* eslint-disable-next-line sort-imports */
import { Display } from "./display.js";
import { Chat } from "./pages/chat.js";
import { Finder } from "./pages/finder.js";
import { Info } from "./pages/info.js";
import { Settings } from "./pages/settings.js";
import { Stats } from "./pages/stats.js";

interface Page {
    readonly view: Signal<html<typeof View> | undefined>;
    readonly active: Signal<boolean>;
}
const UI = () => {
    const dom = html<{
        display: html<typeof Display>; window: HTMLDivElement; close: HTMLButtonElement; content: HTMLDivElement;
        view: Signal<html<typeof View> | undefined>;
    }>`
        <div class="replay-workspace">
            <div data-replay-nav></div>
            <div data-react-panel></div>
            <aside m-id="window" class="legacy-panel" hidden>
                <button m-id="close" class="panel-close" type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
                <div m-id="content"></div>
            </aside>
            <div class="replay-stage">${html.bind(Display(), "display")}</div>
        </div>`;
    html(dom).box();
    dom.view = signal<html<typeof View> | undefined>(undefined);
    const pages = new Map<string, html<Page>>([
        ["players", Stats()], ["finder", Finder()], ["info", Info()], ["chat", Chat()]
    ]);
    const settings = Settings(), settingsContent = document.createElement("div");
    settingsContent.append(...settings);
    window.addEventListener("replay-settings-open", ((event: CustomEvent<boolean>) => { settings.active(event.detail); }) as EventListener, { signal: dispose.signal });
    window.dispatchEvent(new CustomEvent("replay-settings-content", { detail: settingsContent }));
    dispose.signal.addEventListener("abort", () => window.dispatchEvent(new CustomEvent("replay-settings-content")), { once: true });
    const panelObserver = new ResizeObserver(() => dom.display.view()?.resize());
    panelObserver.observe(dom.window);
    const wrapper = dom.window.parentElement;
    if (wrapper) panelObserver.observe(wrapper);
    dispose.signal.addEventListener("abort", () => panelObserver.disconnect(), { once: true });
    window.addEventListener("replay-panel", ((event: CustomEvent<string | undefined>) => {
        const current = event.detail ? pages.get(event.detail) : undefined;
        for (const page of pages.values()) page.active(page === current);
        dom.window.hidden = !current;
        dom.content.replaceChildren(...(current ?? []));
        dom.display.view()?.resize();
    }) as EventListener, { signal: dispose.signal });
    // Navigation owns the selected page; the close button asks it to clear selection.
    dom.close.addEventListener("click", () => window.dispatchEvent(new Event("replay-close-panel")));
    uiAttribute(dom.close, "aria-label", "Close", dispose.signal);
    dom.view.on(view => {
        dom.display.view(view);
        settings.view(view);
        for (const page of pages.values()) page.view(view);
    }, { signal: dispose.signal });
    return dom;
};
Render((doc, view) => {
    const main = ui(); main.view(view); doc.append(...main);
});
