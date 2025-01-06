import { html, Mutable } from "@/rhu/html.js";
import { computed, signal, Signal } from "@/rhu/signal.js";
import { Style } from "@/rhu/style.js";
import Fuse from "fuse.js";
import { app } from "../../../app.js";
import * as icons from "../atoms/icons/index.js";

const moduleListStyles = Style(({ css }) => {
    const wrapper = css.class`
    display: none;
    background-color: #2a2a43;
    border-radius: 7px;
    border-style: solid;
    border-width: 1px;
    border-color: #2f2e44;
    font-size: 0.75rem;
    min-width: 100px;
    flex-shrink: 0;
    `;

    const sticky = css.class`
    display: flex;
    background-color: #2a2a43;
    padding: 5px;
    border-radius: 4px 4px 0 0;
    `;

    const filter = css.class`
    background-color: #12121a;
    padding: 3px 5px;
    border-radius: 4px;
    color: white;
    width: 100%;
    `;

    const mount = css.class`
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: white;
    padding: 5px;
    max-height: 300px;
    overflow: auto;
    `;

    const item = css.class`
    padding: 3px 5px;
    cursor: pointer;
    `;
    css`
    ${item}:hover {
        background-color: #12121a;
        border-radius: 4px;
    }
    `;

    return {
        wrapper,
        filter,
        mount,
        item,
        sticky
    };
});

const ModuleItem = (key: string) => {
    interface ModuleItem {
        readonly button: HTMLLIElement;
        readonly key: Signal<string>;
    }
    interface Private {

    }

    const k = signal(key);
    
    const dom = html<Mutable<Private & ModuleItem>>/**//*html*/`
            <li m-id="button" class="${moduleListStyles.item}">${k}</li>
        `;
    
    html(dom).box();

    dom.key = k;

    return dom as html<ModuleItem>;
};

const ModuleList = () => {
    interface ModuleList {
        readonly values: Signal<string[]>;
    }
    interface Private {
        readonly input: HTMLInputElement;
    }

    const filter = signal("");
    const validation = new Set<string>();
    const values = signal<string[]>([]);
    const fuse = new Fuse(values(), { keys: ["key"] });
    const filtered = computed<string[]>((set) => {
        let filteredValues = values();
        fuse.setCollection(filteredValues);
        const str = filter();
        if (str.trim() !== "") {
            fuse.setCollection(filteredValues);
            filteredValues = fuse.search(str).map((n) => n.item);
        }
        set(filteredValues);
    }, [values, filter], (a, b) => {
        if (a === undefined && b === undefined) return true;
        if (a === undefined || b === undefined) return false;
        if (a.length !== b.length) return false;
        validation.clear();
        for (let i = 0; i < a.length; ++i) {
            validation.add(a[i]);
            if (!validation.has(b[i])) return false;
        }
        return true;
    });

    const list = html.map(filtered, undefined, (kv, el?: html<typeof ModuleItem>) => {
        const [, value] = kv;
        if (value == "extensions") return undefined; // NOTE(randomuserhi): Skip extension folder

        if (el === undefined) {
            const el = ModuleItem(value);
            el.button.addEventListener("click", () => {
                // (To aid Garbage Collection, refresh window via electron instead of reloading using hot-reload mechanism)
                //window.api.send("defaultModule", item.key());
                window.api.invoke("loadModule", el.key()).then((response) => {
                    app.onLoadModule(response);
                });
            });
            return el;
        } else {
            el.key(value);
            return el;
        }
    });

    const dom = html<Mutable<Private & ModuleList>>/**//*html*/`
        <div class="${moduleListStyles.wrapper}">
            <div class="${moduleListStyles.sticky}">
                <input m-id="input" placeholder="Search ..." class="${moduleListStyles.filter}" type="text" spellcheck="false" autocomplete="false" value=""/>
            </div>
            <ul m-id="mount" class="${moduleListStyles.mount}">
                ${list}
            </ul>
        </div>
        `;
    html(dom).box();

    dom.values = values;

    return dom as html<ModuleList>;
};

