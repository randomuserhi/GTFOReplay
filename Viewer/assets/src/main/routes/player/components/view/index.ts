import { html, Macro, MacroElement } from "@/rhu/macro.js";
import { signal } from "@/rhu/signal.js";
import { Style } from "@/rhu/style.js";
import { ReplayApi } from "../../../../../replay/moduleloader.js";
import { Renderer } from "../../../../../replay/renderer.js";
import { Replay, Snapshot } from "../../../../../replay/replay.js";
import { ASL_VM } from "../../../../../replay/vm.js";

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
    replay = signal<Replay | undefined>(undefined);
    canvas: HTMLCanvasElement;

    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);
        this.canvas = dom[0] as HTMLCanvasElement;
    
        this.renderer = new Renderer(this.canvas);

        window.addEventListener("resize", () => {
            this.resize();
        });
        this.canvas.addEventListener("mount", () => this.resize());

        this.time.guard = (time) => {
            const replay = this.replay();
            return Math.clamp(time, 0, replay !== undefined ? replay.length() : 0);
        };
        this.update();
    }

    public resize() {
        const computed = getComputedStyle(this.canvas);
        const width = parseInt(computed.width);
        const height = parseInt(computed.height);
        this.renderer.resize(width, height);
    }

    public refresh() {
        this.renderer.refresh(this.canvas, this.replay());
    }

    public ready() {
        const replay = this.replay();
        if (replay === undefined) throw new Error("Received 'eoh', but no replay was present.");
        
        this.reset();

        this.renderer.init(replay);

        requestAnimationFrame(() => this.canvas.focus());
    }

    time = signal(0);
    timescale = signal(1);
    pause = signal(false);
    frameRate = signal(0);
    live = signal(false);
    lerp = 20;
    
    private reset() {
        this.time(0);
        this.timescale(1);     
        this.pause(false);  
    }
    
    private prevTime: number;
    public snapshot: Snapshot | undefined;
    public api = signal<ReplayApi | undefined>(undefined);
    private update() {
        if (this.time() < 0) this.time(0);
        
        const now = Date.now();
        const dt = now - this.prevTime;
        this.prevTime = now;
        this.frameRate(1000 / dt);
        
        const replay = this.replay();
        if (replay !== undefined) {
            try {
                if (!this.pause()) {
                    if (this.live()) {
                        const time = this.time();
                        this.time(time + (replay.length() - time) * dt / 1000 * this.lerp);
                    } else this.time(this.time() + dt * this.timescale());
                }
                const time = this.time();

                if (this.snapshot?.time !== time) {
                    this.snapshot = replay.getSnapshot(time);
                }

                if (this.snapshot !== undefined) {
                    const api = replay.api(this.snapshot);
                    this.api(api);
                    this.renderer.render(dt / 1000, api);
                }
            } catch (e) {
                ASL_VM.verboseError(e);
            }
        }

        requestAnimationFrame(() => this.update());
    }
}, html`<canvas class="${style.canvas}" tabindex="-1"></canvas>`);