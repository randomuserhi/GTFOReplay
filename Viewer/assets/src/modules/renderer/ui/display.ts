import { html, Macro, MacroElement } from "@esm/@/rhu/macro.js";
import { computed, signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import { seeker } from "./components/seeker.js";
import { dispose } from "./main.js";

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


export const display = Macro(class Display extends MacroElement {
    public mount: HTMLDivElement;
    private seeker: Macro<typeof seeker>;
    
    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);
    }
    
    private length = signal(0);
    private test = computed(() => this.length() + 1, [this.length]);

    public init(view: Macro<typeof View>) {
        this.mount.replaceChildren(...view.dom);

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
}, html`
    <div m-id="mount" class="${style.view}"></div>
    <div class="${style.bottom}">
        ${seeker().bind("seeker")}
    </div>
    `);