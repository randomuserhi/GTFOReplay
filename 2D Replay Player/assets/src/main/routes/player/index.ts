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
                const computed = getComputedStyle(this.canvas);
                const width = parseInt(computed.width);
                const height = parseInt(computed.height);
                this.canvas.width = width;
                this.canvas.height = height;

                this.renderer.resize(width, height);
            };
            window.addEventListener("resize", resize);
            this.addEventListener("mount", resize);
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