import { Constructor, Macro } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";

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

export interface dropdown extends HTMLDivElement {
    display: HTMLSpanElement;
    body: HTMLDivElement;
    items: Map<any, HTMLElement>;
    _items: Map<any, HTMLElement>;
    value?: any;

    onSet?: (key: any) => void;

    active: boolean;
    setActive(active: boolean): void;
    
    update(items: [any, string][]): void;
    set(key?: any, trigger?: boolean): void;
    add(key: any, value: string): void;
    delete(key: any): void;
    clear(): void;
}

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "routes/player.dropdown": dropdown;
    }
}

export const dropdown = Macro((() => {
    const dropdown = function(this: dropdown) {
        this.active = false;
        this.items = new Map();
        this._items = new Map();
        this.value = undefined;

        this.display.addEventListener("click", () => {
            this.setActive(!this.active);
        });

        this.addEventListener("blur", () => {
            this.setActive(false);
        });
    } as Constructor<dropdown>;

    dropdown.prototype.update = function(items) {
        this._items.clear();
        let i = 0;
        for (const el of this.items.values()) {
            if (i < items.length) {
                el.innerText = items[i][1];
                this._items.set(items[i][0], el);
            } else {
                break;
            }
            ++i;
        }
        const temp = this.items;
        this.items = this._items;
        this._items = temp; 
        while (i < items.length) {
            this.add(...items[i]);
            ++i;
        }

        if (!this.items.has(this.value)) {
            this.set();
        }
    };

    dropdown.prototype.setActive = function(active) {
        this.active = active;

        if (this.items.size === 0) this.active = false;

        if (active) this.classList.add(`${style.active}`);
        else this.classList.remove(`${style.active}`);
    };

    dropdown.prototype.set = function(key, trigger = true) {
        const text = this.items.get(key)?.textContent;
        if (text !== undefined) {
            this.display.textContent = text;
        } else {
            this.display.textContent = "";
        }
        this.value = key;
        if (trigger) this.onSet?.call(this, key);
    };

    dropdown.prototype.add = function(key, value) {
        const [frag, node] = Macro.anon<{
            item: HTMLSpanElement;
        }>(/*html*/`
            <span m-id="item" class="${style.item}">${value}</span>
            `);
        frag.item.addEventListener("click", () => {
            this.set(key);
            this.setActive(false);
        });

        const el = node.children[0] as HTMLElement;
        this.items.set(key, el);
        this.body.appendChild(el);
    };

    dropdown.prototype.delete = function(key) {
        this.items.get(key)?.replaceWith();
        this.items.delete(key);
    };

    dropdown.prototype.clear = function() {
        this.items.clear();
        this.body.replaceChildren();
        this.set();
    };

    return dropdown;
})(), "routes/player.dropdown", //html
`
    <span m-id="display" class="${style.item}"></span>
    <div m-id="body" class="${style.body}">
    </div>
    `, {
    element: //html
        `<div class="${style.wrapper}" tabindex="0"></div>`
});