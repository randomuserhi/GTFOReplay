import { html, Macro, MacroElement } from "@esm/@/rhu/macro.js";
import { effect, Signal, signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import * as icons from "@esm/@root/main/global/components/atoms/icons/index.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import { DataStore } from "@esm/@root/replay/datastore.js";
import { Seeker } from "./components/seeker.js";
import { msToTime } from "./helper.js";
import { Debug } from "./hud/debug.js";
import { ReactorObjective } from "./hud/objectives.js";
import { dispose, ui } from "./main.js";
import { Scoreboard } from "./scoreboard.js";

declare module "@esm/@root/replay/datastore.js" {
    interface DataStoreTypes {
        "DisplayState": {
            pause: boolean;
            live: boolean;
        } 
    }
}

module.destructor = () => {
    const display = ui()?.display;
    if (display === undefined) return;

    display.saveState();
};

const style = Style(({ css }) => {
    const wrapper = css.class`
    width: 100%;
    height: 100%;
    position: relative;
    `;

    const bottom = css.class`
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 50px;
    `;

    const view = css.class`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    `;

    const scoreboard = css.class`
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;
    width: 80%;
    max-width: 900px;
    max-height: 500px;
    transform: translate(-50%, -50%);
    `;
    
    return {
        wrapper,
        bottom,
        view,
        scoreboard
    };
});

const controls = Style(({ css }) => {
    const button = css.class`
    color: white;
    padding: 0 15px;
    align-items: center;
    display: flex;
    `;
    css`
    ${button}:focus {
        outline:0;
    }
    `;

    const time = css.class`
    align-items: center;
    display: flex;
    padding: 0 10px;
    `;

    const dot = css.class`
    width: 8px;
    height: 8px;
    background-color: red;
    border-radius: 100px;
    margin: 0 10px; 
    transition: all 200ms;
    `;

    return {
        button,
        time,
        dot
    };
});

export const Display = Macro(class Display extends MacroElement {
    public mount: HTMLDivElement;
    private seeker: Macro<typeof Seeker>;
    private pauseButton: HTMLButtonElement;
    private pauseIcon: Macro<typeof icons.pause>;
    private playIcon: Macro<typeof icons.play>;
    private liveButton: HTMLButtonElement;
    private liveDot: HTMLSpanElement;
    private debug: Macro<typeof Debug>;
    private objective: Macro<typeof ReactorObjective>;
    
    public saveState() {
        const view = this.view();
        if (view === undefined) return;

        DataStore.set("DisplayState", {
            pause: this.pause(),
            live: view.live()
        });
    }

    public restoreState() {
        const view = this.view();
        if (view === undefined) return;

        const state = DataStore.get("DisplayState");
        if (state === undefined) return;
        const { pause, live } = state;

        this.pause(pause);
        view.live(live);
    }

    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);

        this.view.on((view) => {
            if (view === undefined) return;

            this.restoreState();

            this.scoreboard.view(view);
            this.debug.view(view);
            this.objective.view(view);

            this.mount.replaceChildren(...view.dom);

            // Reset pause on new replay
            view.replay.on(() => {
                this.pause(false);
            }, { signal: dispose.signal });

            // Live Button
            this.liveButton.addEventListener("click", () => {
                view.live(!view.live());
                view.canvas.focus();
            });
            view.live.on((value) => this.liveDot.style.backgroundColor = value ? "red" : "#eee", 
                { signal: dispose.signal }
            );

            // Time display
            effect(() => {
                this.time(`${msToTime(view.time())} / ${msToTime(this.length())}`);
            }, [view.time, this.length], { signal: dispose.signal });

            // Pause button
            this.pauseButton.addEventListener("click", () => {
                this.pause(!this.pause());
                view.canvas.focus();
            });
            this.pause.on((value) => {
                view.pause(value);
                if (value) {
                    this.playIcon.svg.style.display = "block";
                    this.pauseIcon.svg.style.display = "none";
                } else {
                    this.playIcon.svg.style.display = "none";
                    this.pauseIcon.svg.style.display = "block";
                }
            });

            // Update seeker when time / length changes
            effect(() => {
                const replay = view.replay();
                if (replay === undefined) return;
            
                if (!this.seeker.seeking()) {
                    this.seeker.value(view.time() / this.length());
                }
            }, [view.time, this.length], { signal: dispose.signal });

            view.length.on((length) => {
                if (!this.seeker.seeking()) {
                    this.length(length);
                }
            }, { signal: dispose.signal });

            // Update time when seeker changes
            this.seeker.value.on((value) => {
                const replay = view.replay();
                if (replay === undefined) return;

                if (this.seeker.seeking()) {
                    view.time(value * this.length());
                }
            });

            // Pause view when seeking
            this.seeker.seeking.on((seeking) => {
                if (seeking) {
                    view.pause(seeking);
                    requestAnimationFrame(() => view.canvas.focus());
                } else {
                    view.pause(this.pause());
                    this.length(view.length());
                }
            });
        }, { signal: dispose.signal });
    }
    
    public pause = signal(false);

    private time: Signal<string>;
    private length = signal(0);

    public scoreboard: Macro<typeof Scoreboard>;

    public view = signal<Macro<typeof View> | undefined>(undefined);
}, () => html`
    <div m-id="mount" class="${style.view}"></div>
    ${Scoreboard().bind("scoreboard").then((macro) => macro.wrapper.classList.add(`${style.scoreboard}`))}
    <div class="${style.bottom}">
        ${Seeker().open().bind("seeker")}
            <button m-id="pauseButton" class="${controls.button}" style="padding: 0 5px;">
                ${icons.pause().bind("pauseIcon")}
                ${icons.play().bind("playIcon")}
            </button>
            <div class="${controls.time}">${html.signal("time", "00:00 / 00:00")}</div>
            <div style="flex: 1; user-drag: none; user-select: none;"></div>
            <button m-id="liveButton" class="${controls.button}">
                <span m-id="liveDot" class="${controls.dot}"></span>
                <span>LIVE</span>
            </button>
        ${Seeker.close}
    </div>
    ${Debug().bind("debug")}
    ${ReactorObjective().bind("objective")}
    `);