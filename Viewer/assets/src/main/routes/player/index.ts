import { html, Macro, MacroElement } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";
import { DataStore } from "../../../replay/datastore.js";
import { Parser } from "../../../replay/parser.js";
import { FileHandle } from "../../../replay/stream.js";
import { app } from "../../app.js";
import { View } from "./components/view/index.js";

const style = Style(({ css }) => {
    const wrapper = css.class`
    width: 100%;
    height: 100%;
    position: relative;
    `;

    const canvas = css.class`
    display: block;
    width: 100%;
    height: 100%;
    `;
    css`
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

        (window as any).player = this;
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

    public path?: string;
    public async open(path?: string) {
        this.path = path;
        const file: FileHandle = {
            path, finite: false
        };
        await window.api.invoke("open", file);
        if (this.parser !== undefined) this.parser.terminate();
        this.parser = new Parser();
        this.view.replay(undefined);

        this.parser.addEventListener("eoh", () => {
            this.view.ready();
            app().load(this);
        });
        this.parser.addEventListener("end", () => {
            window.api.send("close");
        });

        if (path !== undefined) {
            this.unlink(); // Unlink if loading a regular file.
            this.view.live(false);
        } else {
            this.view.live(true); // Acknowledge awaiting for bytes from game
        }

        // Clear state on fresh replay load
        DataStore.clear();

        this.view.replay(await this.parser.parse(file));
    }

    public async link(ip: string, port: number) {
        const resp: string | undefined = await window.api.invoke("link", ip, port);
        if (resp !== undefined) {
            // TODO(randomuserhi)
            console.error(`Failed to link: ${resp}`);
            return;
        }
        window.api.send("goLive");
    }

    public async unlink () {
        window.api.send("unlink");
    }

    public close() {
        this.view.renderer.dispose();
        this.view.replay(undefined);
        this.parser?.terminate();
        this.parser = undefined;
        window.api.send("unlink");
        window.api.send("close");
    }
}, () => html`
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
