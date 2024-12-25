import { html, Mutable } from "@esm/@/rhu/html.js";
import { Signal, signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import { dispose } from "../main.js";

const style = Style(({ css }) => {
    const wrapper = css.class`
    position: relative;
    width: 100%;
    height: 100%;
    `;

    const bar = css.class`
    cursor: pointer;
    position: absolute;
    top: 0px;
    height: 16px;
    width: 100%;
    `;

    const visualBar = css.class`
    position: absolute;
    bottom: 0px;
    height: 3px;
    width: 100%;
    background-color: #eee;
    transition: height 100ms;
    `;
    css`
    ${bar}:hover ${visualBar} {
        height: 5px;
    }
    `;

    const visualProgress = css.class`
    height: 100%;
    width: 0;
    background-color: #f00;
    `;

    const mount = css.class`
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

    return {
        mount,
        wrapper,
        bar,
        visualBar,
        visualProgress
    };
});

export const Seeker = () => {
    interface Seeker {
        readonly seeking: Signal<boolean>;
        readonly hovering: Signal<boolean>;

        readonly mount: HTMLDivElement;
        readonly value: Signal<number>;
    }
    interface Private {
        readonly interact: HTMLDivElement;
        readonly bar: HTMLDivElement;
        readonly progress: HTMLDivElement;
    }

    const dom = html<Mutable<Private & Seeker>>/**//*html*/`
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
        `;
    html(dom).box().children((children) => {
        dom.mount.append(...children);
    });

    dom.seeking = signal(false);
    dom.hovering = signal(false);
    dom.value = signal(0);

    dom.value.guard = Math.clamp01;
    dom.value.on((value) => dom.progress.style.width = `${Math.clamp01(value) * 100}%`);

    const doSeek = (x: number) => {
        if (dom.seeking()) {
            const rect = dom.interact.getBoundingClientRect();
            dom.value((x - rect.left) / dom.bar.clientWidth);
        }
    };
    window.addEventListener("mousedown", (evt) => {
        const rect = dom.interact.getBoundingClientRect();
        if (evt.button === 0 && 
            evt.clientX > rect.left && evt.clientX < rect.left + dom.interact.clientWidth &&
            evt.clientY > rect.top && evt.clientY < rect.top + dom.interact.clientHeight) {
            dom.seeking(true);
            doSeek(evt.clientX);
        }
    }, { signal: dispose.signal });
    window.addEventListener("mouseup", (evt) => { 
        if (evt.button === 0) {
            dom.seeking(false);
            doSeek(evt.clientX);
        }
    }, { signal: dispose.signal });
    window.addEventListener("mousemove", (evt) => {
        doSeek(evt.clientX);
    }, { signal: dispose.signal });

    dom.interact.addEventListener("mouseover", () => {
        dom.hovering(true);
    });
    dom.interact.addEventListener("mouseout", () => {
        dom.hovering(false);
    });

    return dom as html<Seeker>;
};