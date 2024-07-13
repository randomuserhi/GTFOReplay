import { html, Macro, MacroElement } from "@esm/@/rhu/macro.js";
import { signal } from "@esm/@/rhu/signal.js";
import { pageStyles } from "../pages/lib.js";

const style = pageStyles;

export const Toggle = Macro(class Toggle extends MacroElement {
    private button: HTMLButtonElement;

    public value = signal(false);

    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);

        this.value.on((value) => {
            if (value) this.button.classList.add(`${style.active}`);
            else this.button.classList.remove(`${style.active}`);
        });

        this.button.addEventListener("click", () => {
            this.value(!this.value());
        });

        this.button.addEventListener("mousedown", (e) => {
            e.preventDefault();
        });
    }
}, html`<button m-id="button" class="${style.toggle}"></button>`);