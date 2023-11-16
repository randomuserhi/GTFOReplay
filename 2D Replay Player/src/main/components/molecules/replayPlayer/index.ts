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

        // Time related properties
        prevT: number;
        timescale: number;

        // Three.js properties
        renderer: THREE.WebGLRenderer;
        scene: THREE.Scene;
        camera: THREE.OrthographicCamera;

        render: (t: number) => void;
    }
}

interface GlobalEventHandlersEventMap {
    "view": CustomEvent<{ target: unknown }>;
}

RHU.module(new Error(), "components/molecules/replayPlayer", { 
    Macro: "rhu/macro", style: "components/molecules/replayPlayer/style",
}, function({ 
    Macro, style,
}) {
    const replayPlayer = Macro((() => {
        const replayPlayer = function(this: Molecules.ReplayPlayer) {
            const resize = () => {
                const computed = getComputedStyle(this.canvas);
                const width = parseInt(computed.width);
                const height = parseInt(computed.height);
                this.canvas.width = width;
                this.canvas.height = height;

                this.camera.left = width / -2; 
                this.camera.right = width / 2;
                this.camera.top = height / 2;
                this.camera.bottom = height / -2;
                this.camera.updateProjectionMatrix()
                this.renderer.setSize(width, height, false);
            };
            window.addEventListener("resize", resize);
            this.addEventListener("mount", resize);

            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xffffff);
            
            const width = this.canvas.width;
            const height = this.canvas.height;
            this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
            
            this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });

            this.render(0);
        } as RHU.Macro.Constructor<Molecules.ReplayPlayer>;

        replayPlayer.prototype.render = function(t) {
            let delta = (t - this.prevT) * this.timescale;
            this.prevT = t;
            
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame((t) => this.render(t));
        }

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