import { html, Macro, MacroElement } from "@esm/@/rhu/macro.js";
import { Computed, computed, Signal, signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import Fuse from "@esm/fuse.js";
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

    constructor(dom: Node[], bindings: any, children: Node[], key: string) {
        super(dom, bindings);

        this.key(key);
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

    private fuse = new Fuse<Item>([], { keys: ["key"] });

    private _items = new Map<number, Macro<typeof Item>>(); 
    private items = new Map<number, Macro<typeof Item>>();

    private values = signal<Item[]>([]);
    private filtered: Computed<Item[]>;
    private filter = signal("");

    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);

        this.filtered = computed<Item[]>(() => {
            let filtered = this.values().filter(({ key, dimension }) => this.includeUnknown.value() ? true : dimension === this.dropdown.value() && key !== "Unknown");
            const filter = this.filter();
            if (filter !== "") {
                this.fuse.setCollection(filtered);
                filtered = this.fuse.search(filter).map((n) => n.item);
            }
            return filtered;
        }, [this.values, this.includeUnknown.value, this.filter], (a, b) => {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; ++i) {
                if (a[i].id !== b[i].id) return false;
                if (a[i].position.x !== b[i].position.x || a[i].position.y !== b[i].position.y || a[i].position.z !== b[i].position.z) return false;
                if (a[i].dimension !== b[i].dimension) return false;
            }
            return true;
        });

        this.search.addEventListener("keyup", () => this.filter(this.search.value));

        this.dropdown.value(0);

        this.filtered.on((values) => {
            for (const { id, itemID, key, position, dimension } of values) {
                if (this.items.has(id)) {
                    this._items.set(id, this.items.get(id)!);
                } else {
                    const item = Macro.create(Item(key === "Unknown" ? `${itemID.hash}` : key));
                    item.button.addEventListener("click", () => {
                        const view = this.view();
                        if (view === undefined) return;

                        view.renderer.get("Controls")?.tp(position, dimension);
                    });
                    this._items.set(id, item);
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
                if (api === undefined) return;

                const items = api.get("Vanilla.Map.Items");
                if (items === undefined) return;

                this.values([...items.values()]);
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