import { html, Mutable } from "@/rhu/html.js";
import { Signal, signal } from "@/rhu/signal.js";
import { Style } from "@/rhu/style.js";
import { Theme } from "@/rhu/theme.js";
import { ModuleLoader } from "../replay/moduleloader.js";
import { ASL_VM } from "../replay/vm.js";
import { WinNav } from "./global/components/organisms/winNav.js";
import { Main } from "./routes/main/index.js";
import { Player } from "./routes/player/index.js";

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

const style = Style(({ css }) => {
    const wrapper = css.class`
    font-family: Oxanium;

    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    background-color: black;

    overflow: hidden;
    `;
    const body = css.class`
    position: relative;
    flex: 1;
    `;

    return {
        wrapper,
        body
    };
});

const App = () => {
    interface App {
        load(page: html): void;
        onLoadModule(response: { success: boolean; module: string; error: string | undefined; scripts: string[] | undefined }): void;
        chooseFile(): void;
        
        readonly nav: html<typeof WinNav>;
        readonly player: html<typeof Player>;
    }
    interface Private {
        readonly body: HTMLDivElement;

        readonly main: html<typeof Main>;
        readonly profile: Signal<string | undefined>;
    }

    const dom = html<Mutable<Private & App>>/**//*html*/`
        <div class="${theme} ${style.wrapper}">
            ${html.open(WinNav()).bind("nav")}
                <span>GTFO Replay</span>
            ${html.close()}
            <!-- Content goes here -->
            <div m-id="body" class="${style.body}">
            </div>
        </div>
        `;
    html(dom).box();

    dom.profile = signal<string | undefined>(undefined);
    dom.player = Player();
    dom.main = Main();

    dom.onLoadModule = function onLoadModule(response: { success: boolean; module: string; error: string | undefined; scripts: string[] | undefined }) {
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

            this.profile(response.module);

            if (this.player.path !== undefined) {
                ASL_VM.onNoExecutionsLeft(() => this.player.open(this.player.path), { once: true });
            }
        });
    };

    dom.load = function load(page: html) {
        this.body.replaceChildren(...page);
    };

    dom.profile.on(value => {
        if (value === undefined) {
            dom.nav.module("No profile loaded!");
            dom.nav.error(true);
            return;
        } 
        dom.nav.module(value);
        dom.nav.error(false);
    });

    // console log
    window.api.on("console.log", (msg) => console.log(msg));

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
        dom.nav.moduleList.values(response.modules);
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
                window.api.invoke("loadModule", defaultModule).then((response) => dom.onLoadModule(response));
            }
        });
    });

    window.api.on("startGame", () => {
        if (dom.profile() === undefined) {
            dom.player.unlink();
            console.error("Unable to start live view as no profile was loaded.");
        } else {
            console.log("LIVE VIEW OPEN GAME");
            dom.main.loading(true);
            dom.load(dom.main);
            dom.player.open();
        }
    }); // Temporary for live viewing games

    let isChoosingFile = false;
    dom.chooseFile = async function chooseFile() {
        if (isChoosingFile) return;
        isChoosingFile = true;
        try {
            const files: string[] = await window.api.invoke("chooseFile");
            if (!files.length) {
                console.warn('No file selected!');
                return;
            }
            const loaded = files.length;
            if (loaded !== 1) throw new Error("Can only load 1 file.");
            const file = files[0];

            if (dom.profile() === undefined) {
                dom.nav.activeModuleList(true);
                console.error("Unable to load replay as no profile was loaded.");
            } else {
                dom.main.loading(true);
                dom.load(dom.main);
                console.log(`OPEN FILE FROM DISK ${file}`);
                dom.player.open(file);
            }
        } catch (err) {
            console.error(err);
        } finally {
            isChoosingFile = false;
        }
    };

    dom.nav.icon.addEventListener("click", async () => {
        dom.chooseFile();
    });

    // Upon all modules loading, refresh player
    ASL_VM.onNoExecutionsLeft(() => {
        dom.player.refresh();
    });

    // reload module list on click
    dom.nav.activeModuleList.on(async (value) => {
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

    dom.load(dom.main);

    return dom as html<App>;
};

export const app = App();

// Load app
const __load__ = () => {
    document.body.replaceChildren(...app);
};
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", __load__);
} else {
    __load__();
}