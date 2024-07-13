import { html, Macro, MacroElement } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";
import { Theme } from "@/rhu/theme.js";
import { AsyncScriptCache, AsyncScriptLoader } from "../replay/async-script-loader.js";
import { ModuleLoader } from "../replay/moduleloader.js";
import { WinNav } from "./global/components/organisms/winNav.js";
import { Main } from "./routes/main/index.js";
import { player } from "./routes/player/index.js";

export const theme = Theme(({ theme }) => {
    return {
        defaultColor: theme`rgba(255, 255, 255, 0.8)`,
        fullWhite: theme`white`,
        fullBlack: theme`black`,
        hoverPrimary: theme`#2997ff`,
        backgroundPrimary: theme`#0071e3`,
        backgroundAccent: theme`#147ce5`,
    };
});

const style = Style(({ style }) => {
    const wrapper = style.class`
    font-family: Oxanium;

    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    background-color: black;

    overflow: hidden;
    `;
    const body = style.class`
    flex: 1;
    `;

    return {
        wrapper,
        body
    };
});

const App = Macro(class App extends MacroElement {
    public replayfile: HTMLInputElement;

    private player = Macro.create(player());
    private main = Macro.create(Main());

    private body: HTMLDivElement;
    private nav: Macro<typeof WinNav>;

    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);
        this.init();

        window.api.on("startGame", () => {
            console.log("LIVE VIEW OPEN GAME");
            this.main.loading(true);
            this.load(this.main);
            this.player.open();
        }); // Temporary for live viewing games

        this.replayfile.addEventListener("change", (e: any) => {
            try {
                const files = e.target.files;
                if (!files.length) {
                    console.warn('No file selected!');
                    return;
                }
                const loaded = files.length;
                if (loaded !== 1) throw new Error("Can only load 1 file.");
                for (const file of files) {
                    this.main.loading(true);
                    this.load(this.main);
                    this.player.open(file.path);
                }
            } catch (err) {
                console.error(err);
            }
        });

        this.nav.icon.addEventListener("click", () => this.replayfile.click());

        // Upon all modules loading, refresh player
        AsyncScriptCache.onExecutionsCompleted(() => {
            this.player.refresh();
        });

        // Switch modules folder
        this.nav.plugin.addEventListener("click", async () => {
            const { success, path, error } = await window.api.invoke("moduleFolder");
            if (!success) {
                console.error(error);
                return;
            }

            // Close & Refresh player
            this.player.close();

            // Reset modules
            ModuleLoader.clear();
            
            // Reset cache
            AsyncScriptCache.reset();
            (await window.api.invoke("loadModules")).forEach((p: string) => {
                AsyncScriptLoader.load(p);
            });

            // Show loading screen
            this.main.video.play();
            this.main.loading(false);
            this.load(this.main);

            // Update path information
            this.nav.moduleName(path);
            this.replayfile.value = "";
        });

        this.load(this.main);
    }

    private async init() {
        window.api.on("console.log", (obj) => console.log(obj)); // Temporary debug

        window.api.on("loadModules", async (paths: string[]) => {
            for (const p of paths) {
                AsyncScriptLoader.load(p);
            }
        });
    
        (await window.api.invoke("loadModules")).forEach((p: string) => {
            AsyncScriptLoader.load(p);
        });
    }

    public load(macro: MacroElement) {
        this.body.replaceChildren(...macro.dom);
    }
}, html`
    <div class="${theme} ${style.wrapper}">
        ${WinNav.open().bind("nav")}
            <span>GTFO Replay Viewer</span>
        ${WinNav.close}
        <!-- Content goes here -->
        <div m-id="body" class="${style.body}">
        </div>
        <input m-id="replayfile" type="file" style="display: none;"/>
    </div>
    `);

let _app: Macro<typeof App> | undefined = undefined;
export function app(): Macro<typeof App> {
    if (_app === undefined) throw new Error("App has not loaded yet.");
    return _app;
}

// Load app
const __load__ = () => {
    _app = Macro.create(App());
    document.body.replaceChildren(..._app.dom);
};
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", __load__);
} else {
    __load__();
}