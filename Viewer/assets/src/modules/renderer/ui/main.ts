import { Macro, MacroWrapper, TemplateMap } from "@esm/@/rhu/macro.js";
import { Style } from "@esm/@/rhu/style.js";
import { Render } from "@esm/@root/main/routes/player/index.js";

let disposeController = new AbortController();
export const dispose = {
    get signal() {
        return disposeController.signal;
    } 
};
module.ready();

/* eslint-disable sort-imports */
import { display } from "./display.js";

declare module "@esm/@/rhu/macro.js" {
    interface TemplateMap {
        "ui": UI;
    }
}

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

class UI extends MacroWrapper<HTMLDivElement> {
    private display: TemplateMap["ui.display"];
    
    constructor(element: HTMLDivElement, bindings: any) {
        super(element, bindings);
    }

    public init(view: TemplateMap["routes/player.view"]) {
        this.display.init(view);
    }
}

Macro(UI, "ui", //html
    `
    ${display`rhu-id="display"`}
    `, {
        element: //html
        `<div class="${style.wrapper}"></div>`
    });

Render((doc, view) => {
    if (disposeController !== undefined) disposeController.abort();
    disposeController = new AbortController();

    const ui = document.createMacro("ui");
    ui.init(view);
    doc.append(ui.element);
});