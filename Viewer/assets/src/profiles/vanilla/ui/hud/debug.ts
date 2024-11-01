import { html, Macro, MacroElement } from "@esm/@/rhu/macro.js";
import { signal, Signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import { View } from "../../../../main/routes/player/components/view/index.js";
import { dispose } from "../main.js";

const style = Style(({ css }) => {
    const wrapper = css.class`
    position: absolute;
    right: 0;
    top: 0;
    color: #aaa;
    padding: 10px;
    `;

    return {
        wrapper
    };
});

export const Debug = Macro(class Debug extends MacroElement {
    private position: Signal<string>;
    
    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);

        this.view.on((view) => {
            if (view === undefined) return;

            view.renderer.watch("Camera").on((camera) => {
                if (camera === undefined) {
                    this.position("x: 0, y: 0, z: 0");
                    return;
                }
                camera.position.on((position) => {
                    this.position(`x: ${(Math.round(position.x * 100) / 100).toFixed(2)}, y: ${(Math.round(position.y * 100) / 100).toFixed(2)}, z: ${(Math.round(position.z * 100) / 100).toFixed(2)}`);
                });
            });

        }, { signal: dispose.signal });
    }

    public view = signal<Macro<typeof View> | undefined>(undefined);
}, () => html`
    <div class="${style.wrapper}">
        ${html.signal("position", "x: 0, y: 0, z: 0")}
    </div>
`);