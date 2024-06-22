import { Constructor, Macro } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";
import { ReplayApi } from "../../../replay/moduleloader.js";
import { Parser } from "../../../replay/parser.js";
import { Renderer } from "../../../replay/renderer.js";
import { Replay, Snapshot } from "../../../replay/replay.js";
import { FileHandle } from "../../../replay/stream.js";
import { __version__ } from "../../appinfo.js";
import { bar } from "./components/bar.js";
import { scoreboard } from "./components/scoreboard.js";
import { seeker } from "./components/seeker.js";

const style = Style(({ style }) => {
    const wrapper = style.class`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    `;

    const body = style.class`
    position: relative;
    flex: 1;
    `;

    const canvas = style.class`
    display: block;
    width: 100%;
    height: 100%;
    `;
    style`
    ${canvas}:focus {
        outline: none;
    }
    `;

    const mount = style.class`
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 50px;
    `;

    const scoreboardMount = style.class`
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;
    width: 80%;
    max-width: 900px;
    max-height: 500px;
    transform: translate(-50%, -50%);
    `;

    const window = style.class`
    height: 100%;
    flex-shrink: 0;
    width: auto;
    background-color: #1f1f29;
    overflow-y: auto;
    overflow-x: hidden;
    `;

    const empty = style.class`
    position: absolute;
    z-index: 1000;
    width: 100%;
    height: 100%;
    background-color: black;
    display: flex;
    align-items: center;
    justify-content: center;
    `;

    const loader = style.class`
    width: 65px;
    aspect-ratio: 1;
    position: relative;
    `;
    style`
    ${loader}:before,
    ${loader}:after {
        content: "";
        position: absolute;
        border-radius: 50px;
        box-shadow: 0 0 0 3px inset #fff;
        animation: l5 2.5s infinite;
    }
    ${loader}:after {
        animation-delay: -1.25s;
        border-radius: 0;
    }
    @keyframes l5{
        0%    {inset:0    35px 35px 0   }
        12.5% {inset:0    35px 0    0   }
        25%   {inset:35px 35px 0    0   }
        37.5% {inset:35px 0    0    0   }
        50%   {inset:35px 0    0    35px}
        62.5% {inset:0    0    0    35px}
        75%   {inset:0    0    35px 35px}
        87.5% {inset:0    0    35px 0   }
        100%  {inset:0    35px 35px 0   }
    }
    `;

    const watermark = style.class`
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 5px 10px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    z-index: 10000;
    `;

    return {
        wrapper,
        body,
        canvas,
        mount,
        scoreboardMount,
        bar,
        window,
        empty,
        loader,
        watermark
    };
});

export interface player extends HTMLDivElement {
    canvas: HTMLCanvasElement;
    mount: HTMLDivElement;
    seeker: seeker;
    bar: bar;
    window: HTMLDivElement;
    scoreboardMount: HTMLDivElement;
    scoreboard: scoreboard;
    loadButton: HTMLButtonElement;
    loading: HTMLDivElement;
    cover: HTMLDivElement;
    
    renderer: Renderer;
    
    path?: string;
    parser?: Parser;
    replay?: Replay;
    ready: boolean;
    pause: boolean;
    live: boolean;
    time: number;
    snapshot: Snapshot | undefined;
    api: ReplayApi | undefined;
    timescale: number;
    lerp: number;
    prevTime: number;
    frameRate: number;
    seekLength: number;

    resize(): void;
    update(): void;
    close(): void;
    link(ip: string, port: number): Promise<void>;
    goLive(): void;
    unlink(): void;
    open(path?: string): Promise<void>;

    loadedNode?: Node;
    load(node?: Node): void;
}

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "routes/player": player;
    }
}

