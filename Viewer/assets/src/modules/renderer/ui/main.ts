import { Macro, MacroWrapper, TemplateMap } from "@esm/@/rhu/macro.js";
import { computed, signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import { Render } from "@esm/@root/main/routes/player/index.js";

let disposeController = new AbortController();
export const dispose = {
    get signal() {
        return disposeController.signal;
    } 
};
module.ready();

/* eslint-disable sort-imports */
import { seeker } from "./components/seeker.js";

declare module "@esm/@/rhu/macro.js" {
    interface TemplateMap {
        "ui": UI;
    }
}

const style = Style(({ style }) => {
    const wrapper = style.class`
    width: 100%;
    height: 100%;
    position: relative;
    `;

    const bottom = style.class`
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 50px;
    `;

    const view = style.class`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    `;
    
    return {
        wrapper,
        bottom,
        view
    };
});

class UI extends MacroWrapper<HTMLDivElement> {
    public mount: HTMLDivElement;
    private seeker: TemplateMap["ui.seeker"];
    
    constructor(element: HTMLDivElement, bindings: any) {
        super(element, bindings);
    }
    
    private length = signal(0);
    private test = computed(() => this.length() + 1, [this.length]);

    public init(view: TemplateMap["routes/player.view"]) {
        this.mount.replaceChildren(view.element);

        // Update seeker when time changes
        view.time.on((time) => {
            if (view.replay === undefined) return;
            
            if (!this.seeker.seeking()) {
                this.seeker.value(time / this.length(view.replay.length()));
            }
        }, { signal: dispose.signal });
        
        this.test.on((value) => { this.mount.setAttribute("a", value.toString()); });

        // Update time when seeker changes
        this.seeker.value.on((value) => {
            if (view.replay === undefined) return;

            if (this.seeker.seeking()) {
                view.time(value * this.length());
            }
        });

        // Pause view when seeking
        this.seeker.seeking.on((seeking) => {
            view.pause(seeking);
        });
    }
}

Macro(UI, "ui", //html
    `
    <div rhu-id="mount" class="${style.view}"></div>
    <div class="${style.bottom}">
        ${seeker`rhu-id="seeker"`}
    </div>
    `, {
        element: //html
        `<div class="${style.wrapper}"></div>`
    });

Render((doc, view) => {
    if (disposeController !== undefined) disposeController.abort();
    disposeController = new AbortController();

    const ui = document.createMacro("ui");
    ui.init(view);
    doc.append(ui.element);
});