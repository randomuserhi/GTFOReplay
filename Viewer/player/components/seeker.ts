import { Constructor, Macro } from "@/rhu/macro.js";
import { Signal } from "@/rhu/signal.js";
import { Style } from "@/rhu/style.js";
import * as icons from "../../../global/components/atoms/icons/index.js";

const style = Style(({ style }) => {
    const wrapper = style.class`
    position: relative;
    width: 100%;
    height: 100%;
    `;

    const bar = style.class`
    cursor: pointer;
    position: absolute;
    top: 0px;
    height: 16px;
    width: 100%;
    `;

    const visualBar = style.class`
    position: absolute;
    bottom: 0px;
    height: 3px;
    width: 100%;
    background-color: #eee;
    transition: height 100ms;
    `;
    style`
    ${bar}:hover ${visualBar} {
        height: 5px;
    }
    `;

    const visualProgress = style.class`
    height: 100%;
    width: 0;
    background-color: #f00;
    `;

    const mount = style.class`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: calc(100% - 16px);
    display: flex;
    flex-direction: row;

    color: white;
    background-color: rgba(0, 0, 0, 0.5);
    
    user-select: none;
    user-drag: none;
    `;

    const time = style.class`
    align-items: center;
    display: flex;
    padding: 0 10px;
    `;

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

    return {
        button,
        time,
        mount,
        wrapper,
        bar,
        visualBar,
        visualProgress
    };
});

export interface seeker extends HTMLDivElement {
    seeking: boolean;
    hovering: boolean;
    
    pause: HTMLButtonElement;
    live: HTMLButtonElement;
    dot: HTMLSpanElement;
    time: Signal<string>;
    interact: HTMLDivElement;
    bar: HTMLDivElement;
    progress: HTMLDivElement;
    readonly value: number;

    trigger?: (value: number) => void;
    setValue(value: number): void;
    setPause(value: boolean): void;
}

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "routes/player.seeker": seeker;
    }
}

export const seeker = Macro((() => {
    const seeker = function(this: seeker) {
        const doSeek = (x: number) => {
            if (this.seeking) {
                const rect = this.interact.getBoundingClientRect();
                const value = (x - rect.left) / this.bar.clientWidth;
                this.trigger?.call(this, value);
            }
        };
        
        this.seeking = false;
        window.addEventListener("mousedown", (evt) => {
            const rect = this.interact.getBoundingClientRect();
            if (evt.button === 0 && 
                evt.clientX > rect.left && evt.clientX < rect.left + this.interact.clientWidth &&
                evt.clientY > rect.top && evt.clientY < rect.top + this.interact.clientHeight) {
                this.seeking = true;
                doSeek(evt.clientX);
            }
        });
        window.addEventListener("mouseup", (evt) => { 
            if (evt.button === 0) {
                this.seeking = false;
                doSeek(evt.clientX);
            }
        });

        this.hovering = false;
        this.interact.addEventListener("mouseover", () => {
            this.hovering = true;
        });
        this.interact.addEventListener("mouseout", () => {
            this.hovering = false;
        });

        window.addEventListener("mousemove", (evt) => {
            doSeek(evt.clientX);
        });
    } as Constructor<seeker>;

    seeker.prototype.setValue = function(value) {
        (this as any).value = value;
        this.progress.style.width = `${Math.clamp01(value) * 100}%`;
    };

    seeker.prototype.setPause = function(value) {
        this.pause.replaceChildren(document.createMacro(value ? icons.play : icons.pause));
    };

    return seeker;
})(), "routes/player.seeker", //html
`
    <div rhu-id="interact" class="${style.bar}">
        <div rhu-id="bar" class="${style.visualBar}">
            <div rhu-id="progress" class="${style.visualProgress}">
            </div>
        </div>
    </div>
    <div class="${style.mount}">
        <button rhu-id="pause" class="${style.button}" style="padding: 0 5px;">
            ${icons.pause}
        </button>
        <div class="${style.time}">${Macro.signal("time", "00:00 / 00:00")}</div>
        <div style="flex: 1; user-drag: none; user-select: none;"></div>
        <button rhu-id="live" class="${style.button}">
            <span rhu-id="dot" style="
                width: 8px;
                height: 8px;
                background-color: red;
                border-radius: 100px;
                margin: 0 10px; 
                transition: all 200ms;"></span>
            <span>LIVE</span>
        </button>
    </div>
    `, {
    element: //html
        `<div class="${style.wrapper}"></div>`
});