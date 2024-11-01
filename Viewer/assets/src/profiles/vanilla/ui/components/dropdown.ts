import { HTML, html, MACRO, Macro, MacroElement, RHU_MAP } from "@esm/@/rhu/macro.js";
import { signal, Signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";

const style = Style(({ css }) => {
    const wrapper = css.class`
    position: relative;

    display: flex;
    flex-direction: column;
    flex-shrink: 0;

    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    `;
    css`
    ${wrapper}:focus {
        outline: none;
    }
    `;

    const active = css.class``;

    const body = css.class`
    width: 100%;
    display: none;
    flex-direction: column;
    position: absolute;
    top: 33px;
    max-height: 300px;
    overflow-y: auto;
    overflow-x: none;
    `;

    css`
    ${wrapper}${active} {
        z-index: 1000;
    }

    ${body}::-webkit-scrollbar-track {
        background-color: #12121a;
        border-style: none;
        border-radius: 0;
    }

    ${wrapper}${active} ${body} {
        display: flex;
    }
    `;

    const item = css.class`
    display: flex;
    flex-direction: column;
    flex-shrink: 0;

    width: 100%;
    height: 33px;
    padding: 7px 10px;
    
    color: white;
    background-color: #12121a;

    cursor: pointer;
    `;
    css`
    ${item}:hover {
        background-color: #313145;
    }
        
    ${wrapper}>${item} {
        border-radius: 3px;
    }
    ${wrapper}${active}>${item} {
        border-radius: 3px 3px 0 0;
    }

    ${wrapper}${active}>${body}:last-child {
        border-radius: 0 0 3px 3px;
    }
    `;

    return {
        wrapper,
        body,
        item,
        active
    };
});

const Item = Macro(class Item extends MacroElement {
    private _frag = new DocumentFragment();
    get frag() {
        this._frag.replaceChildren(...this.dom);
        return this._frag;
    }

    public remove() {
        this._frag.replaceChildren(...this.dom);
    }

    public key: Signal<string>;
    public value: any = undefined;
    public button: HTMLSpanElement;
}, () => html`<span m-id="button" class="${style.item}">${Macro.signal("key")}</span>`);

export const Dropdown = Macro(class Dropdown extends MacroElement {
    public wrapper: HTMLDivElement;
    private select: HTMLDivElement;
    private selected: Signal<string>;
    private items: RHU_MAP<string, any, HTML<{ body: HTMLDivElement }>, MACRO<typeof Item>>;
    private valueMap = new Map<any, string>();

    constructor(dom: Node[], bindings: []) {
        super(dom, bindings);
        
        this.items.onappend.add((wrapper, dom, item) => {
            wrapper.body.append(...dom);
            item.button.addEventListener("click", () => {
                this.active(false);
                this.value(item.value);
            });
        });
        this.items.onupdate.add((item, key, value) => {
            item.key(key);
            item.value = value;
        });

        this.options.on((values) => {
            this.items.assign(values);

            for (const [key, value] of values) {
                this.valueMap.set(value, key);
            }

            const value = this.value();
            if (!this.valueMap.has(value)) this.selected("");
            else this.selected(this.valueMap.get(value)!);
        });

        this.active.guard = (active) => {
            if (this.items.size === 0) return false;
            return active;
        }; 

        this.active.on((active) => {
            if (active) this.wrapper.classList.add(`${style.active}`);
            else this.wrapper.classList.remove(`${style.active}`);
        });

        this.select.addEventListener("click", () => {
            this.active(!this.active());
        });

        this.wrapper.addEventListener("blur", () => {
            this.active(false);
        });

        this.value.on((value) => {
            if (!this.valueMap.has(value)) this.selected("");
            else this.selected(this.valueMap.get(value)!);
        });
    }
    
    private active = signal(false);

    public value = signal<any>(undefined);
    public options = signal<[key: string, value: any][]>([], (a, b) => {
        if (a === undefined && b === undefined) return true;
        if (a === undefined || b === undefined) return false;
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; ++i) {
            if (a[i][0] !== b[i][1]) return false; // TODO(randomuserhi): allow for custom equality
        }
        return true;
    });
}, () => html`
    <div m-id="wrapper" class="${style.wrapper}" tabindex="-1">
        <span m-id="select" class="${style.item}">${Macro.signal("selected")}</span>
        ${
    Macro.map<string, any, HTML<{ body: HTMLDivElement }>, MACRO<typeof Item>>(
        html`<div m-id="body" class="${style.body}"></div>`,
        Item())
        .bind("items")}
    </div>
    `);