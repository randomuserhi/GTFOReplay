import { html, Mutable } from "@/rhu/html.js";
import { Signal, signal } from "@/rhu/signal.js";
import { Style } from "@/rhu/style.js";
import { ReplayApi } from "../../../../../replay/moduleloader.js";
import { Renderer } from "../../../../../replay/renderer.js";
import { Replay, Snapshot } from "../../../../../replay/replay.js";
import { ASL_VM } from "../../../../../replay/vm.js";

const style = Style(({ css }) => {
    const canvas = css.class`
    display: block;
    width: 100%;
    height: 100%;
    `;
    css`
    ${canvas}:focus {
        outline: none;
    }
    `;

    return {
        canvas
    };
});

export const View = () => {
    interface View {
        ready(): void;
        update(): void;
        refresh(): void;
        resize(): void;

        readonly renderer: Renderer;
        readonly replay: Signal<Replay | undefined>;
        readonly time: Signal<number>;
        readonly timescale: Signal<number>; 
        readonly pause: Signal<boolean>;
        readonly frameRate: Signal<number>;
        readonly live: Signal<boolean>;
        readonly length: Signal<number>;
        readonly snapshot: Snapshot | undefined;
        readonly api: Signal<ReplayApi | undefined>;
        readonly canvas: HTMLCanvasElement;
        lerp: number;
    }
    interface Private {
        reset(): void;

        prevTime: number;
    }
    
    const dom = html<Mutable<Private & View>>/**//*html*/`
        <canvas m-id="canvas" class="${style.canvas}" tabindex="-1"></canvas>
        `;
    html(dom).box();
    
    dom.replay = signal<Replay | undefined>(undefined);
    dom.renderer = new Renderer(dom.canvas);

    dom.time = signal(0);
    dom.timescale = signal(1);
    dom.pause = signal(false);
    dom.frameRate = signal(0);
    dom.live = signal(false);
    dom.length = signal(0);
    dom.lerp = 20;
    dom.snapshot = undefined;
    dom.api = signal<ReplayApi | undefined>(undefined);

    dom.resize = function resize() {
        const computed = getComputedStyle(this.canvas);
        const width = parseInt(computed.width);
        const height = parseInt(computed.height);
        this.renderer.resize(width, height);
    };

    dom.refresh = function refresh() {
        this.renderer.refresh(this.canvas, this.replay());
    };

    dom.ready = function ready() {
        const replay = this.replay();
        if (replay === undefined) throw new Error("Received 'eoh', but no replay was present.");
        
        this.reset();

        this.renderer.init(replay);

        requestAnimationFrame(() => this.canvas.focus());
    };

    dom.reset = function reset() {
        this.time(0);
        this.timescale(1);     
        this.length(0);
        this.pause(false);  
    };

    dom.update = function update() {
        if (this.time() < 0) this.time(0);
        
        const now = Date.now();
        const dt = now - this.prevTime;
        this.prevTime = now;
        this.frameRate(1000 / dt);
        
        const replay = this.replay();
        if (replay !== undefined) {
            try {
                this.length(replay.length());

                if (!this.pause()) {
                    if (this.live()) {
                        const time = this.time();
                        this.time(time + (this.length() - time) * dt / 1000 * this.lerp);
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
                console.error(ASL_VM.verboseError(e));
            }
        }

        requestAnimationFrame(() => this.update());
    };

    window.addEventListener("resize", () => {
        dom.resize();
    });
    dom.canvas.addEventListener("mount", () => dom.resize());

    dom.time.guard = (time) => {
        const replay = dom.replay();
        return Math.clamp(time, 0, replay !== undefined ? replay.length() : 0);
    };
    dom.update();

    return dom as html<View>;
};