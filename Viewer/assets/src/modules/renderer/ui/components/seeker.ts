import { html, Macro, MacroElement } from "@esm/@/rhu/macro.js";
import { signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import { dispose } from "../main.js";

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
        mount,
        wrapper,
        bar,
        visualBar,
        visualProgress
    };
});

export const seeker = Macro(class Seeker extends MacroElement {
    public seeking = signal(false);
    public hovering = signal(false);

    public mount: HTMLDivElement;
    private interact: HTMLDivElement;
    private bar: HTMLDivElement;
    private progress: HTMLDivElement;
    
    value = signal(0);
    
    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);

        this.value.guard = (value) => Math.clamp01(value);
        this.value.on((value) => this.progress.style.width = `${Math.clamp01(value) * 100}%`);

        const doSeek = (x: number) => {
            if (this.seeking()) {
                const rect = this.interact.getBoundingClientRect();
                this.value((x - rect.left) / this.bar.clientWidth);
            }
        };
        window.addEventListener("mousedown", (evt) => {
            const rect = this.interact.getBoundingClientRect();
            if (evt.button === 0 && 
                evt.clientX > rect.left && evt.clientX < rect.left + this.interact.clientWidth &&
                evt.clientY > rect.top && evt.clientY < rect.top + this.interact.clientHeight) {
                this.seeking(true);
                doSeek(evt.clientX);
            }
        }, { signal: dispose.signal });
        window.addEventListener("mouseup", (evt) => { 
            if (evt.button === 0) {
                this.seeking(false);
                doSeek(evt.clientX);
            }
        }, { signal: dispose.signal });
        window.addEventListener("mousemove", (evt) => {
            doSeek(evt.clientX);
        }, { signal: dispose.signal });

        this.interact.addEventListener("mouseover", () => {
            this.hovering(true);
        });
        this.interact.addEventListener("mouseout", () => {
            this.hovering(false);
        });
    }
}, html`
    <div class="${style.wrapper}">
        <div m-id="interact" class="${style.bar}">
            <div m-id="bar" class="${style.visualBar}">
                <div m-id="progress" class="${style.visualProgress}">
                </div>
            </div>
        </div>
        <div m-id="mount" class="${style.mount}">
        </div>
    </div>
    `);