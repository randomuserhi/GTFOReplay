import { Macro, MacroWrapper, TemplateMap } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";
import { Parser } from "../../../replay/parser.js";
import { FileHandle } from "../../../replay/stream.js";
import { app } from "../../app.js";
import { view } from "./components/view/index.js";

const style = Style(({ style }) => {
    const wrapper = style.class`
    width: 100%;
    height: 100%;
    position: relative;
    `;

    const canvas = style.class`
    display: block;
    width: 100%;
    height: 100%;
    `;
    style`
    ${canvas}:focus {
        outline: none;
    }
    `;

    return {
        wrapper,
        canvas
    };
});

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "routes/player": Player;
    }
}

class Player extends MacroWrapper<HTMLDivElement> {
    parser?: Parser;

    private view: TemplateMap["routes/player.view"];

    constructor(element: HTMLDivElement, bindings: any) {
        super(element, bindings);
    }

    private render() {
        const frag = new DocumentFragment();
        domFunc(frag, this.view);
        this.element.replaceChildren(frag);
    }

    public refresh() {
        this.render();
        this.view.refresh();
    }

    public async open(path?: string) {
        this.render();

        const file: FileHandle = {
            path, finite: false
        };
        await window.api.invoke("open", file);
        if (this.parser !== undefined) this.parser.terminate();
        this.parser = new Parser();
        this.view.replay = undefined;

        this.parser.addEventListener("eoh", () => {
            this.view.ready();
            app().load(this.element);
        });
        this.parser.addEventListener("end", () => {
            window.api.send("close", file);
        });

        this.view.replay = await this.parser.parse(file);
    }
}

export const player = Macro(Player, "routes/player", //html
    `
    ${view`rhu-id="view"`}
    `, {
        element: //html
        `<div class="${style.wrapper}"></div>`,
    });

let domFunc: (doc: DocumentFragment, view: TemplateMap["routes/player.view"]) => void = (doc, view) => {
    doc.append(view.element);
};

export function Render(func: (doc: DocumentFragment, view: TemplateMap["routes/player.view"]) => void) {
    domFunc = func;
}
