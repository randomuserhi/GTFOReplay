import { html, Macro, MacroElement } from "@esm/@/rhu/macro.js";
import { Computed, computed, Signal, signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import Fuse from "@esm/fuse.js";
import { ItemDatablock } from "../../datablocks/items/item.js";
import { Item } from "../../parser/map/item.js";
import { Dropdown } from "../components/dropdown.js";
import { Toggle } from "../components/toggle.js";
import { pageStyles } from "./lib.js";

const style = pageStyles;

const itemStyle = Style(({ style }) => {
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
        item
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
    public onGround = signal(false);

    constructor(dom: Node[], bindings: any, children: Node[]) {
        super(dom, bindings);

        this.onGround.on((value) => {
            if (value) this.button.style.display = "flex";
            else this.button.style.display = "none";
        });
    }
}, html`
    <div m-id="button" class="${itemStyle.item}">
        <span>${Macro.signal("key")}</span>
    </div>`
);

export const Finder = Macro(class Finder extends MacroElement {
    public view = signal<Macro<typeof View> | undefined>(undefined);

    private dropdown: Macro<typeof Dropdown>;
    private search: HTMLInputElement;
    private includeUnknown: Macro<typeof Toggle>;
    private body: HTMLDivElement;

    private fuse = new Fuse<{ item: Item, key: string }>([], { keys: ["key"] });

    private _items = new Map<number, Macro<typeof Item>>(); 
    private items = new Map<number, Macro<typeof Item>>();

    private values = signal<{ item: Item, key: string }[]>([]);
    private filtered: Computed<{ item: Item, key: string }[]>;
    private filter = signal("");

    public active = signal(false);

    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);

        this.filtered = computed<{ item: Item, key: string }[]>(() => {
            let filtered = this.values().filter(({ item }) => (this.includeUnknown.value() ? true : item.dimension === this.dropdown.value()) && ItemDatablock.has(item.itemID));
            const filter = this.filter();
            if (filter !== "") {
                this.fuse.setCollection(filtered);
                filtered = this.fuse.search(filter).map((n) => n.item);
            }
            return filtered;
        }, [this.values, this.includeUnknown.value, this.filter], (a, b) => {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; ++i) {
                if (a[i].item.id !== b[i].item.id) return false;
                if (a[i].item.onGround !== b[i].item.onGround) return false;
                if (a[i].key !== b[i].key) return false;
                if (a[i].item.position.x !== b[i].item.position.x && a[i].item.position.y !== b[i].item.position.y && a[i].item.position.z !== b[i].item.position.z) return false;
                if (a[i].item.dimension !== b[i].item.dimension) return false;
            }
            return true;
        });

        this.search.addEventListener("keyup", () => this.filter(this.search.value));

        this.dropdown.value(0);

        this.filtered.on((values) => {
            for (const { item, key } of values) {
                let el = this.items.get(item.id);
                if (el === undefined) {
                    el = Macro.create(Item());
                    el.button.addEventListener("click", () => {
                        const view = this.view();
                        if (view === undefined) return;

                        view.renderer.get("Controls")?.tp(item.position, item.dimension);
                    });
                    this.body.append(el.frag);
                }
                el.key(key === "Unknown" ? `${item.itemID.hash}` : key);
                el.onGround(item.onGround);
                this._items.set(item.id, el);
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

        this.view.on((view) => {
            if (view === undefined) {
                this.dropdown.options([]);
                return;
            }

            view.replay.on((replay) => {
                if (replay === undefined) {
                    this.dropdown.options([]);
                    return;
                }

                replay.watch("Vanilla.Map.Geometry").on((map) => {
                    if (map === undefined) {
                        this.dropdown.options([]);
                        return;
                    }
    
                    const dimensions: { key: string, value: any }[] = [];
                    for (const dimension of map.keys()) {
                        dimensions.push({
                            key: dimension === 0 ? `Reality` : `Dimension ${dimension}`,
                            value: dimension
                        });
                    }
                    this.dropdown.options(dimensions);
                });
            });

            view.api.on((api) => {
                if (!this.active()) return;
                
                if (api === undefined) return;

                const items = api.get("Vanilla.Map.Items");
                if (items === undefined) return;

                const mapped = [];
                for (const item of items.values()) {
                    const spec = ItemDatablock.get(item.itemID);
                    const _serial = item.serialNumber < 1000 ? `_${item.serialNumber}` : ""; 
                    const serial = item.serialNumber < 1000 ? ` (${item.serialNumber})` : "";
                    const key = spec === undefined ? "Unknown" : spec.serial === undefined ? spec.name === undefined ? "Unknown" : `${spec.name}${serial}` : `${spec.serial}${_serial}`;
                    mapped.push({ item, key });
                }
                this.values(mapped);
            });
        });
    }
}, html`
    <div class="${style.wrapper}">
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
            <input m-id="search" placeholder="Search ..." class="${style.search}" type="text" spellcheck="false" autocomplete="false"/>
            <div class="${style.row}" style="
            margin-top: 20px;
            ">
                ${Dropdown().bind("dropdown").then((dropdown) => dropdown.wrapper.style.width = "100%")}
            </div>
            <div class="${style.row}" style="
            flex-direction: row;
            align-items: center;
            margin-top: 20px;
            ">
                <span style="flex: 1; padding-top: 1px;">Include Unknown Items</span>
                ${Toggle().bind("includeUnknown")}
            </div>
        </div>
        <div m-id="body" class="${style.body}" style="gap: 0px;">
        </div>
    </div>
    `);