const style = Style(({ css }) => {
    const height = "40px";

    const wrapper = css.class`
    display: flex;
    justify-content: flex-start;
    flex-direction: row-reverse;
    align-items: stretch;
    height: ${height};
    background-color: #11111B; /*TODO: Theme-ColorScheme*/

    z-index: 3001;
    -webkit-app-region: drag;
    -ms-flex-negative: 0;
    flex-shrink: 0;

    border-bottom-style: solid;
    border-bottom-width: 2px;
    border-bottom-color: #2f2e44;
    `;
    const button = css.class`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    position: relative;
    width: 45px;
    height: ${height};
    color: #B9BBBE; /*TODO: Theme-ColorScheme*/

    -webkit-app-region: no-drag;
    pointer-events: auto;
    `;
    css`
    ${button}:focus {
        outline:0;
    }
    ${button}:hover {
        color: white;
        background-color: #272733; /*TODO: Theme-ColorScheme*/
    }
    `;
    const text = css.class`
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    height: 100%;
    margin-left: 10px;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.75rem;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    `;

    const popup = css.class`
    display: none;
    padding: 5px 10px;
    background-color: #11111B; /*TODO: Theme-ColorScheme*/
    border-radius: 7px;
    border-style: solid;
    border-width: 1px;
    border-color: #2f2e44;
    font-size: 0.75rem;
    flex-shrink: 0;
    `;
    css`
    ${button}:hover + div ${popup} {
        display: block;
    }
    `;

    const active = css.class``;
    css`
    ${active} ${popup} {
        display: block;
    }
    ${active} ${moduleListStyles.wrapper} {
        display: block;
    }
    `;

    const error = css.class`
    background-color: #2d1623;
    border-color: #e81b23;
    `;

    const mount = css.class`
    position: absolute;
    top: calc(100% + 5px);
    left: 5px;
    display: flex; 
    gap: 5px;
    color: white;
    `;

    const icon = css.class``;

    const linkMount = css.class`
    position: absolute;
    top: calc(100%);
    left: 5px;
    display: none; 
    gap: 5px;
    color: white;
    padding-top: 5px;
    `;

    const link = css.class`
    background-color: #2a2a43;
    border-radius: 7px;
    border-style: solid;
    border-width: 1px;
    border-color: #2f2e44;
    font-size: 0.75rem;
    min-width: 100px;
    flex-shrink: 0;
    padding: 5px;
    display: flex;
    flex-direction: column;
    gap: 7px
    `;
    css`
    ${icon}:hover ${linkMount} {
        display: flex;
    }
    `;

    const linkInput = css.class`
    background-color: #12121a;
    padding: 3px 5px;
    border-radius: 4px;
    color: white;
    width: 100%;
    `;

    return {
        wrapper,
        button,
        text,
        popup,
        mount,
        active,
        error,
        link,
        linkInput,
        icon,
        linkMount
    };
});

