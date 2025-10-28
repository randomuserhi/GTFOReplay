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

    const selectBox = css.class`
    position: absolute;
    background-color: rgba(255, 255, 255, 0.5);
    z-index: 1000;
    `;

    return {
        wrapper,
        selectBox
    };
});

export const Debug = () => {
    interface Debug {
        readonly view: Signal<html<typeof View> | undefined>;
    }
    interface Private {
        readonly selectBox: HTMLDivElement;
    }

    const position = signal("x: 0, y: 0, z: 0");

    const dom = html<Mutable<Private & Debug>>/**//*html*/`
        <div class="${style.wrapper}">
            ${position}
        </div>
        <div m-id="selectBox" class="${style.selectBox}" style="display: block; top: 0px; left: 0px; width: 0px; height: 0px;">
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

        view.renderer.watch("Controls").on((control) => {
            if (control === undefined) {
                dom.selectBox.style.display = "none";
                return;
            }

            const update = (e: { clientX: number, clientY: number }) => {
                const rect = view.canvas.getBoundingClientRect();
                const x1 = e.clientX - rect.left;
                const y1 = e.clientY - rect.top;
                const x2 = control.selectStartScreen.x - rect.left;
                const y2 = control.selectStartScreen.y - rect.top;
                
                const minX = Math.min(x2, x1);
                const minY = Math.min(y2, y1);
                const maxX = Math.max(x2, x1);
                const maxY = Math.max(y2, y1);

                dom.selectBox.style.width = `${maxX - minX}px`;
                dom.selectBox.style.height = `${maxY - minY}px`;
                dom.selectBox.style.top = `${minY}px`;
                dom.selectBox.style.left = `${minX}px`;
            };

            // Leaks an event listener (when control is reassigned), it is what it is...
            window.addEventListener("mousemove", update, { signal: dispose.signal });

            control.isSelecting.on((v) => {
                dom.selectBox.style.display = v ? "block" : "none";
                update({ clientX: control.selectStartScreen.x, clientY: control.selectStartScreen.y });
            });
        }, { signal: dispose.signal });

    }, { signal: dispose.signal });

    return dom as html<Debug>;
};