import { html, Macro, MacroElement } from "@esm/@/rhu/macro.js";
import { signal, Signal } from "@esm/@/rhu/signal.js";
import { ClassName, Style } from "@esm/@/rhu/style.js";
import * as icons from "@esm/@root/main/global/components/atoms/icons/index.js";
import { ReplayApi } from "@esm/@root/replay/moduleloader.js";
import { View } from "../../../../main/routes/player/components/view/index.js";
import { Factory } from "../../library/factory.js";
import { msToTime } from "../helper.js";
import { dispose } from "../main.js";

const style = Style(({ style }) => {
    const wrapper = style.class`
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

    const controls = style.class<{
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

    controls.button = style.class`
    padding-bottom: 5px;
    color: #444;
    `;
    
    controls.active = style.class`
    color: #fff;
    cursor: pointer;
    `;

    const timeWrapper = style.class`
    display: flex;
    gap: 10px;
    font-size: 18px;
    color: white;
    `;

    const progressWrapper = style.class`
    position: relative;
    width: 80%;
    max-width: 800px;
    height: 2px;
    margin-top: 5px;
    margin-bottom: 5px;
    `;

    const progressBackground = style.class`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50px;
    background-color: white;
    `;

    const progressForeground = style.class`
    position: absolute;
    top: 0;
    left: 0;
    width: 0%;
    height: 100%;
    border-radius: 50px;
    `;

    const codeWrapper = style.class`
    display: none;
    gap: 10px;
    font-size: 18px;
    color: white;
    `;

    const code = style.class`
    color: #34abeb;
    `;

    const warmup = style.class`
    `;

    const verify = style.class`
    `;
    
    const intense = style.class`
    `;

    style`
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

export const ReactorObjective = Macro(class ReactorObjective extends MacroElement {
    private wrapper: HTMLDivElement;
    private progress: HTMLDivElement;
    private controls: HTMLDivElement;
    private reactor: Signal<string>;
    private title: Signal<string>;
    private timeWrapper: HTMLDivElement;
    private time: Signal<string>;
    private codeText: Signal<string>;
    private code: Signal<string>;
    private left: HTMLSpanElement;
    private right: HTMLSpanElement;
    
    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);

        const update = (api: ReplayApi | undefined) => {
            this.api = api;

            if (api === undefined) {
                this.hide();
                return;
            }

            const reactors = api.getOrDefault("Vanilla.Objectives.Reactor", Factory("Map"));
            const activeReactors = [...reactors.values()].filter(r => r.status !== "Inactive_idle" && r.status !== "Active_idle");
            
            if (activeReactors.length > 1) {
                this.controls.style.display = "flex";
            } else {
                this.controls.style.display = "none";
            }

            let reactorIndex = this.reactorIndex();
            if (reactorIndex < 0 || reactorIndex >= activeReactors.length) {
                reactorIndex = 0;
            }
            this.reactorIndex(reactorIndex);

            if (reactorIndex === 0) {
                this.left.classList.remove(`${style.controls.active}`);
            } else {
                this.left.classList.add(`${style.controls.active}`);
            }
            if (reactorIndex === activeReactors.length - 1) {
                this.right.classList.remove(`${style.controls.active}`);
            } else {
                this.right.classList.add(`${style.controls.active}`);
            }
            
            const reactor = activeReactors[reactorIndex];
            if (reactor === undefined) {
                this.hide();
                return;
            }

            this.reactor(`REACTOR_${reactor.serialNumber}`);

            this.wrapper.style.display = "flex";
            this.time(`${msToTime(reactor.waveDuration * (1 - reactor.waveProgress) * 1000, true, false)}`);
            this.progress.style.width = `${reactor.waveProgress * 100}%`;

            switch (reactor.status) {
            case "Startup_intro":{
                this.wrapper.classList.add(`${style.warmup}`);
                this.wrapper.classList.remove(`${style.verify}`);
                this.wrapper.classList.remove(`${style.intense}`);
                this.timeWrapper.style.display = "flex";

                this.title(`REACTOR STARTUP TEST (${reactor.wave + 1} of ${reactor.numWaves}) WARMING UP..`);
            } break;
            case "Startup_waitForVerify":{
                this.wrapper.classList.remove(`${style.warmup}`);
                this.wrapper.classList.add(`${style.verify}`);
                this.wrapper.classList.remove(`${style.intense}`);
                this.timeWrapper.style.display = "flex";

                this.title(`SECURITY VERIFICATION (${reactor.wave + 1} of ${reactor.numWaves})`);

                const codeTerminalSerial = reactor.codeTerminalSerial[reactor.wave];
                if (codeTerminalSerial === 65535) {
                    this.codeText("REACTOR CODE:");
                    this.code(`${reactor.codes[reactor.wave].toUpperCase()}`);
                } else {
                    this.codeText("REACTOR CODE IN LOG FILE ON");
                    this.code(`TERMINAL_${codeTerminalSerial}`);
                }
            } break;
            case "Startup_complete": {
                this.wrapper.classList.add(`${style.warmup}`);
                this.wrapper.classList.remove(`${style.verify}`);
                this.wrapper.classList.remove(`${style.intense}`);
                this.timeWrapper.style.display = "none";

                this.title(`REACTOR STARTUP COMPLETE`);
                this.progress.style.width = `100%`;
            } break;

            case "Shutdown_intro": {
                this.wrapper.classList.add(`${style.warmup}`);
                this.wrapper.classList.remove(`${style.verify}`);
                this.wrapper.classList.remove(`${style.intense}`);
                this.timeWrapper.style.display = "none";

                this.title(`REACTOR SHUTTING DOWN ..`);
            } break;
            case "Shutdown_waitForVerify": {
                this.wrapper.classList.remove(`${style.warmup}`);
                this.wrapper.classList.add(`${style.verify}`);
                this.wrapper.classList.remove(`${style.intense}`);
                this.timeWrapper.style.display = "none";

                this.title(`SECURITY VERIFICATION TO START SHUTDOWN`);

                const codeTerminalSerial = reactor.codeTerminalSerial[reactor.wave];
                if (codeTerminalSerial === 65535) {
                    this.codeText("REACTOR CODE:");
                    this.code(`${reactor.codes[reactor.wave].toUpperCase()}`);
                } else {
                    this.codeText("REACTOR CODE IN LOG FILE ON");
                    this.code(`TERMINAL_${codeTerminalSerial}`);
                }
            } break;
            case "Shutdown_puzzleChaos": {
                this.wrapper.classList.remove(`${style.warmup}`);
                this.wrapper.classList.remove(`${style.verify}`);
                this.wrapper.classList.add(`${style.intense}`);
                this.timeWrapper.style.display = "none";

                this.title(`COMPLETE SCAN TO FINISH REACTOR SHUTDOWN`);
                this.progress.style.width = `100%`;
            } break;
            case "Shutdown_complete": {
                this.wrapper.classList.add(`${style.warmup}`);
                this.wrapper.classList.remove(`${style.verify}`);
                this.wrapper.classList.remove(`${style.intense}`);
                this.timeWrapper.style.display = "none";

                this.title(`REACTOR SHUTDOWN COMPLETE`);
                this.progress.style.width = `100%`;
            } break;

            default: {
                this.wrapper.classList.remove(`${style.warmup}`);
                this.wrapper.classList.remove(`${style.verify}`);
                this.wrapper.classList.add(`${style.intense}`);
                this.timeWrapper.style.display = "flex";

                this.title(`REACTOR PERFORMING HIGH INTENSITY (${reactor.wave + 1}/${reactor.numWaves})`);
            } break;
            }
        };

        this.view.on((view) => {
            if (view === undefined) return;

            view.api.on((api) => {
                update(api);
            }, { signal: dispose.signal });

        }, { signal: dispose.signal });

        this.left.addEventListener("click", () => {
            if (!this.left.classList.contains(`${style.controls.active}`)) return;
            this.reactorIndex(this.reactorIndex() - 1);
            update(this.api);
        }, { signal: dispose.signal });

        this.right.addEventListener("click", () => {
            if (!this.right.classList.contains(`${style.controls.active}`)) return;
            this.reactorIndex(this.reactorIndex() + 1);
            update(this.api);
        }, { signal: dispose.signal });
    }

    private hide() {
        this.wrapper.style.display = "none";
    }

    private api: ReplayApi | undefined = undefined;
    public reactorIndex = signal<number>(0);
    public view = signal<Macro<typeof View> | undefined>(undefined);
}, html`
    <div m-id="wrapper" class="${style.wrapper}">
        <div m-id="controls" class="${style.controls}">
            <span m-id="left" class="${style.controls.button}">${icons.chevronLeft()}</span>
            <span>${Macro.signal("reactor", "REACTOR_111")}</span>
            <span m-id="right" class="${style.controls.button}">${icons.chevronRight()}</span>
        </div>
        <div class="${style.progressWrapper}">
            <div class="${style.progressBackground}"></div>
            <div m-id="progress" class="${style.progressForeground}"></div>
        </div> <!-- progress bar -->
        <div>
            <span>${Macro.signal("title", "")}</span>
        </div>
        <div m-id="timeWrapper" class="${style.timeWrapper}">
            <span>TIME LEFT:</span>
            <span>${Macro.signal("time", "")}</span>
        </div>
        <div class="${style.codeWrapper}">
            <span>${Macro.signal("codeText", "")}</span>
            <span class="${style.code}">${Macro.signal("code", "")}</span>
        </div>
    </div>
`);