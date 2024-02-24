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

        // webgl
        gl: gl;
    }
}

RHU.module(new Error(), "routes/player", { 
    Macro: "rhu/macro", style: "routes/player/style",
    gl: "webgl2"
}, function({ 
    Macro, style,
    gl
}) {
    const player = Macro((() => {
        const player = function(this: Routes.player) {
            const resize = () => {
                const computed = getComputedStyle(this.canvas);
                const width = parseInt(computed.width);
                const height = parseInt(computed.height);
                this.canvas.width = width;
                this.canvas.height = height;
            };
            window.addEventListener("resize", resize);
            this.addEventListener("mount", resize);

            const _gl = this.canvas.getContext("webgl2");
            if (_gl) {
                this.gl = new gl(_gl);
            } else {
                // TODO(randomuserhi): no web gl support
                throw new Error("No webgl support.");
            }
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