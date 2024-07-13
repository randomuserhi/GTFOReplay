import { html, Macro, MacroElement } from "@esm/@/rhu/macro.js";
import { signal, Signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";

const style = Style(({ style }) => {
    const wrapper = style.class`
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
    style`
    ${wrapper}:focus {
        outline: none;
    }
    `;

    const active = style.class``;

    const body = style.class`
    width: 100%;
    display: none;
    flex-direction: column;
    position: absolute;
    top: 33px;
    max-height: 300px;
    overflow-y: auto;
    overflow-x: none;
    `;

    style`
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

    const item = style.class`
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
    style`
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
    public button: HTMLSpanElement;

    constructor(dom: Node[], bindings: any, children: Node[], key: string) {
        super(dom, bindings);

        this.key(key);
    }
}, html`<span m-id="button" class="${style.item}">${Macro.signal("key")}</span>`);

export const Dropdown = Macro(class Dropdown extends MacroElement {
    public wrapper: HTMLDivElement;
    private body: HTMLDivElement;
    private select: HTMLDivElement;
    private selected: Signal<string>;
    
    private map = new Map<string, any>();

    private _items = new Map<string, Macro<typeof Item>>(); 
    private items = new Map<string, Macro<typeof Item>>();
    
    constructor(dom: Node[], bindings: []) {
        super(dom, bindings);
        
        this.options.on((values) => {
            this.map.clear();
            for (const { key, value } of values) {
                this.map.set(value, key);

                if (this.items.has(value)) {
                    this._items.set(value, this.items.get(value)!);
                } else {
                    const item = Macro.create(Item(key));
                    item.button.addEventListener("click", () => {
                        this.active(false);
                        this.value(value);
                    });
                    this._items.set(value, item);
                    this.body.append(item.frag);
                }
            }
            
            for (const [key, item] of this.items) {
                if (this._items.has(key)) continue;
                item.remove();
            }
            
            const temp = this.items;
            this.items = this._items;
            this._items = temp;
            this._items.clear();
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
            if (!this.map.has(value)) this.selected("");
            else this.selected(this.map.get(value));
        });
    }
    
    private active = signal(false);

    public value = signal<any>(undefined);
    public options = signal<{ key: string, value: any }[]>([], (a, b) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; ++i) {
            if (a[i].value !== b[i].value) return false; // TODO(randomuserhi): allow for custom equality
        }
        return true;
    });
}, html`
    <div m-id="wrapper" class="${style.wrapper}" tabindex="-1">
        <span m-id="select" class="${style.item}">${Macro.signal("selected")}</span>
        <div m-id="body" class="${style.body}">
        </div>
    </div>
    `);