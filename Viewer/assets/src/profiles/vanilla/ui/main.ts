import { html, Mutable } from "@esm/@/rhu/html.js";
import { Signal, signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import * as icons from "@esm/@root/main/global/components/atoms/icons/index.js";
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
import { Bar, Button } from "./components/bar.js";
import { Display } from "./display.js";
import { Finder } from "./pages/finder.js";
import { Info } from "./pages/info.js";
import { Settings } from "./pages/settings.js";
import { Stats } from "./pages/stats.js";

const style = Style(({ css }) => {
    const wrapper = css.class`
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: row;
    `;

    const body = css.class`
    position: relative;
    flex: 1;
    `;
    
    const window = css.class`
    height: 100%;
    flex-shrink: 0;
    width: auto;
    background-color: #1f1f29;
    overflow-y: auto;
    overflow-x: hidden;
    `;

    return {
        wrapper,
        window,
        body
    };
});

interface Page {
    readonly view: Signal<html<typeof View> | undefined>;
    readonly active: Signal<boolean>;
}

const UI = () => {
    interface UI {
        load(page: html<Page>): void;

        readonly view: Signal<html<typeof View> | undefined>;

        readonly display: html<typeof Display>;

        readonly settings: html<typeof Button>;
        readonly stats: html<typeof Button>;
        readonly finder: html<typeof Button>;
        readonly info: html<typeof Button>;
    }
    interface Private {
        readonly window: HTMLDivElement;

        readonly pages: Map<html<typeof Button>, html<Page>>;
        readonly loadedPage?: html<Page>;
    }

    const dom = html<Mutable<Private & UI>>/**//*html*/`
        <div class="${style.wrapper}">
            ${html.open(Bar())}
                ${html.open(Button()).bind("settings")}
                    ${icons.gear()}
                ${html.close()}
                ${html.open(Button()).bind("stats")}
                    ${icons.stats()}
                ${html.close()}
                ${html.open(Button()).bind("finder")}
                    ${icons.finder()}
                ${html.close()}
                <div style="flex: 1"></div>
                ${html.open(Button()).bind("info")}
                    ${icons.info()}
                ${html.close()}
            ${html.close()}
            <div m-id="window" class="${style.window}" style="display: none;">
            </div>
            <div class="${style.body}">
                ${html.bind(Display(), "display")}
            </div>
        </div>
        `;
    html(dom).box();
    
    dom.view = signal<html<typeof View> | undefined>(undefined);

    dom.pages = new Map();

    dom.load = function load(page?: html<Page>) {
        const view = this.display.view();
        if (this.loadedPage === page) page = undefined;
        this.loadedPage = page;
        
        for (const [button, page] of this.pages) {
            if (page !== this.loadedPage) {
                button.toggle(false);
                page.active(false);
            } else {
                button.toggle(true);
                page.active(true);
            }
        }

        if (page !== undefined) {
            this.window.replaceChildren(...page);
            this.window.style.display = "block";
        } else {
            if (view) view.canvas.focus();
            this.window.replaceChildren();
            this.window.style.display = "none";
        }
        if (view) view.resize();
    };

    dom.pages.set(dom.settings, Settings());
    dom.pages.set(dom.finder, Finder());
    dom.pages.set(dom.info, Info());
    dom.pages.set(dom.stats, Stats());

    for(const [button, page] of dom.pages) {
        button.button.addEventListener("click", () => {
            dom.load(page);
        });
    }
    
    dom.view.on((view) => {
        if (view === undefined) return;

        dom.display.view(view);
        for (const page of dom.pages.values()) {
            page.view(view);
        }
    }, { signal: dispose.signal });

    return dom as html<UI>;
};

Render((doc, view) => {
    const main = ui();
    main.view(view);
    doc.append(...main);
});