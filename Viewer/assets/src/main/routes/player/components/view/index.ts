import { Macro, MacroWrapper } from "@/rhu/macro.js";
import { signal } from "@/rhu/signal.js";
import { Style } from "@/rhu/style.js";
import { ReplayApi } from "@esm/@root/replay/moduleloader.js";
import { Renderer } from "../../../../../replay/renderer.js";
import { Replay, Snapshot } from "../../../../../replay/replay.js";

const style = Style(({ style }) => {
    const canvas = style.class`
    display: block;
    width: 100%;
    height: 100%;
    `;
    style`
    ${canvas}:focus {
        outline: none;
    }
    `;

    return {
        canvas
    };
});

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "routes/player.view": View;
    }
}

class View extends MacroWrapper<HTMLCanvasElement> {
    readonly renderer: Renderer;
    replay?: Replay;

    constructor(element: HTMLCanvasElement, bindings: any) {
        super(element, bindings);
    
        this.renderer = new Renderer(this.element);

        window.addEventListener("resize", () => this.resize());
        this.element.addEventListener("mount", () => this.resize());

        this.time.guard = (time) => Math.clamp(time, 0, this.replay !== undefined ? this.replay.length() : 0);
        this.update();
    }

    private resize() {
        const computed = getComputedStyle(this.element);
        const width = parseInt(computed.width);
        const height = parseInt(computed.height);
        this.renderer.resize(width, height);
    }

    public ready() {
        if (this.replay === undefined) throw new Error("Received 'eoh', but no replay was present.");
        
        this.reset();

        this.renderer.init(this.replay);
        this.element.focus();
    }

    time = signal(0);
    timescale = signal(1);
    frameRate = signal(0);

    private reset() {
        this.time(0);
        this.timescale(1);       
    }
    
    private prevTime: number;
    public snapshot: Snapshot | undefined;
    public api: ReplayApi;
    private update() {
        if (this.time() < 0) this.time(0);

        const now = Date.now();
        const dt = now - this.prevTime;
        this.prevTime = now;
        this.frameRate(1000 / dt);
        if (this.replay !== undefined) {
            const time = this.time(this.time() + dt * this.timescale());

            if (this.snapshot?.time !== time) {
                this.snapshot = this.replay.getSnapshot(time);
            }

            if (this.snapshot !== undefined) {
                this.api = this.replay.api(this.snapshot);
                this.renderer.render(dt / 1000, this.api);
            }
        }

        requestAnimationFrame(() => this.update());
    }
}

export const view = Macro(View, "routes/player.view", "", {
    element: //html
        `<canvas class="${style.canvas}"></canvas>`,
});