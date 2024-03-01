import { Constructor, Macro } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";
import { Parser } from "../../replay/parser.js";
import { Renderer } from "../../replay/renderer.js";
import { Replay } from "../../replay/replay.js";

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

    replay?: Replay;
    time: number;
    prevTime: number;
    update: () => void;
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

        (window as any).player = this;

        // dummy load
        (async () => {
            const path = "D:\\GTFO Replays\\R1A1 2024-03-01 22-19";
            console.log(path);
            await window.api.invoke("open", path);
            const parser = new Parser(path);
            parser.addEventListener("end", () => {
                console.log("finished");
                window.api.send("close", path);
        
                if (this.replay === undefined) return;

                this.renderer.init(this.replay);

                this.time = 0;
                this.prevTime = Date.now();
                this.update();
            });
            this.replay = await parser.parse();
        })();
    } as Constructor<player>;
    
    player.prototype.update = function() {
        if (this.replay === undefined) return;

        const now = Date.now();
        const dt = now - this.prevTime;
        this.prevTime = now;

        this.time += dt;

        const snapshot = this.replay.getSnapshot(this.time);
        if (snapshot !== undefined) {
            const api = this.replay.api(snapshot);
            this.renderer.render(api);
        }
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