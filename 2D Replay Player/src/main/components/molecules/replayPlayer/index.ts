declare namespace RHU {
    interface Modules {
        "components/molecules/replayPlayer": Macro.Template<"molecules/replayPlayer">;
    }

    namespace Macro {
        interface TemplateMap {
            "molecules/replayPlayer": Molecules.ReplayPlayer;
        }
    }
}

declare namespace Molecules {
    interface ReplayPlayer extends HTMLDivElement {
        canvas: HTMLCanvasElement;

        // webgl
        gl: gl;

        // Time related properties
        prevT: number;
        timescale: number;

        render: (t: number) => void;
    }
}

RHU.module(new Error(), "components/molecules/replayPlayer", { 
    Macro: "rhu/macro", style: "components/molecules/replayPlayer/style",
    gl: "webgl2"
}, function({ 
    Macro, style,
    gl
}) {
    const replayPlayer = Macro((() => {
        const replayPlayer = function(this: Molecules.ReplayPlayer) {
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

            this.render(0);
        } as RHU.Macro.Constructor<Molecules.ReplayPlayer>;

        replayPlayer.prototype.render = function(t) {
            const delta = (t - this.prevT) * this.timescale;
            this.prevT = t;
            
            requestAnimationFrame((t) => this.render(t));
        };

        return replayPlayer;
    })(), "molecules/replayPlayer", //html
    `
        <canvas rhu-id="canvas"></canvas>
        `, {
        element: //html
            `<div class="${style.wrapper}"></div>`
    });

    return replayPlayer;
});