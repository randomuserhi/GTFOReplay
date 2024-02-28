declare namespace RHU {
    interface Modules {
        "routes/player": Macro.Template<"routes/player">;
    }

    namespace Macro {
        interface TemplateMap {
            "routes/player": Routes.player;
        }
    }
}

declare namespace Routes {
    interface player extends HTMLDivElement {
        canvas: HTMLCanvasElement;
        renderer: Renderer;
    }
}

RHU.module(new Error(), "routes/player", { 
    Macro: "rhu/macro", style: "routes/player/style"
}, function({ 
    Macro, style
}) {
    const player = Macro((() => {
        const player = function(this: Routes.player) {
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
                const path = "./assets/GTFOReplays/R8B1 2024-02-28 01-13";
                await window.api.invoke("open", path);
                const parser = new Parser(path);
                parser.addEventListener("end", () => {
                    console.log("finished");
                    window.api.send("close", path);
            
                    this.renderer.Test(replay.api(replay.getSnapshot(10)!));
                });
                const replay = await parser.parse();
            })();
        } as RHU.Macro.Constructor<Routes.player>;

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

    return player;
});