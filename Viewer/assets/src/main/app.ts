import { html, Macro, MacroElement } from "@/rhu/macro.js";
import { signal } from "@/rhu/signal.js";
import { Style } from "@/rhu/style.js";
import { Theme } from "@/rhu/theme.js";
import { ModuleLoader } from "../replay/moduleloader.js";
import { ASL_VM } from "../replay/vm.js";
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

    private profile = signal<string | undefined>(undefined);

    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);

        window.api.on("console.log", (obj) => console.log(obj)); // Temporary debug

        this.profile.on(value => {
            if (value === undefined) {
                this.nav.module("No profile loaded!");
                this.nav.error(true);
                return;
            } 
            this.nav.module(value);
            this.nav.error(false);
        });

        // hot reload event
        window.api.on("loadScript", async (paths: string[]) => {
            for (const p of paths) {
                ASL_VM.load(p);
            }
        });

        const moduleListHandle = (response: { success: boolean; modules: string[] | undefined; error: string | undefined; }) => {
            if (response.success === false) {
                console.error(response.error);
                return;
            }
            if (response.modules === undefined) {
                console.error("Module list was undefined despite success.");
                return;
            }
            this.nav.moduleList.values(response.modules);
        };

        // listen for module list changes
        window.api.on("moduleList", moduleListHandle);

        // get module list
        window.api.invoke("moduleList").then((response) => {
            if (response.success === false) {
                console.error(response.error);
                return;
            }
            if (response.modules === undefined) {
                console.error("Module list was undefined despite success.");
                return;
            }

            moduleListHandle(response);

            window.api.invoke("defaultModule").then((defaultModule) => {
                if (response.modules.includes(defaultModule)) {
                    window.api.invoke("loadModule", defaultModule).then((response) => this.onLoadModule(response));
                }
            });
        });

        window.api.on("startGame", () => {
            if (this.profile() === undefined) {
                this.player.unlink();
                console.error("Unable to start live view as no profile was loaded.");
            } else {
                console.log("LIVE VIEW OPEN GAME");
                this.main.loading(true);
                this.load(this.main);
                this.player.open();
            }
        }); // Temporary for live viewing games

        // Load replay file
        this.replayfile.addEventListener("change", (e: any) => {
            try {
                const files = e.target.files;
                if (!files.length) {
                    console.warn('No file selected!');
                    return;
                }
                const loaded = files.length;
                if (loaded !== 1) throw new Error("Can only load 1 file.");
                const file = files[0];

                if (this.profile() === undefined) {
                    this.nav.activeModuleList(true);
                    console.error("Unable to load replay as no profile was loaded.");
                } else {
                    this.main.loading(true);
                    this.load(this.main);
                    this.player.open(file.path);
                }

                this.replayfile.value = "";
            } catch (err) {
                console.error(err);
            }
        });

        this.nav.icon.addEventListener("click", () => this.replayfile.click());

        // Upon all modules loading, refresh player
        ASL_VM.onNoExecutionsLeft(() => {
            this.player.refresh();
        });

        // reload module list on click
        this.nav.activeModuleList.on(async (value) => {
            if (!value) return;

            const response = await window.api.invoke("moduleList");
            if (response.success === false) {
                console.error(response.error);
                return;
            }
            if (response.modules === undefined) {
                console.error("Module list was undefined despite success.");
                return;
            }
    
            moduleListHandle(response);
        });

        this.load(this.main);
    }

    public onLoadModule(response: { success: boolean; module: string; error: string | undefined; scripts: string[] | undefined }) {
        if (response.success === false) {
            console.error(response.error);
            this.profile(undefined);
            return;
        }
        if (response.module === undefined || response.scripts === undefined) {
            console.error("Module was undefined despite success.");
            this.profile(undefined);
            return;
        }

        // Close modulelist
        this.nav.activeModuleList(false);

        // Close & Refresh player
        this.player.close();

        // Reset modules
        ModuleLoader.clear();
        
        // Reset cache
        ASL_VM.dispose();
        response.scripts.forEach((p: string) => {
            ASL_VM.load(p);
        });

        // Get last opened file
        window.api.invoke("lastFile").then((path) => {
            this.player.path = path;

            // Show loading screen
            this.main.video.play();
            this.main.loading(this.player.path !== undefined);
            this.load(this.main);

            // reset file loader
            this.replayfile.value = "";

            this.profile(response.module);

            if (this.player.path !== undefined) {
                ASL_VM.onNoExecutionsLeft(() => this.player.open(this.player.path), { once: true });
            }
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