export const WinNav = () => {
    interface WinNav {
        readonly module: Signal<string>;
        readonly error: Signal<boolean>;
        readonly moduleList: html<typeof ModuleList>;
        readonly activeModuleList: Signal<boolean>;
        readonly icon: HTMLButtonElement;
        readonly linkedStatus: Signal<string>;
        readonly linkInput: HTMLInputElement;
    }
    interface Private {
        readonly close: HTMLButtonElement;
        readonly max: HTMLButtonElement;
        readonly min: HTMLButtonElement;
        readonly plugin: HTMLButtonElement;
        readonly mount: HTMLDivElement;
        readonly moduleListMount: HTMLDivElement;
        readonly moduleWrapper: HTMLDivElement;
    }
    
    const module = signal("No profile loaded!");
    const moduleList = ModuleList();
    const linkedStatus = signal("Not Linked");

    const dom = html<Mutable<Private & WinNav>>/**//*html*/`
        <nav class="${style.wrapper}">
            <div m-id="close" class="${style.button}" tabindex="-1" role="button" aria-label="Close">
                ${icons.cross()}
            </div>
            <div m-id="max" class="${style.button}" tabindex="-1" role="button" aria-label="Maximize">
                ${icons.square()}
            </div>
            <div m-id="min" class="${style.button}" tabindex="-1" role="button" aria-label="Minimize">
                ${icons.line()}
            </div>
            <div m-id="mount" class="${style.text}">
            </div>
            <span style="position: relative;">
                <div m-id="plugin" class="${style.button}" style="padding: 10px;" tabindex="-1" role="button">
                    ${icons.plugin()}
                </div>
                <div m-id="moduleListMount" class="${style.mount}">
                    ${moduleList}
                    <span style="flex-shrink: 0; margin-top: 5px;"><div m-id="moduleWrapper" class="${style.popup} ${style.error}">
                        ${module}
                    </div></span>
                </div>
            </span>
            <span style="position: relative;" class="${style.icon}">
                <div m-id="icon" class="${style.button}" style="padding: 10px; width: 60px;" tabindex="-1" role="button" aria-label="Load Replay">
                    ${icons.rug()}
                </div>
                <div class="${style.linkMount}">
                    <div class="${style.link}">
                        <input m-id="linkInput" placeholder="User SteamID" class="${style.linkInput}" type="text" spellcheck="false" autocomplete="false" value=""/>
                        <div>${linkedStatus}</div>
                    </div>
                </div>
            </span>
        </nav>
        `;
    
    dom.module = module;
    dom.moduleList = moduleList;

    const { close, max, min, mount, plugin, moduleListMount, moduleWrapper } = dom;
    
    html(dom).box().children((children) => {
        mount.append(...children);
    });
    
    dom.linkedStatus = linkedStatus;

    dom.linkInput.addEventListener("change", async () => {
        let id: bigint;
        try {
            id = BigInt(dom.linkInput.value.trim());
        } catch (e) {
            linkedStatus("Invalid SteamID");
            console.error(e);
            return;
        }

        const resp: string | undefined = await window.api.invoke("link", "127.0.0.1", 56759);
        if (resp !== undefined) {
            dom.linkInput.disabled = false;
            dom.linkInput.style.display = "block";

            linkedStatus(`Failed to link`);
            console.error(`Failed to link: ${resp}`);
            return;
        }

        dom.linkInput.value = "";
        dom.linkInput.disabled = true;
        dom.linkInput.style.display = "none";
        window.api.invoke("goLive", id);
        linkedStatus(`Connecting to ${id}`);
    });

    window.api.on("liveConnected", () => {
        dom.linkInput.disabled = false;
        dom.linkInput.style.display = "block";
        linkedStatus("Linked!");
    });

    window.api.on("liveFailedToConnect", () => {
        dom.linkInput.disabled = false;
        dom.linkInput.style.display = "block";
        linkedStatus("Failed to link");
    });

    close.onclick = () => {
        window.api.closeWindow();
    };
    max.onclick = () => {
        window.api.maximizeWindow();
    };
    min.onclick = () => {
        window.api.minimizeWindow();
    };
    
    dom.activeModuleList = signal(false);
    dom.activeModuleList.on((value) => {
        if (value) moduleListMount.classList.add(`${style.active}`);
        else moduleListMount.classList.remove(`${style.active}`);
    });

    plugin.addEventListener("click", () => {
        dom.activeModuleList(!dom.activeModuleList());
    });
    
    dom.error = signal(true);
    dom.error.on(value => {
        if (value) moduleWrapper.classList.add(`${style.error}`);
        else moduleWrapper.classList.remove(`${style.error}`);
    });

    return dom as html<WinNav>;
};