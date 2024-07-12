import { html, Macro, MacroElement } from "@/rhu/macro.js";
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

export const View = Macro(class View extends MacroElement {
    readonly renderer: Renderer;
    replay?: Replay;
    canvas: HTMLCanvasElement;

    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);
        this.canvas = dom[0] as HTMLCanvasElement;
    
        this.renderer = new Renderer(this.canvas);

        window.addEventListener("resize", () => {
            this.resize();
        });
        this.canvas.addEventListener("mount", () => this.resize());

        this.time.guard = (time) => Math.clamp(time, 0, this.replay !== undefined ? this.replay.length() : 0);
        this.update();
    }

    private resize() {
        const computed = getComputedStyle(this.canvas);
        const width = parseInt(computed.width);
        const height = parseInt(computed.height);
        this.renderer.resize(width, height);
    }

    public refresh() {
        this.renderer.refresh(this.canvas, this.replay);
    }

    public ready() {
        if (this.replay === undefined) throw new Error("Received 'eoh', but no replay was present.");
        
        this.reset();

        this.renderer.init(this.replay);
        this.canvas.focus();
    }

    time = signal(0);
    timescale = signal(1);
    pause = signal(false);
    frameRate = signal(0);

    private reset() {
        this.resize();
        
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
            if (!this.pause()) this.time(this.time() + dt * this.timescale());
            const time = this.time();

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
}, html`<canvas class="${style.canvas}"></canvas>`);