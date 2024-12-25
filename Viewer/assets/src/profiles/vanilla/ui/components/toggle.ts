import { html, Mutable } from "@esm/@/rhu/html.js";
import { Signal, signal } from "@esm/@/rhu/signal.js";
import { pageStyles } from "../pages/lib.js";

const style = pageStyles;

export const Toggle = () => {
    interface Toggle {
        readonly value: Signal<boolean>;
    }
    interface Private {
        readonly button: HTMLButtonElement
    }

    const dom = html<Mutable<Private & Toggle>>/**//*html*/`
        <button m-id="button" class="${style.toggle}"></button>
		`;
    html(dom).box();

    dom.value = signal(false);

    dom.value.on((value) => {
        if (value) dom.button.classList.add(`${style.active}`);
        else dom.button.classList.remove(`${style.active}`);
    });

    dom.button.addEventListener("click", () => {
        dom.value(!dom.value());
    });

    dom.button.addEventListener("mousedown", (e) => {
        e.preventDefault();
    });

    return dom as html<Toggle>;
};