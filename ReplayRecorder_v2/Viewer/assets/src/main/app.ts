import { Constructor, Macro } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";
import { Theme } from "@/rhu/theme.js";
import { ModuleLoader } from "../replay/moduleloader.js";
import { winNav } from "./global/components/organisms/winNav.js";
import { player } from "./routes/player.js";

async function __main__() {
    window.api.on("console.log", (obj) => console.log(obj)); // Temporary debug

    window.api.on("loadModules", (paths: string[]) => paths.forEach(p => ModuleLoader.loadModule(p)));
    
    (await window.api.invoke("loadModules")).forEach((p: string) => ModuleLoader.loadModule(p));
}

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
        `;
    const body = style.class`
        flex: 1;
        `;
    return {
        wrapper,
        body,
    };
});

export interface app extends HTMLElement {
    body: HTMLDivElement;
    load(node: Node): void;
}

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "app": app;
    }
}

Macro((() => {
    const app = function(this: app) {
        __main__();
        this.load(document.createMacro(player));
    } as any as Constructor<app>;

    app.prototype.load = function(node) {
        this.body.replaceChildren(node);
    };

    return app;
})(), "app", //html
`
    ${winNav}
    <!-- Content goes here -->
    <div rhu-id="body" class="${style.body}">
    </div>
    `, {
    element: //html
        `<div class="${theme} ${style.wrapper}"></div>`
});

// Load app
const __load__ = () => {
    const app = document.createMacro("app");
    document.body.append(app);
};
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", __load__);
} else {
    __load__();
}