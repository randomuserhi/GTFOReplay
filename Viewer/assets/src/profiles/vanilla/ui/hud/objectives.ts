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
    top: 15px;
    padding: 10px;
    width: 100%;
    min-height: 100px;

    font-size: 18px;
    text-align: center;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 5px;
    `;

    const controls = css.class<{
        button: ClassName;
        active: ClassName;
    }>`
    margin-top: 5px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;

    color: white;

    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
    `;

    controls.button = css.class`
    padding-bottom: 5px;
    color: #444;
    `;
    
    controls.active = css.class`
    color: #fff;
    cursor: pointer;
    `;

    const timeWrapper = css.class`
    display: flex;
    gap: 10px;
    font-size: 18px;
    color: white;
    `;

    const progressWrapper = css.class`
    display: block;
    position: relative;
    width: 80%;
    max-width: 800px;
    height: 2px;
    margin-top: 5px;
    margin-bottom: 5px;
    `;

    const progressBackground = css.class`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50px;
    background-color: white;
    `;

    const progressForeground = css.class`
    position: absolute;
    top: 0;
    left: 0;
    width: 0%;
    height: 100%;
    border-radius: 50px;
    `;

    const codeWrapper = css.class`
    display: none;
    gap: 10px;
    font-size: 18px;
    color: white;
    `;

    const code = css.class`
    color: #34abeb;
    `;

    const warmup = css.class`
    `;

    const verify = css.class`
    `;
    
    const intense = css.class`
    `;

    css`
    ${warmup}${wrapper} {
        color: orange;
    }
    ${verify}${wrapper} {
        color: #34abeb;
    }
    ${intense}${wrapper} {
        color: #ff3030;
    }
    
    ${warmup} ${progressForeground} {
        background-color: orange;
    }
    ${verify} ${progressForeground} {
        background-color: #34abeb;
    }
    ${intense} ${progressForeground} {
        background-color: #ff3030;
    }

    ${verify} ${codeWrapper} {
        display: flex;
    }
    `;

    return {
        wrapper,
        controls,
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
        readonly left: HTMLSpanElement;
        readonly right: HTMLSpanElement;
    }

    const reactorText = signal("REACTOR_111");
    const title = signal("");
    const time = signal("");
    const codeText = signal("");
    const code = signal("");

    const dom = html<Mutable<Private & ReactorObjective>>/**//*html*/`
        <div m-id="wrapper" class="${style.wrapper}">
            <div m-id="controls" class="${style.controls}">
                <span m-id="left" class="${style.controls.button}">${icons.chevronLeft()}</span>
                <span>${reactorText}</span>
                <span m-id="right" class="${style.controls.button}">${icons.chevronRight()}</span>
            </div>
            <div m-id="progressWrapper" class="${style.progressWrapper}">
                <div class="${style.progressBackground}"></div>
                <div m-id="progress" class="${style.progressForeground}"></div>
            </div> <!-- progress bar -->
            <div>
                <span>${title}</span>
            </div>
            <div m-id="timeWrapper" class="${style.timeWrapper}">
                <span>${time}</span>
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

        if (totalNumEvents > 1) {
            dom.controls.style.display = "flex";
        } else {
            dom.controls.style.display = "none";
        }

        let index = dom.index();
        if (index < 0 || index >= totalNumEvents) {
            index = 0;
        }
        dom.index(index);

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
            dom.timeWrapper.style.display = "flex";
            dom.progressWrapper.style.display = "block";
    
            const reactor = activeReactors[index];
    
            reactorText(`REACTOR_${reactor.serialNumber}`);
    
            time(`TIME LEFT: ${msToTime(reactor.waveDuration * (1 - reactor.waveProgress) * 1000, true, false)}`);
            dom.progress.style.width = `${reactor.waveProgress * 100}%`;
    
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
                dom.progress.style.width = `100%`;
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
                dom.progress.style.width = `100%`;
            } break;
            case "Shutdown_complete": {
                dom.wrapper.classList.add(`${style.warmup}`);
                dom.wrapper.classList.remove(`${style.verify}`);
                dom.wrapper.classList.remove(`${style.intense}`);
                dom.timeWrapper.style.display = "none";
    
                title(`REACTOR SHUTDOWN COMPLETE`);
                dom.progress.style.width = `100%`;
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
            dom.timeWrapper.style.display = "flex";
            dom.progressWrapper.style.display = "none";

            const event = activeSurvivalEvents[index];

            time(`${msToTime(event.timeLeft * 1000, true, false)}`);

            switch(event.state) {
            case "Survival": {
                dom.wrapper.classList.remove(`${style.warmup}`);
                dom.wrapper.classList.remove(`${style.verify}`);
                dom.wrapper.classList.add(`${style.intense}`);

                title(`${event.survivalText}`);
            } break;
            case "TimeToActivate": {
                dom.wrapper.classList.add(`${style.warmup}`);
                dom.wrapper.classList.remove(`${style.verify}`);
                dom.wrapper.classList.remove(`${style.intense}`);

                title(`${event.toActivateText}`);
            } break;
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