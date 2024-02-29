import { Constructor, Macro } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";
import { Parser } from "../../replay/parser.js";
import { Renderer } from "../../replay/renderer.js";

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
}

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "routes/player": player;
    }
}

export const player = Macro((() => {
    const player = function(this: player) {
        this.renderer = new Renderer(this.canvas);
        (window as any).renderer = this.renderer;

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

        // dummy load
        (async () => {
            const path = "D:\\GTFO Replays\\R8B1 2024-02-28 01-13";
            console.log(path);
            await window.api.invoke("open", path);
            const parser = new Parser(path);
            parser.addEventListener("end", () => {
                console.log("finished");
                window.api.send("close", path);
        
                //this.renderer.Test(replay.api(replay.getSnapshot(10)!));
            });
            const replay = await parser.parse();
            (window as any).replay = replay;
        })();

        const update = () => {
            this.renderer.render();
            requestAnimationFrame(update);
        }
    } as Constructor<player>;

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