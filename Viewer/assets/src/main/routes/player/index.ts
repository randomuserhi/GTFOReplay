import { html, Mutable } from "@/rhu/html.js";
import { Style } from "@/rhu/style.js";
import { DataStore } from "../../../replay/datastore.js";
import { Parser } from "../../../replay/parser.js";
import { FileHandle } from "../../../replay/stream.js";
import { Replay } from "../../../replay/replay.js";
import type { OpenClip } from "../../../../../shared/clip.js";
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

    const dom = html<Mutable<Private & Player>>/**//*html*/`
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

    let opening = 0;
    let openingTask: Promise<void> = Promise.resolve();
    let clipToken: string | undefined;
    const recordViewing = () => {
        const replay = dom.view.replay();
        if (!dom.path || !replay?.identity || !replay.complete) return;
        void window.api.invoke("recordReplayViewing", dom.path, replay.identity, replay.length()).catch(error => {
            console.error("Could not save replay viewing metadata:", error);
            dom.view.addLog({ message: String(error), verbose: String(error), type: "error" });
        });
    };
    dom.open = async function open(path?: string) {
        const generation = ++opening;
        return openingTask = openingTask.catch(() => {}).then(async () => {
        if (generation !== opening) return;
        this.parser?.terminate();
        if (clipToken) { const token = clipToken; clipToken = undefined; await window.api.invoke("replayCacheClose", token); }
        if (generation !== opening) return;
        this.parser = undefined;
        this.view.pause(true);
        this.view.replay(undefined);
        this.path = path;
        const file: FileHandle = {
            path, finite: path !== undefined
        };
        let clip: OpenClip | undefined;
        if (path !== undefined) {
            // Open file if path is provided, otherwise assume live view
            clip = await window.api.invoke("open", file);
        }
        if (generation !== opening) {
            if (clip) await window.api.invoke("replayCacheClose", clip.token);
            return;
        }
        if (clip) {
            await this.unlink();
            if (generation !== opening) { await window.api.invoke("replayCacheClose", clip.token); return; }
            this.view.live(false); DataStore.clear(); this.view.clearLogs();
            const replay = new Replay();
            replay.identity = clip.manifest.identity; replay.cacheToken = clipToken = clip.token;
            replay.startTime = clip.manifest.start; replay.endTime = clip.manifest.end;
            replay.header = clip.manifest.header; replay.typemap = clip.manifest.typemap; replay.types = clip.manifest.types;
            replay.events = clip.manifest.events; replay.blocks.push(...clip.blocks); replay.complete = true;
            const token = clip.token;
            replay.loadBlock = id => window.api.invoke("replayCacheRead", token, id);
            replay.setRange({ start: replay.startTime, end: replay.length() });
            this.view.replay(replay); this.view.ready(); this.view.pause(true);
            this.view.time(replay.startTime);
            app.load(this); recordViewing();
            return;
        }
        const parser = this.parser = new Parser();
        const info = path !== undefined ? await window.api.invoke("replayFileInfo") : undefined;
        if (generation !== opening) return;
        let headerReady = false;

        this.parser.addEventListener("eoh", () => {
            if (this.parser !== parser) return;
            headerReady = true;
            this.view.ready();
            app.load(this);
        });
        this.parser.addEventListener("end", async () => {
            if (this.parser !== parser) return;
            try {
                const info = await window.api.invoke("replayFileInfo");
                if (this.parser !== parser) return;
                if (info?.recovered) this.view.addLog({
                    message: info.warning ?? window.ReplayInterface.t("interrupted"),
                    verbose: JSON.stringify(info), type: "warning"
                });
                if (headerReady) recordViewing();
                window.api.send("close");
            } catch (error) {
                console.error(error);
                if (this.parser === parser) this.view.addLog({ message: String(error), verbose: String(error), type: "error" });
            }
        });
        this.parser.addEventListener("error", ((err: { message: string, verbose: string, type: undefined | "warning" | "error" }) => {
            if (this.parser !== parser) return;
            if (err.type !== "warning") this.view.pause(true);
            if (err.type == "warning") {
                console.warn(err.verbose);
            } else {
                console.error(err.verbose);
            }
            this.view.addLog(err);
            if (!headerReady) app.reportOpenError(err.message);
        }) as any);

        if (path !== undefined) {
            await this.unlink(); // Unlink if loading a regular file.
            if (generation !== opening) return;
            this.view.live(false);
        } else {
            this.view.live(true); // Acknowledge awaiting for bytes from game
        }

        // Clear state on fresh replay load
        DataStore.clear();

        // Clear errors
        this.view.clearLogs();

        if (generation !== opening) return;
        const replay = parser.parse(file);
        replay.endTime = info?.duration;
        this.view.replay(replay);
        });
    };

    dom.link = async function link(steamId: string) {
        await window.api.invoke("unlink");

        const resp: string | undefined = await window.api.invoke("link", "127.0.0.1", 56759);
        if (resp !== undefined) {
            throw new Error(`Failed to link: ${resp}`);
        }
        await window.api.invoke("goLive", BigInt(steamId));
    };

    dom.unlink = async function unlink() {
        await window.api.invoke("unlink");

        app.nav.linkedStatus("Not Linked");
    };

    dom.close = function close() {
        ++opening;
        this.view.renderer.dispose();
        this.view.replay(undefined);
        this.parser?.terminate();
        this.parser = undefined;
        if (clipToken) { void window.api.invoke("replayCacheClose", clipToken).catch(console.error); clipToken = undefined; }
        window.api.send("unlink");

        app.nav.linkedStatus("Not Linked");

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
