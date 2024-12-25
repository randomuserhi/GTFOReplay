import { Mutable } from "@/rhu/html.js";
import { html } from "@esm/@/rhu/html.js";
import { computed, Signal, signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import Fuse from "@esm/fuse.js";
import { ItemDatablock } from "../../datablocks/items/item.js";
import { Item } from "../../parser/map/item.js";
import { Dropdown } from "../components/dropdown.js";
import { Toggle } from "../components/toggle.js";
import { dispose } from "../main.js";
import { pageStyles } from "./lib.js";

const style = pageStyles;

const itemStyle = Style(({ css }) => {
    const item = css.class`
    display: flex;
    cursor: pointer;
    `;
    css`
    ${item}:hover {
    color: #7169ce;
    }
    `;

    return {
        item
    };
});

const Item = () => {
    interface UIItem {
        readonly key: Signal<string>;
        readonly button: HTMLSpanElement;
        readonly onGround: Signal<boolean>;
        item: Item;
    }
    interface Private {
    }

    const key = signal("key");

    const dom = html<Mutable<Private & UIItem>>/**//*html*/`
        <div m-id="button" class="${itemStyle.item}">
            <span>${key}</span>
        </div>
		`;
    html(dom).box();

    dom.key = key;
    dom.onGround = signal(false);

    dom.onGround.on((value) => {
        if (value) dom.button.style.display = "flex";
        else dom.button.style.display = "none";
    });

    return dom as html<UIItem>;
};

export const Finder = () => {
    interface Finder {
        readonly view: Signal<html<typeof View> | undefined>;
        readonly active: Signal<boolean>;
    }
    interface Private {
        readonly search: HTMLInputElement;
        readonly body: HTMLDivElement;
    }

    const dropdown = Dropdown();
    dropdown.wrapper.style.width = "100%";

    const includeUnknown = Toggle();

    const filter = signal("");
    
    const fuse = new Fuse<{ item: Item, key: string }>([], { keys: ["key"] });
    const values = signal<{ item: Item, key: string }[]>([]);
    const filtered = computed<{ item: Item, key: string }[]>((set) => {
        let filtered = values().filter(({ item }) => (includeUnknown.value() ? true : (item.itemID.type === "Internal_Finder_Item" || ItemDatablock.has(item.itemID))) && item.dimension === dropdown.value());
        const filterStr = filter();
        if (filterStr !== "") {
            fuse.setCollection(filtered);
            filtered = fuse.search(filterStr).map((n) => n.item);
        }
        set(filtered);
    }, [values, includeUnknown.value, filter], (a, b) => {
        if (a === undefined && b === undefined) return true;
        if (a === undefined || b === undefined) return false;
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

    const _view = signal<html<typeof View> | undefined>(undefined);

    const list = html.map(filtered, function*(values) { for (const {item, key} of values) { yield [key, item]; } }, (kv, el?: html<typeof Item>) => {
        const [k, item] = kv;
        if (el === undefined) {
            const _el = Item();
            _el.button.addEventListener("click", () => {
                const view = _view();
                if (view === undefined) return;
                
                view.renderer.get("Controls")?.tp(_el.item.position, _el.item.dimension);
            });
            el = _el;
        }
        el.item = item;
        el.key(k === "Unknown" ? `${item.itemID.hash}` : k);
        el.onGround(item.onGround);
        return el;
    });

    const dom = html<Mutable<Private & Finder>>/**//*html*/`
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
            z-index: 100;
            ">
                <input m-id="search" placeholder="Search ..." class="${style.search}" type="text" spellcheck="false" autocomplete="false"/>
                <div class="${style.row}" style="
                margin-top: 20px;
                ">
                    ${dropdown}
                </div>
                <div class="${style.row}" style="
                flex-direction: row;
                align-items: center;
                margin-top: 20px;
                ">
                    <span style="flex: 1; padding-top: 1px;">Include Unknown Items</span>
                    ${includeUnknown}
                </div>
            </div>
            <div class="${style.body}" style="gap: 0px;">
                ${list}
            </div>
        </div>
        `;
    html(dom).box();

    dom.view = _view;
    dom.active = signal(false);

    dom.search.addEventListener("keyup", () => filter(dom.search.value));

    dropdown.value(0);

    _view.on((view) => {
        if (view === undefined) {
            dropdown.options([]);
            return;
        }

        view.replay.on((replay) => {
            if (replay === undefined) {
                dropdown.options([]);
                return;
            }

            replay.watch("Vanilla.Map.Geometry").on((map) => {
                if (map === undefined) {
                    dropdown.options([]);
                    return;
                }

                const dimensions: [key: string, value: any][] = [];
                for (const dimension of map.keys()) {
                    dimensions.push([
                        dimension === 0 ? `Reality` : `Dimension ${dimension}`,
                        dimension
                    ]);
                }
                dropdown.options(dimensions);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        view.api.on((api) => {
            if (!dom.active()) return;
            
            if (api === undefined) return;

            const items = api.get("Vanilla.Map.Items");
            if (items === undefined) return;

            const mapped = [];
            for (const item of items.values()) {
                if (item.itemID.type === "Internal_Finder_Item") {
                    const _serial = item.serialNumber < 1000 ? `_${item.serialNumber}` : ""; 
                    const key = `${item.itemID.stringKey}${_serial}`;
                    mapped.push({ item, key });
                } else {
                    const spec = ItemDatablock.get(item.itemID);
                    const _serial = item.serialNumber < 1000 ? `_${item.serialNumber}` : ""; 
                    const serial = item.serialNumber < 1000 ? ` (${item.serialNumber})` : "";
                    const key = spec === undefined ? "Unknown" : spec.serial === undefined ? spec.name === undefined ? "Unknown" : `${spec.name}${serial}` : `${spec.serial}${_serial}`;
                    mapped.push({ item, key });
                }
            }
            values(mapped);
        }, { signal: dispose.signal });
    }, { signal: dispose.signal });

    return dom as html<Finder>;
};