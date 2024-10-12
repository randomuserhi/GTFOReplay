import { HTML, html, MACRO, Macro, MacroElement, RHU_CHILDREN, RHU_LIST } from "@/rhu/macro.js";
import { computed, signal, Signal } from "@/rhu/signal.js";
import { Style } from "@/rhu/style.js";
import Fuse from "fuse.js";
import { app } from "../../../app.js";
import * as icons from "../atoms/icons/index.js";

const moduleListStyles = Style(({ style }) => {
    const wrapper = style.class`
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

    const sticky = style.class`
    display: flex;
    background-color: #2a2a43;
    padding: 5px;
    border-radius: 4px 4px 0 0;
    `;

    const filter = style.class`
    background-color: #12121a;
    padding: 3px 5px;
    border-radius: 4px;
    color: white;
    width: 100%;
    `;

    const mount = style.class`
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: white;
    padding: 5px;
    max-height: 300px;
    overflow: auto;
    `;

    const item = style.class`
    padding: 3px 5px;
    cursor: pointer;
    `;
    style`
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

const ModuleItem = Macro(class ModuleItem extends MacroElement {
    public button: HTMLLIElement;
    public key: Signal<string>;
}, html`<li m-id="button" class="${moduleListStyles.item}">${Macro.signal("key")}</li>`);

const ModuleList = Macro(class ModuleList extends MacroElement {
    constructor (dom: Node[], bindings: any) {
        super(dom, bindings);
    
        this.input.addEventListener("keyup", () => this.filter(this.input.value));

        this.items.onappend.add((wrapper, dom, item) => {
            wrapper.mount.append(...dom);
            item.button.addEventListener("click", () => {
                // (To aid Garbage Collection, refresh window via electron instead of reloading using hot-reload mechanism)
                //window.api.send("defaultModule", item.key());
                window.api.invoke("loadModule", item.key()).then((response) => {
                    app().onLoadModule(response);
                });
            });
        });
        this.items.onupdate.add((item, value) => {
            item.key(value);
        });

        this.filtered.on((values) => this.items.assign(values));
    }

    private input: HTMLInputElement;
    private filter = signal("");

    private items: RHU_LIST<string, HTML<{ mount: HTMLUListElement }>, MACRO<typeof ModuleItem>>;

    private validation = new Set<string>();
    public values = signal<string[]>([]);
    private fuse = new Fuse(this.values(), { keys: ["key"] });
    private filtered = computed<string[]>((set) => {
        let values = this.values();
        this.fuse.setCollection(values);
        const filter = this.filter();
        if (filter.trim() !== "") {
            this.fuse.setCollection(this.values());
            values = this.fuse.search(filter).map((n) => n.item);
        }
        set(values);
    }, [this.values, this.filter], (a, b) => {
        if (a === undefined && b === undefined) return true;
        if (a === undefined || b === undefined) return false;
        if (a.length !== b.length) return false;
        this.validation.clear();
        for (let i = 0; i < a.length; ++i) {
            this.validation.add(a[i]);
            if (!this.validation.has(b[i])) return false;
        }
        return true;
    });

    public mount: HTMLDivElement;
}, html`
    <div class="${moduleListStyles.wrapper}">
        <div class="${moduleListStyles.sticky}">
            <input m-id="input" placeholder="Search ..." class="${moduleListStyles.filter}" type="text" spellcheck="false" autocomplete="false" value=""/>
        </div>
        ${
    Macro.list<string, HTML<{ mount: HTMLUListElement }>, MACRO<typeof ModuleItem>>(
        html`<ul m-id="mount" class="${moduleListStyles.mount}"></ul>`,
        ModuleItem())
        .bind("items")}
    </div>
    `);

const style = Style(({ style }) => {
    const height = "40px";

    const wrapper = style.class`
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
    const button = style.class`
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
    style`
    ${button}:focus {
        outline:0;
    }
    ${button}:hover {
        color: white;
        background-color: #272733; /*TODO: Theme-ColorScheme*/
    }
    `;
    const text = style.class`
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

    const popup = style.class`
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
    style`
    ${button}:hover + div ${popup} {
        display: block;
    }
    `;

    const active = style.class``;
    style`
    ${active} ${popup} {
        display: block;
    }
    ${active} ${moduleListStyles.wrapper} {
        display: block;
    }
    `;

    const error = style.class`
    background-color: #2d1623;
    border-color: #e81b23;
    `;

    const mount = style.class`
    position: absolute;
    top: calc(100% + 5px);
    left: 5px;
    display: flex; 
    gap: 5px;
    color: white;
    `;

    return {
        wrapper,
        button,
        text,
        popup,
        mount,
        active,
        error
    };
});

export const WinNav = Macro(class WinNav extends MacroElement {
    close: HTMLButtonElement;
    max: HTMLButtonElement;
    min: HTMLButtonElement;
    icon: HTMLButtonElement;
    plugin: HTMLButtonElement;
    mount: HTMLDivElement;

    error = signal(true);
    module: Signal<string | undefined>;
    moduleWrapper: HTMLDivElement;
    moduleList: Macro<typeof ModuleList>;
    
    private moduleListMount: HTMLDivElement;
    activeModuleList = signal(false);

    constructor(dom: Node[], bindings: any, children: RHU_CHILDREN) {
        super(dom, bindings);

        this.plugin.addEventListener("click", () => {
            this.activeModuleList(!this.activeModuleList());
        });

        this.activeModuleList.on((value) => {
            if (value) this.moduleListMount.classList.add(`${style.active}`);
            else this.moduleListMount.classList.remove(`${style.active}`);
        });

        this.error.on(value => {
            if (value) this.moduleWrapper.classList.add(`${style.error}`);
            else this.moduleWrapper.classList.remove(`${style.error}`);
        });

        this.close.onclick = () => {
            window.api.closeWindow();
        };
        this.max.onclick = () => {
            window.api.maximizeWindow();
        };
        this.min.onclick = () => {
            window.api.minimizeWindow();
        };

        this.mount.append(...children);
    }
}, html`
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
                ${ModuleList().bind("moduleList")}
                <span style="flex-shrink: 0; margin-top: 5px;"><div m-id="moduleWrapper" class="${style.popup} ${style.error}">
                    ${Macro.signal("module", "No profile loaded!")}
                </div></span>
            </div>
        </span>
        <div m-id="icon" class="${style.button}" style="padding: 10px; width: 60px;" tabindex="-1" role="button" aria-label="Load Replay">
            ${icons.rug()}
        </div>
    </nav>
    `);