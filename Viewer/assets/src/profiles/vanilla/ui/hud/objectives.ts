import { html, Mutable } from "@esm/@/rhu/html.js";
import { signal, Signal } from "@esm/@/rhu/signal.js";
import { ClassName, Style } from "@esm/@/rhu/style.js";
import * as icons from "@esm/@root/main/global/components/atoms/icons/index.js";
import { ReplayApi } from "@esm/@root/replay/moduleloader.js";
import { View } from "../../../../main/routes/player/components/view/index.js";
import { Factory } from "../../library/factory.js";
import { msToTime } from "../helper.js";
import { dispose } from "../main.js";

const style = Style(({ css }) => {
    const wrapper = css.class`
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    box-sizing: border-box;
    width: min(620px, calc(100% - 32px));
    padding: 14px 20px 16px;
    border-radius: 8px;
    background: #111820ed;
    box-shadow: 0 6px 24px #00000040;
    font-family: Oxanium, "Segoe UI", "Microsoft YaHei UI", sans-serif;
    font-size: 14px;
    line-height: 1.4;
    font-variant-numeric: tabular-nums;
    text-align: center;
    display: none;
    align-items: center;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
    `;

    const controls = css.class<{button: ClassName; active: ClassName;}>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    color: #c2cbd5;
    font-family: "Segoe UI", "Microsoft YaHei UI", sans-serif;
    font-size: 12px;
    font-weight: 600;
    overflow-wrap: anywhere;
    user-select: none;
    `;
    controls.button = css.class`
    display: grid;
    place-items: center;
    flex: 0 0 28px;
    width: 28px;
    height: 28px;
    padding: 5px;
    border: 1px solid #35404b;
    border-radius: 4px;
    background: transparent;
    color: #778491;
    pointer-events: auto;
    `;
    controls.active = css.class`
    color: #edf0f4;
    cursor: pointer;
    `;
    const heading = css.class`
    font-size: clamp(15px, 1.5vw, 19px);
    font-weight: 600;
    line-height: 1.35;
    letter-spacing: .025em;
    text-wrap: balance;
    overflow-wrap: anywhere;
    `;
    const timeWrapper = css.class`
    display: flex;
    font-size: 22px;
    font-weight: 500;
    line-height: 1.2;
    color: #edf0f4;
    `;
    const progressWrapper = css.class`
    position: relative;
    width: 100%;
    height: 6px;
    margin-top: 4px;
    border-radius: 3px;
    overflow: hidden;
    `;
    const progressBackground = css.class`
    position: absolute;
    inset: 0;
    background: #35404b;
    `;
    const progressForeground = css.class`
    position: absolute;
    inset: 0 auto 0 0;
    width: 0%;
    border-radius: 3px;
    `;
    const codeWrapper = css.class`
    display: none;
    align-items: baseline;
    justify-content: center;
    flex-wrap: wrap;
    gap: 4px 10px;
    width: 100%;
    padding-top: 4px;
    color: #c2cbd5;
    font-size: 12px;
    overflow-wrap: anywhere;
    `;
    const code = css.class`
    color: #83ccf4;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: .06em;
    `;

    const warmup = css.class`
    `;

    const verify = css.class`
    `;
    
    const intense = css.class`
    `;

    css`
    ${warmup}${wrapper} {
        color: #e5ba68;
    }
    ${verify}${wrapper} {
        color: #83ccf4;
    }
    ${intense}${wrapper} {
        color: #ff8580;
    }
    
    ${warmup} ${progressForeground} {
        background-color: #e5ba68;
    }
    ${verify} ${progressForeground} {
        background-color: #83ccf4;
    }
    ${intense} ${progressForeground} {
        background-color: #ff8580;
    }

    ${wrapper}[data-event="survival"] ${controls} {
        color: inherit;
        font-family: inherit;
        font-size: 16px;
        line-height: 1.4;
    }
    ${controls.button}[hidden] { display: none; }
    ${controls.active}:hover { background: #28303b; }
    ${controls.button}:focus-visible { outline: 2px solid #e5ba68; outline-offset: 2px; }
    ${heading}:empty { display: none; }
    ${verify} ${codeWrapper} {
        display: flex;
    }
    `;

    return {
        wrapper,
        controls,
        heading,
        timeWrapper,
        progressWrapper,
        progressBackground,
        progressForeground,
        codeWrapper,
        code,
        warmup,
        verify,
        intense
    };
});

export const ObjectiveDisplay = () => {
    interface ReactorObjective {
        readonly index: Signal<number>;
        readonly view: Signal<html<typeof View> | undefined>;
    }
    interface Private {
        readonly wrapper: HTMLDivElement;
        readonly progressWrapper: HTMLDivElement;
        readonly timeWrapper: HTMLDivElement;
        readonly progress: HTMLDivElement;
        readonly controls: HTMLDivElement;
        readonly left: HTMLButtonElement;
        readonly right: HTMLButtonElement;
    }

    const reactorText = signal("REACTOR_111");
    const title = signal("");
    const time = signal("");
    const codeText = signal("");
    const code = signal("");

    const dom = html<Mutable<Private & ReactorObjective>>/**//*html*/`
        <div m-id="wrapper" class="${style.wrapper}">
            <div m-id="controls" class="${style.controls}">
                <button type="button" aria-label="Previous objective" m-id="left" class="${style.controls.button}">${icons.chevronLeft()}</button>
                <span style="min-width: 100px;">${reactorText}</span>
                <button type="button" aria-label="Next objective" m-id="right" class="${style.controls.button}">${icons.chevronRight()}</button>
            </div>
            <div class="${style.heading}">${title}</div>
            <div m-id="timeWrapper" class="${style.timeWrapper}"><span>${time}</span></div>
            <div m-id="progressWrapper" class="${style.progressWrapper}" role="progressbar" aria-label="Objective progress" aria-valuemin="0" aria-valuemax="100">
                <div class="${style.progressBackground}"></div>
                <div m-id="progress" class="${style.progressForeground}"></div>
            </div>
            <div class="${style.codeWrapper}">
                <span>${codeText}</span>
                <span class="${style.code}">${code}</span>
            </div>
        </div>
		`;
    html(dom).box();

    dom.view = signal<html<typeof View> | undefined>(undefined);
    dom.index = signal(0);

    let api: ReplayApi | undefined = undefined;

    const setProgress = (value: number) => {
        const percent = Number.isFinite(value) ? Math.max(0, Math.min(100, value * 100)) : 0;
        dom.progress.style.width = `${percent}%`;
        dom.progressWrapper.setAttribute("aria-valuenow", `${Math.round(percent)}`);
    };

    const hide = () => {
        dom.wrapper.style.display = "none";
    };

    const update = (inApi: ReplayApi | undefined) => {
        api = inApi;

        if (api === undefined) {
            hide();
            return;
        }

        const reactors = api.getOrDefault("Vanilla.Objectives.Reactor", Factory("Map"));
        const activeReactors = [...reactors.values()].filter(r => r.status !== "Inactive_idle" && r.status !== "Active_idle");

        const survivalEvents = api.getOrDefault("Vanilla.WardenEvents.Survival", Factory("Map"));
        const activeSurvivalEvents = [...survivalEvents.values()].filter(e => e.state !== "Inactive" && e.state !== "Completed");

        const totalNumEvents = activeReactors.length + activeSurvivalEvents.length;

        dom.left.hidden = dom.right.hidden = totalNumEvents <= 1;

        let index = dom.index();
        if (index < 0 || index >= totalNumEvents) {
            index = 0;
        }
        dom.index(index);
        dom.left.disabled = index === 0;
        dom.right.disabled = index >= totalNumEvents - 1;

        if (index === 0) {
            dom.left.classList.remove(`${style.controls.active}`);
        } else {
            dom.left.classList.add(`${style.controls.active}`);
        }
        if (index === totalNumEvents - 1) {
            dom.right.classList.remove(`${style.controls.active}`);
        } else {
            dom.right.classList.add(`${style.controls.active}`);
        }
        
        if (totalNumEvents === 0) {
            hide();
            return;
        }

        dom.wrapper.style.display = "flex";

        if (index < activeReactors.length) {
            dom.wrapper.dataset.event = "reactor";
            dom.timeWrapper.style.display = "flex";
            dom.progressWrapper.style.display = "block";
    
            const reactor = activeReactors[index];
    
            reactorText(`REACTOR_${reactor.serialNumber}`);
    
            time(`TIME LEFT: ${msToTime(reactor.waveDuration * (1 - reactor.waveProgress) * 1000, true, false)}`);
            setProgress(reactor.waveProgress);
    
            switch (reactor.status) {
            case "Startup_intro":{
                dom.wrapper.classList.add(`${style.warmup}`);
                dom.wrapper.classList.remove(`${style.verify}`);
                dom.wrapper.classList.remove(`${style.intense}`);
                dom.timeWrapper.style.display = "flex";
    
                title(`REACTOR STARTUP TEST (${reactor.wave + 1} of ${reactor.numWaves}) WARMING UP..`);
            } break;
            case "Startup_waitForVerify":{
                dom.wrapper.classList.remove(`${style.warmup}`);
                dom.wrapper.classList.add(`${style.verify}`);
                dom.wrapper.classList.remove(`${style.intense}`);
                dom.timeWrapper.style.display = "flex";
    
                title(`SECURITY VERIFICATION (${reactor.wave + 1} of ${reactor.numWaves})`);
    
                const codeTerminalSerial = reactor.codeTerminalSerial[reactor.wave];
                if (codeTerminalSerial === 65535) {
                    codeText("REACTOR CODE:");
                    code(`${reactor.codes[reactor.wave].toUpperCase()}`);
                } else {
                    codeText("REACTOR CODE IN LOG FILE ON");
                    code(`TERMINAL_${codeTerminalSerial}`);
                }
            } break;
            case "Startup_complete": {
                dom.wrapper.classList.add(`${style.warmup}`);
                dom.wrapper.classList.remove(`${style.verify}`);
                dom.wrapper.classList.remove(`${style.intense}`);
                dom.timeWrapper.style.display = "none";
    
                title(`REACTOR STARTUP COMPLETE`);
                setProgress(1);
            } break;
    
            case "Shutdown_intro": {
                dom.wrapper.classList.add(`${style.warmup}`);
                dom.wrapper.classList.remove(`${style.verify}`);
                dom.wrapper.classList.remove(`${style.intense}`);
                dom.timeWrapper.style.display = "none";
    
                title(`REACTOR SHUTTING DOWN ...`);
            } break;
            case "Shutdown_waitForVerify": {
                dom.wrapper.classList.remove(`${style.warmup}`);
                dom.wrapper.classList.add(`${style.verify}`);
                dom.wrapper.classList.remove(`${style.intense}`);
                dom.timeWrapper.style.display = "none";
    
                title(`SECURITY VERIFICATION TO START SHUTDOWN`);
    
                const codeTerminalSerial = reactor.codeTerminalSerial[reactor.wave];
                if (codeTerminalSerial === 65535) {
                    codeText("REACTOR CODE:");
                    code(`${reactor.codes[reactor.wave].toUpperCase()}`);
                } else {
                    codeText("REACTOR CODE IN LOG FILE ON");
                    code(`TERMINAL_${codeTerminalSerial}`);
                }
            } break;
            case "Shutdown_puzzleChaos": {
                dom.wrapper.classList.remove(`${style.warmup}`);
                dom.wrapper.classList.remove(`${style.verify}`);
                dom.wrapper.classList.add(`${style.intense}`);
                dom.timeWrapper.style.display = "none";
    
                title(`COMPLETE SCAN TO FINISH REACTOR SHUTDOWN`);
                setProgress(1);
            } break;
            case "Shutdown_complete": {
                dom.wrapper.classList.add(`${style.warmup}`);
                dom.wrapper.classList.remove(`${style.verify}`);
                dom.wrapper.classList.remove(`${style.intense}`);
                dom.timeWrapper.style.display = "none";
    
                title(`REACTOR SHUTDOWN COMPLETE`);
                setProgress(1);
            } break;
    
            default: {
                dom.wrapper.classList.remove(`${style.warmup}`);
                dom.wrapper.classList.remove(`${style.verify}`);
                dom.wrapper.classList.add(`${style.intense}`);
                dom.timeWrapper.style.display = "flex";
    
                title(`REACTOR PERFORMING HIGH INTENSITY (${reactor.wave + 1}/${reactor.numWaves})`);
            } break;
            }
        } 
        index -= activeReactors.length;
        if (index < 0) return;
        if (index < activeSurvivalEvents.length) {
            dom.wrapper.dataset.event = "survival";
            dom.timeWrapper.style.display = "flex";
            dom.progressWrapper.style.display = "none";

            const event = activeSurvivalEvents[index];

            title(``);
            time(`${msToTime(event.timeLeft * 1000, true, false)}`);

            switch(event.state) {
            case "Survival": {
                dom.wrapper.classList.remove(`${style.warmup}`);
                dom.wrapper.classList.remove(`${style.verify}`);
                dom.wrapper.classList.add(`${style.intense}`);

                reactorText(`${event.survivalText}`);
            } break;
            case "TimeToActivate": {
                dom.wrapper.classList.add(`${style.warmup}`);
                dom.wrapper.classList.remove(`${style.verify}`);
                dom.wrapper.classList.remove(`${style.intense}`);

                reactorText(`${event.toActivateText}`);
            } break;
            }

            if (reactorText().trim() === "") {
                reactorText(`WARDEN SURVIVAL EVENT`);
            }
        }
        
    };

    dom.view.on((view) => {
        if (view === undefined) return;

        view.api.on((api) => {
            update(api);
        }, { signal: dispose.signal });

    }, { signal: dispose.signal });

    dom.left.addEventListener("click", () => {
        if (!dom.left.classList.contains(`${style.controls.active}`)) return;
        dom.index(dom.index() - 1);
        update(api);
    }, { signal: dispose.signal });

    dom.right.addEventListener("click", () => {
        if (!dom.right.classList.contains(`${style.controls.active}`)) return;
        dom.index(dom.index() + 1);
        update(api);
    }, { signal: dispose.signal });

    return dom as html<ReactorObjective>;
};