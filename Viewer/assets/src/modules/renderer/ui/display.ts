import { html, Macro, MacroElement } from "@esm/@/rhu/macro.js";
import { Signal, signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import * as icons from "@esm/@root/main/global/components/atoms/icons/index.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import { Seeker } from "./components/seeker.js";
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

const controls = Style(({ style }) => {
    const button = style.class`
    color: white;
    padding: 0 15px;
    align-items: center;
    display: flex;
    `;
    style`
    ${button}:focus {
        outline:0;
    }
    `;

    const time = style.class`
    align-items: center;
    display: flex;
    padding: 0 10px;
    `;

    const dot = style.class`
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

function msToTime(value: number) {
    const milliseconds: string | number = Math.floor((value % 1000) / 100);
    let seconds: string | number = Math.floor((value / 1000) % 60),
        minutes: string | number = Math.floor((value / (1000 * 60)) % 60),
        hours: string | number = Math.floor((value / (1000 * 60 * 60)) % 24);
            
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
            
    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

export const Display = Macro(class Display extends MacroElement {
    public mount: HTMLDivElement;
    private seeker: Macro<typeof Seeker>;
    private pauseButton: HTMLButtonElement;
    private pauseIcon: Macro<typeof icons.pause>;
    private playIcon: Macro<typeof icons.play>;
    private liveButton: HTMLButtonElement;
    private liveDot: HTMLSpanElement;
    
    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);
    }
    
    private time: Signal<string>;
    private pause = signal(false);
    private length = signal(0);

    public init(view: Macro<typeof View>) {
        this.mount.replaceChildren(...view.dom);

        // Live Button
        this.liveButton.addEventListener("click", () => {
            view.live(!view.live());
        });
        view.live.on((value) => this.liveDot.style.backgroundColor = value ? "red" : "#eee", 
            { signal: dispose.signal }
        );

        // Time display
        view.time.on((value) => {
            this.time(`${msToTime(value)} / ${msToTime(this.length())}`);
        }, { signal: dispose.signal });

        // Pause button
        this.pauseButton.addEventListener("click", () => {
            this.pause(!this.pause());
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

        // Update seeker when time changes
        view.time.on((time) => {
            if (view.replay === undefined) return;
            
            if (!this.seeker.seeking()) {
                this.seeker.value(time / this.length(view.replay.length()));
            }
        }, { signal: dispose.signal });

        // Update time when seeker changes
        this.seeker.value.on((value) => {
            if (view.replay === undefined) return;

            if (this.seeker.seeking()) {
                view.time(value * this.length());
            }
        });

        // Pause view when seeking
        this.seeker.seeking.on((seeking) => {
            if (seeking) view.pause(seeking);
            else view.pause(this.pause());
        });
    }
}, html`
    <div m-id="mount" class="${style.view}"></div>
    <div class="${style.bottom}">
        ${Seeker.open().bind("seeker")}
            <button m-id="pauseButton" class="${controls.button}" style="padding: 0 5px;">
                ${icons.pause().bind("pauseIcon")}
                ${icons.play().bind("playIcon")}
            </button>
            <div class="${controls.time}">${Macro.signal("time", "00:00 / 00:00")}</div>
            <div style="flex: 1; user-drag: none; user-select: none;"></div>
            <button m-id="liveButton" class="${controls.button}">
                <span m-id="liveDot" class="${controls.dot}"></span>
                <span>LIVE</span>
            </button>
        ${Seeker.close}
    </div>
    `);