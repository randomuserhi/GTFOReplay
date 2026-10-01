import { translated } from "./i18n.js";
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
        chooseFile(): Promise<void>;
        openFile(path: string): Promise<void>;
        showLibrary(): void;
        showHome(): void;
        reportOpenError(message: string): void;
        
        readonly nav: html<typeof WinNav>;
        readonly player: html<typeof Player>;
    }
    interface Private {
        readonly body: HTMLDivElement;

        readonly main: html<typeof Main>;
        readonly profile: Signal<string | undefined>;
        readonly libraryButton: HTMLButtonElement;
    }

    const dom = html<Mutable<Private & App>>/**//*html*/`
        <div class="${theme} ${style.wrapper}">
            ${html.open(WinNav()).bind("nav")}
                <span>GTFO Replay</span>
                <button m-id="libraryButton" type="button">${translated("library.title")}</button>
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

    let profileGeneration = 0;
    let profileTask: Promise<void> = Promise.resolve();
    dom.onLoadModule = function onLoadModule(response) {
        const generation = ++profileGeneration;
        profileTask = profileTask.then(async () => {
            if (generation !== profileGeneration) return;
            this.profile(undefined);
            this.player.close();
            this.main.loading(true);
            this.main.error("");
            this.load(this.main);
            if (!response.success || !response.module || !response.scripts) {
                throw new Error(response.error ?? "Replay profile is incomplete.");
            }
            this.nav.activeModuleList(false);
            await ASL_VM.dispose();
            ModuleLoader.clear();
            const results = await Promise.allSettled(response.scripts.map(async p => { const loaded = await ASL_VM.load(p); await loaded.execution; }));
            if (generation !== profileGeneration) return;
            const failed = results.find(result => result.status === "rejected");
            if (failed?.status === "rejected") throw failed.reason;
            this.player.refresh();
            const path = await window.api.invoke("lastFile");
            if (generation !== profileGeneration) return;
            this.profile(response.module);
            this.main.loading(false);
            if (path) await this.openFile(path);
        }).catch(error => {
            console.error(error);
            if (generation === profileGeneration) {
                this.profile(undefined);
                this.reportOpenError(String(error));
            }
        });
    };

    dom.load = function load(page: html) {
        this.body.replaceChildren(...page);
        this.main.active(page === this.main);
    };

    dom.profile.on(value => {
        if (value === undefined) {
            dom.nav.module("");
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
            try { await ASL_VM.load(p); } catch (error) { dom.reportOpenError(String(error)); }
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
            void dom.player.open().catch(error => dom.reportOpenError(String(error)));
        }
    }); // Temporary for live viewing games

    let isChoosingFile = false;
    dom.openFile = async function openFile(file) {
        if (dom.profile() === undefined) {
            dom.nav.activeModuleList(true);
            throw new Error(window.ReplayInterface.t("library.profileRequired"));
        }
        dom.main.loading(true);
        dom.main.error("");
        dom.load(dom.main);
        try { await dom.player.open(file); }
        catch (error) { dom.main.loading(false); throw error; }
    };
    dom.showLibrary = () => {
        dom.player.close();
        window.api.send("forgetReplay");
        dom.main.loading(false);
        dom.main.error("");
        dom.main.libraryVisible(true);
        dom.load(dom.main);
    };
    dom.showHome = () => {
        dom.player.close(); window.api.send("forgetReplay");
        dom.main.loading(false); dom.main.error(""); dom.main.libraryVisible(false); dom.load(dom.main);
    };
    dom.reportOpenError = message => { dom.main.loading(false); dom.main.error(message); dom.load(dom.main); };
    dom.libraryButton.addEventListener("click", dom.showLibrary);
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

            await dom.openFile(file);
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            isChoosingFile = false;
        }
    };

    dom.nav.icon.addEventListener("click", async () => {
        dom.showHome();
    });

    // Upon all modules loading, refresh player
    ASL_VM.onNoExecutionsLeft(() => {
        if (dom.profile() !== undefined) dom.player.refresh();
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
