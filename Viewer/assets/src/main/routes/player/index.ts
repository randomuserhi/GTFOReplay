import { html, Mutable } from "@/rhu/html.js";
import { always, Signal, signal } from "@/rhu/signal.js";
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

    const errorlist = css.class`
    position: absolute;
    top: 0px;
    width: 100%;
    color: white;
    background-color: red;
    z-index: 1000;
    `;

    const error = css.class`
    padding: 3px;
    `;

    return {
        wrapper,
        canvas,
        errorlist,
        error
    };
});

export const Player = () => {
    interface Player {
        refresh: () => void;
        open: (path?: string) => Promise<void>;
        link: (steamId: string) => Promise<void>;
        unlink: () => Promise<void>;
        close: () => void; 

        path?: string;
        readonly parser?: Parser;
    }
    interface Private {
        render: () => void;

        readonly wrapper: HTMLDivElement;
        readonly view: html<typeof View>;
    }
    
    const view = View();

    const errors = signal<string[]>([], always);
    const errorlist = html.map(errors, undefined, (kv, el?: html<{message: Signal<string>}>) => {
        const [,v] = kv;
        
        if (el === undefined) {
            el = html`
            <div class=${style.error}>
                <span>${html.bind(signal(""), "message")}</span>
            </div>
            `;
        }

        el.message(v);

        return el;
    });

    const dom = html<Mutable<Private & Player>>/**//*html*/`
        <div class="${style.errorlist}">${errorlist}</div>
        <div m-id="wrapper" class="${style.wrapper}">
            ${view}
        </div>
        `;
    html(dom).box();

    dom.view = view;
    dom.path = undefined;
    dom.parser = undefined;

    dom.render = function render() {
        const frag = new DocumentFragment();
        domFunc(frag, this.view);
        this.wrapper.replaceChildren(frag);
    };

    dom.refresh = function refresh() {
        this.render();
        this.view.refresh();
    };

    dom.open = async function open(path?: string) {
        this.path = path;
        const file: FileHandle = {
            path, finite: false
        };
        if (path !== undefined) {
            // Open file if path is provided, otherwise assume live view
            await window.api.invoke("open", file);
        }
        if (this.parser !== undefined) this.parser.terminate();
        this.parser = new Parser();
        this.view.replay(undefined);

        this.parser.addEventListener("eoh", () => {
            this.view.ready();
            app.load(this);
        });
        this.parser.addEventListener("end", () => {
            window.api.send("close");
        });
        this.parser.addEventListener("error", ((err: { message: string, verbose: string }) => {
            console.error(err.verbose);
            const e = errors();
            e.unshift(err.message);
            errors(e);
        }) as any);

        if (path !== undefined) {
            this.unlink(); // Unlink if loading a regular file.
            this.view.live(false);
        } else {
            this.view.live(true); // Acknowledge awaiting for bytes from game
        }

        // Clear state on fresh replay load
        DataStore.clear();

        // Clear errors
        errors([]);

        this.view.replay(await this.parser.parse(file));
    };

    dom.link = async function link(steamId: string) {
        const resp: string | undefined = await window.api.invoke("link", "127.0.0.1", 56759);
        if (resp !== undefined) {
            // TODO(randomuserhi)
            console.error(`Failed to link: ${resp}`);
            return;
        }

        // TODO(randomuserhi): move somewhere else and allow custom id...
        window.api.invoke("goLive", BigInt(steamId));
    };

    dom.unlink = async function unlink() {
        window.api.send("unlink");

        app.nav.linkedStatus("Not Linked");
        app.nav.linkInput.value = "";
        app.nav.linkInput.disabled = false;
        app.nav.linkInput.style.display = "block";
    };

    dom.close = function close() {
        this.view.renderer.dispose();
        this.view.replay(undefined);
        this.parser?.terminate();
        this.parser = undefined;
        window.api.send("unlink");

        app.nav.linkedStatus("Not Linked");
        app.nav.linkInput.value = "";
        app.nav.linkInput.disabled = false;
        app.nav.linkInput.style.display = "block";

        window.api.send("close");
    };

    (window as any).player = dom;

    return dom as html<Player>;
};

let domFunc: (doc: DocumentFragment, view: html<typeof View>) => void = (doc, view) => {
    doc.append(...view);
};

export function Render(func: (doc: DocumentFragment, view: html<typeof View>) => void) {
    domFunc = func;
}
