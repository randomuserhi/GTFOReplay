import { html, Macro, MacroElement } from "@esm/@/rhu/macro.js";
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

const ref: { value: undefined | Macro<typeof UI> } = { value: undefined };
export function ui(): Macro<typeof UI> {
    if (ref.value === undefined) {
        if (disposeController !== undefined) disposeController.abort();
        disposeController = new AbortController();
        ref.value = Macro.create(UI());
    }
    return ref.value;
}

// NOTE(randomuserhi): Save state for hot reload
module.destructor = () => {
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

const style = Style(({ style }) => {
    const wrapper = style.class`
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: row;
    `;

    const body = style.class`
    position: relative;
    flex: 1;
    `;
    
    const window = style.class`
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

interface Page extends MacroElement {
    view: Signal<Macro<typeof View> | undefined>;
    active: Signal<boolean>;
}

const UI = Macro(class UI extends MacroElement {
    public display: Macro<typeof Display>;
    
    public settings: Macro<typeof Button>;
    public stats: Macro<typeof Button>;
    public finder: Macro<typeof Button>;
    public info: Macro<typeof Button>;

    public pages = new Map<Macro<typeof Button>, Page>();

    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);

        this.pages.set(this.settings, Macro.create(Settings()));
        this.pages.set(this.finder, Macro.create(Finder()));
        this.pages.set(this.info, Macro.create(Info()));
        this.pages.set(this.stats, Macro.create(Stats()));

        for(const [button, page] of this.pages) {
            button.button.addEventListener("click", () => {
                this.load(page);
            });
        }
        
        this.view.on((view) => {
            if (view === undefined) return;

            this.display.view(view);
            for (const page of this.pages.values()) {
                page.view(view);
            }
        });
    }

    public view = signal<Macro<typeof View> | undefined>(undefined);

    private window: HTMLDivElement;
    private loadedMacro?: MacroElement;
    public load(macro?: Page) {
        const view = this.display.view();
        if (this.loadedMacro === macro) macro = undefined;
        this.loadedMacro = macro;
        
        for (const [button, page] of this.pages) {
            if (page !== macro) {
                button.toggle(false);
                page.active(false);
            } else {
                button.toggle(true);
                page.active(true);
            }
        }

        if (macro !== undefined) {
            this.window.replaceChildren(...macro.dom);
            this.window.style.display = "block";
        } else {
            if (view) view.canvas.focus();
            this.window.replaceChildren();
            this.window.style.display = "none";
        }
        if (view) view.resize();
    }
}, html`
    <div class="${style.wrapper}">
        ${Bar.open()}
            ${Button.open().bind("settings")}
                ${icons.gear()}
            ${Button.close}
            ${Button.open().bind("stats")}
                ${icons.stats()}
            ${Button.close}
            ${Button.open().bind("finder")}
                ${icons.finder()}
            ${Button.close}
            <div style="flex: 1"></div>
            ${Button.open().bind("info")}
                ${icons.info()}
            ${Button.close}
        ${Bar.close}
        <div m-id="window" class="${style.window}" style="display: none;">
        </div>
        <div class="${style.body}">
            ${Display().bind("display")}
        </div>
    </div>
    `);

Render((doc, view) => {
    const main = ui();
    main.view(view);
    doc.append(...main.dom);
});