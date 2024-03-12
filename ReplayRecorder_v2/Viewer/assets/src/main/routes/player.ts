import { Constructor, Macro } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";
import { Parser } from "../../replay/parser.js";
import { Renderer } from "../../replay/renderer.js";
import { Replay } from "../../replay/replay.js";
import { FileHandle } from "../../replay/stream.js";

const style = Style(({ style }) => {
    const wrapper = style.class`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    `;

    const body = style.class`
    flex: 1;
    `;

    const canvas = style.class`
    display: block;
    width: 100%;
    height: 100%;
    `;

    return {
        wrapper,
        body,
        canvas
    };
});

export interface player extends HTMLDivElement {
    canvas: HTMLCanvasElement;

    renderer: Renderer;

    parser?: Parser;
    replay?: Replay;
    pause: boolean;
    time: number;
    lerp: number;
    prevTime: number;
    frameRate: number;
    update(): void;
    close(): void;
    link(ip: string, port: number): Promise<void>;
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
        const file: FileHandle = {
            path, finite: false
        };
        await window.api.invoke("open", file);
        this.parser = new Parser();
        this.parser.addEventListener("eoh", () => {
            console.log("ready");
    
            if (this.replay === undefined) return;

            this.renderer.init(this.replay);

            this.pause = false;
            this.time = 0;
            this.lerp = 20; // TODO(randomuserhi): Should be adjustable for various tick rates
            this.prevTime = Date.now();
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

    player.prototype.unlink = async function() {
        window.api.send("unlink");
    };

    player.prototype.update = function() {
        if (this.time < 0) this.time = 0;

        const now = Date.now();
        const dt = now - this.prevTime;
        if (this.replay !== undefined) {
            this.prevTime = now;

            if (!this.pause) this.time += dt;
            //this.time = 1000000;
            const length = this.replay.length();
            //this.time += (length - this.time) * dt / 1000 * this.lerp; // For live replay -> lerp to latest time stamp
            if (this.time > length) this.time = length;

            const snapshot = this.replay.getSnapshot(this.time);
            if (snapshot !== undefined) {
                const api = this.replay.api(snapshot);
                this.renderer.render(dt / 1000, api);
            }
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
    </div>
    `, {
    element: //html
        `<div class="${style.wrapper}"></div>`
});