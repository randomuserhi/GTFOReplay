import { Constructor, Macro } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";
import Fuse from "fuse.js";
import { Item } from "../../../../modules/parser/map/item.js";
import { player } from "../index.js";

const style = Style(({ style }) => {
    const wrapper = style.class`
    position: relative;
    width: 400px;
    padding: 20px;
    color: white;
    font-size: 15px;
    `;
    style`
    ${wrapper} h1 {
        font-size: 30px;
    }
    `;

    const search = style.class`
    background-color: #12121a;
    padding: 7px 10px;
    border-radius: 3px;
    color: white;
    width: 100%;
    `;

    const row = style.class`
    width: 100%;
    display: flex;
    flex-direction: column;
    `;

    const divider = style.class`
    width: 100%;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: white;
    `;

    const body = style.class`
    display: flex;
    flex-direction: column;
    `;

    const active = style.class``;
    const toggle = style.class`
    width: 50px;
    height: 15px;
    border-radius: 100px;
    border-style: solid;
    border-width: 3px;

    --color: #7169ce;
    border-color: var(--color);
    background-color: transparent;
    transition: all ease-in-out 100ms;
    `;
    style`
    ${toggle}:hover {
    --color: #bfb9eb;
    }
    ${toggle}${active} {
    background-color: var(--color);
    }
    `;

    const item = style.class`
    display: flex;
    cursor: pointer;
    `;
    style`
    ${item}:hover {
    color: #7169ce;
    }
    `;

    return {
        wrapper,
        search,
        row,
        divider,
        body,
        toggle,
        active,
        item
    };
});

export interface finder extends HTMLDivElement {
    search: HTMLInputElement;
    body: HTMLDivElement;

    includeUnknown: HTMLButtonElement;
    includeUnknownItems: boolean;

    items: { frag: { root: HTMLElement, name: HTMLSpanElement, item: Item }, key: string }[];
    fuse: Fuse<Item>;

    player: player;
    init(player: player): void;
    update(): void;
    reset(): void;
}

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "routes/player.finder": finder;
    }
}

export const finder = Macro((() => {
    const finder = function(this: finder) {
        this.items = [];
        this.fuse = new Fuse([], {
            keys: ["key"]
        });
        
        this.includeUnknownItems = false;
        this.includeUnknown.addEventListener("click", () => {
            this.includeUnknownItems = !this.includeUnknownItems;
            if (this.includeUnknownItems) this.includeUnknown.classList.add(`${style.active}`);
            else this.includeUnknown.classList.remove(`${style.active}`);
        });
    } as Constructor<finder>;

    finder.prototype.init = function(player) {
        this.player = player;
        this.includeUnknownItems = false;
        this.includeUnknown.classList.remove(`${style.active}`);
    };

    finder.prototype.update = function() {
        if (this.player.api === undefined) return;
        const api = this.player.api;
        
        const _items = [];
        let items = [...api.getOrDefault("Vanilla.Map.Items", () => new Map()).values()]; 
        
        let value = this.search.value;
        value = value.trim();
        if (value.length !== 0) {
            this.fuse.setCollection(items);
            items = this.fuse.search(value).map((n) => n.item);
        }

        let i = 0;
        for (const item of items) {
            const key = item.key;
            if (key === "Unknown" && !this.includeUnknownItems) continue;
            if (!item.onGround) continue;
            let li: { frag: { root: HTMLElement, name: HTMLSpanElement, item: Item }, key: string };
            if (i < this.items.length) {
                this.items[i].key = key;
                this.items[i].frag.name.innerText = key;
                this.items[i].frag.item = item;
                li = this.items[i];
            } else {
                const [frag, node] = Macro.anon<{
                    root: HTMLElement,
                    name: HTMLSpanElement,
                    item: Item,
                }>(/*html*/`
                    <div rhu-id="root" class="${style.item}">
                        <span rhu-id="name">${key}</span>
                    </div>
                    `);
                frag.item = item;
                li = { frag, key };
                frag.root.addEventListener("click", () => {
                    this.player.renderer.get("CameraControls")!.tp(frag.item.position);
                });
                this.body.append(frag.root);
            }
            _items.push(li);
            ++i;
        }
        for (; i < this.items.length; ++i) {
            this.items[i].frag.root.replaceWith();
        }
        this.items = _items;
    };

    finder.prototype.reset = function() {
        this.items = [];
        this.body.replaceChildren();
    };

    return finder;
})(), "routes/player.finder", //html
`
    <div style="margin-bottom: 20px;">
        <h1>ITEM FINDER</h1>
        <p>Find items around the map.</p>
    </div>
    <div style="
    position: sticky; 
    padding: 20px 0; 
    top: 0px; 
    background-color: #1f1f29;
    margin-bottom: 10px;
    ">
        <input rhu-id="search" placeholder="Search ..." class="${style.search}" type="text" spellcheck="false" autocomplete="false"/>
        <div class="${style.row}" style="
        flex-direction: row;
        align-items: center;
        margin-top: 20px;
        ">
            <span style="flex: 1; padding-top: 1px;">Include Unknown Items</span>
            <button rhu-id="includeUnknown" class="${style.toggle}"></button>
        </div>
    </div>
    <div rhu-id="body" class="${style.body}">
    </div>
    `, {
    element: //html
        `<div class="${style.wrapper}"></div>`
});