import { html, Mutable } from "@esm/@/rhu/html.js";
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

export const Debug = () => {
    interface Debug {
        readonly view: Signal<html<typeof View> | undefined>;
    }
    interface Private {
    }

    const position = signal("x: 0, y: 0, z: 0");

    const dom = html<Mutable<Private & Debug>>/**//*html*/`
        <div class="${style.wrapper}">
            ${position}
        </div>
		`;
    html(dom).box();

    dom.view = signal<html<typeof View> | undefined>(undefined);

    dom.view.on((view) => {
        if (view === undefined) return;

        view.renderer.watch("Camera").on((camera) => {
            if (camera === undefined) {
                position("x: 0, y: 0, z: 0");
                return;
            }
            camera.position.on((pos) => {
                position(`x: ${(Math.round(pos.x * 100) / 100).toFixed(2)}, y: ${(Math.round(pos.y * 100) / 100).toFixed(2)}, z: ${(Math.round(pos.z * 100) / 100).toFixed(2)}`);
            });
        }, { signal: dispose.signal });

    }, { signal: dispose.signal });

    return dom as html<Debug>;
};