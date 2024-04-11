import { Constructor, Macro } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";
import { Parser } from "../../../replay/parser.js";
import { Renderer } from "../../../replay/renderer.js";
import { Replay } from "../../../replay/replay.js";
import { FileHandle } from "../../../replay/stream.js";
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

    return {
        wrapper,
        body,
        canvas,
        mount,
        scoreboardMount
    };
});

export interface player extends HTMLDivElement {
    canvas: HTMLCanvasElement;
    mount: HTMLDivElement;
    seeker: seeker;
    scoreboardMount: HTMLDivElement;
    scoreboard: scoreboard;
    
    renderer: Renderer;
    
    path?: string;
    parser?: Parser;
    replay?: Replay;
    pause: boolean;
    live: boolean;
    time: number;
    timescale: number;
    lerp: number;
    prevTime: number;
    frameRate: number;
    seekLength: number;

    update(): void;
    close(): void;
    link(ip: string, port: number): Promise<void>;
    goLive(): void;
    unlink(): void;
    open(path: string): Promise<void>;
}

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "routes/player": player;
    }
}

export const player = Macro((() => {
    const player = function(this: player) {
        this.renderer = new Renderer(this.canvas);

        this.seeker.trigger = (value) => {
            if (this.replay === undefined) return;
            this.time = value * this.seekLength;
        };
        this.seeker.live.onclick = () => {
            if (this.live) {
                this.live = false;
            } else {
                this.goLive();
            }
        };
        this.seeker.pause.onclick = () => {
            this.pause = !this.pause;
            this.seeker.setPause(this.pause);
        };

        const resize = () => {
            const computed = getComputedStyle(this);
            const width = parseInt(computed.width);
            const height = parseInt(computed.height);
            this.canvas.width = width;
            this.canvas.height = height;

            this.renderer.resize(width, height);
        };
        window.addEventListener("resize", resize);
        this.addEventListener("mount", resize);

        this.update();

        (window as any).player = this;
    } as Constructor<player>;
    
    player.prototype.open = async function(path: string) {
        // TODO(randomuserhi): Loading screen prior map loads

        this.path = path;
        const file: FileHandle = {
            path, finite: false
        };
        await window.api.invoke("open", file);
        if (this.parser !== undefined) this.parser.terminate();
        this.parser = new Parser();
        this.parser.addEventListener("eoh", () => {
            console.log("ready");
    
            if (this.replay === undefined) return;

            this.renderer.init(this.replay);

            this.pause = false;
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
        this.replay = await this.parser.parse(file);
    };

    player.prototype.close = function() {
        window.api.send("close");
    };

    player.prototype.link = async function(port) {
        const resp: string | undefined = await window.api.invoke("link", port);
        if (resp !== undefined) {
            // TODO(randomuserhi)
            console.error(`Failed to link: ${resp}`);
        }
    };

    player.prototype.goLive = function() {
        if (this.parser === undefined || this.path === undefined) return;
        window.api.send("goLive", this.path);
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

            const snapshot = this.replay.getSnapshot(this.time);
            if (snapshot !== undefined) {
                const api = this.replay.api(snapshot);
                this.renderer.render(dt / 1000, api);

                if (this.scoreboardMount.style.display !== "none") {
                    this.scoreboard.update(api);
                }
            }

            this.seeker.setValue(this.time / this.seekLength);
            this.seeker.time.childNodes.item(0).textContent = `${msToTime(this.time)} / ${msToTime(this.seekLength)}`; //${(this.seeker.seeking ? `(${msToTime(this.replay.length())})` : "")}

            this.seeker.dot.style.backgroundColor = this.live ? "red" : "#eee";
        }
        this.frameRate = 1000 / dt;


        // TODO(randomuserhi): Method to dispose of loop when player is removed etc... 
        requestAnimationFrame(() => this.update());
    };

    return player;
})(), "routes/player", //html
`
    <div class="${style.body}">
        <canvas class="${style.canvas}" rhu-id="canvas"></canvas>
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