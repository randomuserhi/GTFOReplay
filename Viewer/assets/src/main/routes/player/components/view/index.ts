import { html, Mutable } from "@/rhu/html.js";
import { always, Signal, signal } from "@/rhu/signal.js";
import { Style } from "@/rhu/style.js";
import { ReplayApi } from "../../../../../replay/moduleloader.js";
import { Renderer } from "../../../../../replay/renderer.js";
import { Replay, Snapshot } from "../../../../../replay/replay.js";
import { ASL_VM } from "../../../../../replay/vm.js";
import * as icons from "../../../../global/components/atoms/icons/index.js";

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

    const logs = css.class`
    position: absolute;
    top: 0px;
    width: 100%;
    color: white;
    background-color: red;
    z-index: 1000;
    `;

    const log = css.class`
    padding: 3px 7px;
    display: flex;
    `;

    const logText = css.class`
    cursor: pointer;
    `;
    css`
    ${logText}:hover {
        text-decoration: underline;
    }
    `;

    const cross = css.class`
    padding: 0 3px;
    color: white;
    `;

    return {
        canvas,
        logs,
        log,
        logText,
        cross
    };
});

export const View = () => {
    interface View {
        ready(): void;
        update(): void;
        refresh(): void;
        resize(): void;
        
        addLog(message: string): void;
        clearLogs(): void;

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
    
    const logs = signal<string[]>([], always);
    const logList = html.map(logs, undefined, (kv, el?: html<{message: Signal<string>; text: HTMLSpanElement; close: HTMLButtonElement, index: number}>) => {
        const [k,v] = kv;
        
        if (el === undefined) {
            el = html`
            <div class="${style.log}">
                <span m-id="text" class="${style.logText}">${html.bind(signal(""), "message")}</span>
                <span style="flex: 1;"></span>
                <button m-id="close" class="${style.cross}">${icons.cross()}</button>
            </div>
            `;

            el.text.addEventListener("click", () => {
                window.api.openDevTools();
            });

            el.close.addEventListener("click", () => {
                if (el?.index === undefined) return;
                const e = logs();
                e.splice(el.index, 1);
                logs(e);
            });
        }

        el.index = k;
        el.message(v);

        return el;
    });

    const dom = html<Mutable<Private & View>>/**//*html*/`
        <div class="${style.logs}">${logList}</div>
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
    
    dom.addLog = (message) => {
        const l = logs();
        l.unshift(message);
        logs(l);
    };

    dom.clearLogs = () => {
        logs([]);
    };
    
    dom.update();

    return dom as html<View>;
};