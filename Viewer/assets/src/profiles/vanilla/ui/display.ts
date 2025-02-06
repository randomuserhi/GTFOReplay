import { html, Mutable } from "@esm/@/rhu/html.js";
import { effect, Signal, signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import * as icons from "@esm/@root/main/global/components/atoms/icons/index.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import { DataStore } from "@esm/@root/replay/datastore.js";
import { Seeker } from "./components/seeker.js";
import { msToTime } from "./helper.js";
import { Debug } from "./hud/debug.js";
import { ObjectiveDisplay } from "./hud/objectives.js";
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

export const Display = () => {
    interface Display {
        saveState(): void;
        restoreState(): void;

        readonly pause: Signal<boolean>;

        readonly view: Signal<html<typeof View> | undefined>;
        readonly scoreboard: html<typeof Scoreboard>;
        readonly mount: HTMLDivElement;
    }
    interface Private {
        readonly seeker: html<typeof Seeker>;
        readonly pauseButton: HTMLButtonElement;
        readonly pauseIcon: html<typeof icons.pause>;
        readonly playIcon: html<typeof icons.play>;
        readonly liveButton: HTMLButtonElement;
        readonly liveDot: HTMLSpanElement;
        readonly debug: html<typeof Debug>;
        readonly objective: html<typeof ObjectiveDisplay>;
    }

    const time = signal("00:00 / 00:00");
    const length = signal(0);

    const dom = html<Mutable<Private & Display>>/**//*html*/`
        <div m-id="mount" class="${style.view}"></div>
        ${html.bind(Scoreboard(), "scoreboard").transform((macro) => macro.wrapper.classList.add(`${style.scoreboard}`))}
        <div class="${style.bottom}">
            ${html.open(Seeker()).bind("seeker")}
                <button m-id="pauseButton" class="${controls.button}" style="padding: 0 5px;">
                    ${html.bind(icons.pause(), "pauseIcon")}
                    ${html.bind(icons.play(), "playIcon")}
                </button>
                <div class="${controls.time}">${time}</div>
                <div style="flex: 1; user-drag: none; user-select: none;"></div>
                <button m-id="liveButton" class="${controls.button}">
                    <span m-id="liveDot" class="${controls.dot}"></span>
                    <span>LIVE</span>
                </button>
            ${html.close()}
        </div>
        ${html.bind(Debug(), "debug")}
        ${html.bind(ObjectiveDisplay(), "objective")}
        `;
    html(dom).box();
    
    dom.view = signal<html<typeof View> | undefined>(undefined);
    dom.pause = signal(false);

    dom.saveState = function saveState() {
        const view = this.view();
        if (view === undefined) return;

        DataStore.set("DisplayState", {
            pause: this.pause(),
            live: view.live()
        });
    };

    dom.restoreState = function restoreState() {
        const view = this.view();
        if (view === undefined) return;

        const state = DataStore.get("DisplayState");
        if (state === undefined) return;
        const { pause, live } = state;

        this.pause(pause);
        view.live(live);
    };

    dom.view.on((view) => {
        if (view === undefined) return;

        dom.restoreState();

        dom.scoreboard.view(view);
        dom.debug.view(view);
        dom.objective.view(view);

        dom.mount.replaceChildren(...view);

        // Reset pause on new replay
        view.replay.on(() => {
            dom.pause(false);
        }, { signal: dispose.signal });

        // Live Button
        dom.liveButton.addEventListener("click", () => {
            view.live(!view.live());
            view.canvas.focus();
        });
        view.live.on((value) => dom.liveDot.style.backgroundColor = value ? "red" : "#eee", 
            { signal: dispose.signal }
        );

        // Time display
        effect(() => {
            time(`${msToTime(view.time())} / ${msToTime(length())}`);
        }, [view.time, length], { signal: dispose.signal });

        // Pause button
        dom.pauseButton.addEventListener("click", () => {
            dom.pause(!dom.pause());
            view.canvas.focus();
        });
        dom.pause.on((value) => {
            view.pause(value);
            if (value) {
                (html(dom.playIcon).firstNode as HTMLElement).style.display = "block";
                (html(dom.pauseIcon).firstNode as HTMLElement).style.display = "none";
            } else {
                (html(dom.playIcon).firstNode as HTMLElement).style.display = "none";
                (html(dom.pauseIcon).firstNode as HTMLElement).style.display = "block";
            }
        });

        // Update seeker when time / length changes
        effect(() => {
            const replay = view.replay();
            if (replay === undefined) return;
        
            if (!dom.seeker.seeking()) {
                dom.seeker.value(view.time() / length());
            }
        }, [view.time, length], { signal: dispose.signal });

        view.length.on((inLength) => {
            if (!dom.seeker.seeking()) {
                length(inLength);
            }
        }, { signal: dispose.signal });

        // Update time when seeker changes
        dom.seeker.value.on((value) => {
            const replay = view.replay();
            if (replay === undefined) return;

            if (dom.seeker.seeking()) {
                view.time(value * length());
            }
        });

        // Pause view when seeking
        dom.seeker.seeking.on((seeking) => {
            if (seeking) {
                view.pause(seeking);
                requestAnimationFrame(() => view.canvas.focus());
            } else {
                view.pause(dom.pause());
                length(view.length());
            }
        });
    }, { signal: dispose.signal });

    return dom as html<Display>;
};