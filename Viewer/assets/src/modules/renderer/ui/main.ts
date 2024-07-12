import { html, Macro, MacroElement } from "@esm/@/rhu/macro.js";
import { Style } from "@esm/@/rhu/style.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import { Render } from "@esm/@root/main/routes/player/index.js";

let disposeController = new AbortController();
export const dispose = {
    get signal() {
        return disposeController.signal;
    } 
};
module.ready();

/* eslint-disable sort-imports */
import { Display } from "./display.js";

const style = Style(({ style }) => {
    const wrapper = style.class`
    width: 100%;
    height: 100%;
    position: relative;
    `;
    
    return {
        wrapper,
    };
});

const UI = Macro(class UI extends MacroElement {
    private display: Macro<typeof Display>;
    
    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);
    }

    public init(view: Macro<typeof View>) {
        this.display.init(view);
    }
}, html`
    <div class="${style.wrapper}">
        ${Display().bind("display")}
    </div>
    `);

Render((doc, view) => {
    if (disposeController !== undefined) disposeController.abort();
    disposeController = new AbortController();

    const ui = Macro.create(UI());
    ui.init(view);
    doc.append(...ui.dom);
});