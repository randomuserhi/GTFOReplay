import { html, Macro, MacroElement } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";
import { Parser } from "../../../replay/parser.js";
import { FileHandle } from "../../../replay/stream.js";
import { app } from "../../app.js";
import { View } from "./components/view/index.js";

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

export const player = Macro(class Player extends MacroElement {
    parser?: Parser;

    private wrapper: HTMLDivElement;
    private view: Macro<typeof View>;

    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);
    }

    private render() {
        const frag = new DocumentFragment();
        domFunc(frag, this.view);
        this.wrapper.replaceChildren(frag);
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
            app().load(this);
        });
        this.parser.addEventListener("end", () => {
            window.api.send("close", file);
        });

        this.view.replay = await this.parser.parse(file);
    }
}, html`
    <div m-id="wrapper" class="${style.wrapper}">
        ${View().bind("view")}
    </div>
    `);

let domFunc: (doc: DocumentFragment, view: Macro<typeof View>) => void = (doc, view) => {
    doc.append(...view.dom);
};

export function Render(func: (doc: DocumentFragment, view: Macro<typeof View>) => void) {
    domFunc = func;
}