export const player = Macro((() => {
    const player = function(this: player) {
        this.renderer = new Renderer(this.canvas);
        this.ready = false;

        this.bar.init(this);

        this.seeker.trigger = (value) => {
            if (this.replay === undefined) return;
            this.time = value * this.seekLength;
            requestAnimationFrame(() => this.canvas.focus());
        };
        this.seeker.live.onclick = () => {
            if (this.live) {
                this.live = false;
            } else {
                this.goLive();
            }
            this.canvas.focus();
        };
        this.seeker.pause.onclick = () => {
            this.pause = !this.pause;
            this.seeker.setPause(this.pause);
            this.canvas.focus();
        };

        this.loadButton.onclick = () => {
            (window as any)._file.click();
        };

        this.resize = () => {
            const computed = getComputedStyle(this.canvas);
            const width = parseInt(computed.width);
            const height = parseInt(computed.height);
            this.renderer.resize(width, height);
        };
        window.addEventListener("resize", this.resize);
        this.addEventListener("mount", this.resize);

        this.update();

        (window as any).player = this;
    } as Constructor<player>;
    
    player.prototype.load = function(node) {
        if (this.replay === undefined) return;
        if (!this.ready) return;
        if (this.loadedNode === node) node = undefined;
        this.loadedNode = node;
        if (node !== undefined) {
            this.window.replaceChildren(node);
            this.window.style.display = "block";
        } else {
            this.canvas.focus();
            this.window.replaceChildren();
            this.window.style.display = "none";
        }
        this.resize();
    };

    player.prototype.open = async function(path?: string) {
        this.load();

        this.cover.style.display = "flex";
        this.loadButton.style.display = "none";
        this.loading.style.display = "block";

        this.ready = false;
        this.path = path;
        const file: FileHandle = {
            path, finite: false
        };
        await window.api.invoke("open", file);
        if (this.parser !== undefined) this.parser.terminate();
        this.parser = new Parser();
        this.replay = undefined;
        this.bar.clear();
        this.parser.addEventListener("eoh", () => {
            console.log("ready");
    
            if (this.replay === undefined) return;

            this.cover.style.display = "none";

            this.bar.reset();
            this.renderer.init(this.replay);
            this.canvas.focus();
            
            this.ready = true;
            this.pause = false;
            this.seeker.setPause(false);
            this.live = false;
            this.time = 0;
            this.timescale = 1;
            this.lerp = 20; // TODO(randomuserhi): Should be adjustable for various tick rates
            this.seekLength = 1;
            this.prevTime = Date.now();
            this.mount.style.display = "block";
        });
        this.parser.addEventListener("end", () => {
            window.api.send("close", file);
        });

        if (path !== undefined) {
            this.unlink(); // Unlink if loading a regular file.
        } else {
            this.goLive(); // Acknowledge awaiting for bytes from game
        }

        this.replay = await this.parser.parse(file);
    };

    player.prototype.close = function() {
        this.replay = undefined;
        window.api.send("close");
    };

    player.prototype.link = async function(ip, port) {
        const resp: string | undefined = await window.api.invoke("link", ip, port);
        if (resp !== undefined) {
            // TODO(randomuserhi)
            console.error(`Failed to link: ${resp}`);
            return;
        }
        window.api.send("goLive");
    };

    player.prototype.goLive = function() {
        if (this.parser === undefined) return;
        this.live = true;
    };

    player.prototype.unlink = async function() {
        window.api.send("unlink");
    };

    function msToTime(duration: number) {
        const milliseconds: string | number = Math.floor((duration % 1000) / 100);
        let seconds: string | number = Math.floor((duration / 1000) % 60),
            minutes: string | number = Math.floor((duration / (1000 * 60)) % 60),
            hours: string | number = Math.floor((duration / (1000 * 60 * 60)) % 24);
        
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        
        return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    }

    player.prototype.update = function() {
        if (this.time < 0) this.time = 0;

        const now = Date.now();
        const dt = now - this.prevTime;
        if (this.replay !== undefined) {
            this.prevTime = now;

            //this.time = 1000000;
            const length = this.replay.length();

            if (!this.seeker.seeking) {
                if (this.live) this.time += (length - this.time) * dt / 1000 * this.lerp; // For live replay -> lerp to latest time stamp
                else if (!this.pause) this.time += dt * this.timescale;

                this.seekLength = length;
            } else {
                this.live = false;
            }
            
            if (this.time > length) this.time = length;

            if (this.snapshot?.time !== this.time) {
                this.snapshot = this.replay.getSnapshot(this.time);
            }

            if (this.snapshot !== undefined) {
                this.api = this.replay.api(this.snapshot);
                this.renderer.render(dt / 1000, this.api);

                if (this.scoreboardMount.style.display !== "none") {
                    this.scoreboard.update(this.api);
                }
            }

            this.seeker.setValue(this.time / this.seekLength);
            this.seeker.time.childNodes.item(0).textContent = `${msToTime(this.time)} / ${msToTime(this.seekLength)}`; //${(this.seeker.seeking ? `(${msToTime(this.replay.length())})` : "")}

            this.seeker.dot.style.backgroundColor = this.live ? "red" : "#eee";
        
            if (this.ready) this.bar.update();
        }
        this.frameRate = 1000 / dt;

        // TODO(randomuserhi): Method to dispose of loop when player is removed etc... 
        requestAnimationFrame(() => this.update());
    };

    return player;
})(), "routes/player", //html
`
    ${bar`rhu-id="bar"`}
    <div rhu-id="window" class="${style.window}" style="display: none;">
    </div>
    <div class="${style.body}">
        <div rhu-id="cover" class="${style.empty}">
            <div class="${style.watermark}">${__version__}</div>
            <video style="position: absolute; width: 100%; height: 100%; object-fit: cover;" muted autoplay loop playsinline disablepictureinpicture>
                <source src="https://storage.googleapis.com/gtfo-prod-v1/Trailer_for_website_Pro_Res_2_H_264_24fef05909/Trailer_for_website_Pro_Res_2_H_264_24fef05909.mp4" type="video/mp4">
            </video>   
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;">
                <button rhu-id="loadButton" class="gtfo-button">LOAD REPLAY</button>
                <div rhu-id="loading" style="display: none;" class="${style.loader}"></div>
            </div>
        </div>
        <canvas tabindex="0" class="${style.canvas}" rhu-id="canvas"></canvas>
        <div rhu-id="mount" class="${style.mount}" style="display: none">
            ${seeker`rhu-id="seeker"`}
        </div>
        <div rhu-id="scoreboardMount" class="${style.scoreboardMount}" style="display: none">
            ${scoreboard`rhu-id="scoreboard"`}
        </div>
    </div>
    `, {
    element: //html
        `<div class="${style.wrapper}"></div>`
});
