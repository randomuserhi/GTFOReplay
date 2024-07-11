import { Macro, MacroWrapper, TemplateMap } from "@esm/@/rhu/macro.js";
import { computed, signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import { seeker } from "./components/seeker.js";
import { dispose } from "./main.js";

declare module "@esm/@/rhu/macro.js" {
    interface TemplateMap {
        "ui.display": Display;
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

class Display extends MacroWrapper<HTMLDivElement> {
    public mount: HTMLDivElement;
    private seeker: TemplateMap["ui.display.seeker"];
    
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

export const display = Macro(Display, "ui.display", //html
    `
    <div rhu-id="mount" class="${style.view}"></div>
    <div class="${style.bottom}">
        ${seeker`rhu-id="seeker"`}
    </div>
    `, {
        element: //html
        `<div class="${style.wrapper}"></div>`
    });