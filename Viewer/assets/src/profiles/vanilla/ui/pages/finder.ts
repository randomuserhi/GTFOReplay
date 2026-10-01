import { language, ui, uiText, uiAttribute } from "@esm/@root/main/i18n.js";
import { Mutable } from "@/rhu/html.js";
import { html } from "@esm/@/rhu/html.js";
import { computed, Signal, signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import { ItemDatablock } from "../../datablocks/items/item.js";
import type { Item } from "../../parser/map/item.js";
import { Dropdown } from "../components/dropdown.js";
import { Toggle } from "../components/toggle.js";
import { dispose } from "../main.js";
import { pageStyles } from "./lib.js";
import { filterItems, FinderEntry, FinderSort } from "./finder-filter.js";

const style = pageStyles;
const finderStyle = Style(({ css }) => {
    const filters = css.class`display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 10px;padding:10px 0;border-bottom:1px solid #303944;`;
    const field = css.class`display:grid;gap:4px;color:#a7b1c1;min-width:0;`;
    const row = css.class`grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:10px;`;
    const item = css.class`display:flex;flex-direction:column;gap:4px;width:100%;padding:10px 8px;text-align:left;color:inherit;background:transparent;border:0;border-bottom:1px solid #29313c;cursor:pointer;`;
    const reset = css.class`padding:5px 8px;color:#e5ba68;background:transparent;border:1px solid #45515f;cursor:pointer;`;
    css`${item}:hover { background:#242c35; } ${item}:focus-visible, ${reset}:focus-visible { outline:2px solid #dba852;outline-offset:-2px; } ${item} small { color:#a7b1c1; }`;
    return { filters, field, row, item, reset };
});

type Entry = FinderEntry & { item: Item; place: string };
const dimensionName = (dimension: number) => dimension === 0 ? ui("Reality") : ui("Dimension {{dimension}}", { dimension });

export const Finder = () => {
    interface Finder {
        readonly view: Signal<html<typeof View> | undefined>;
        readonly active: Signal<boolean>;
    }
    const view = signal<html<typeof View> | undefined>(undefined);
    const active = signal(false);
    const query = signal("");
    const values = signal<Entry[]>([]);
    const dimensions = signal<number[]>([]);
    const dimension = Dropdown("Dimension"), category = Dropdown("Item type"), sort = Dropdown("Sort by");
    const includeUnknown = Toggle("Include Unknown Items");
    dimension.value(0); category.value(""); sort.value("name");
    const refreshOptions = () => {
        dimension.options([[ui("All dimensions"), -1], ...dimensions().map(id => [dimensionName(id), id] as [string, number])]);
        category.options([[ui("All item types"), ""], ...[...new Set(values().filter(entry => entry.onGround && (dimension.value() === -1 || entry.dimension === dimension.value()) && (includeUnknown.value() || entry.known)).map(entry => entry.type))].sort().map(type => [type === "Unknown" ? ui("Unknown") : type, type] as [string, string])]);
        if (!category.options().some(([, value]) => value === category.value())) category.value("");
        sort.options([[ui("Name A–Z"), "name"], [ui("Name Z–A"), "name-desc"], [ui("Number: lowest first"), "number"], [ui("Number: highest first"), "number-desc"]]);
    };
    for (const source of [values, dimensions, dimension.value, includeUnknown.value, language]) source.on(refreshOptions, { signal: dispose.signal });
    const filtered = computed<Entry[]>(set => { set(filterItems(values(), {
        query: query(), dimension: dimension.value(), type: category.value(), includeUnknown: includeUnknown.value(), sort: sort.value() as FinderSort
    })); }, [values, query, dimension.value, category.value, includeUnknown.value, sort.value], (a, b) => a?.length === b?.length && a?.every((entry, i) => entry.id === b![i].id && entry.key === b![i].key && entry.dimension === b![i].dimension && entry.place === b![i].place) === true);
    const count = signal(""), empty = signal("");
    const refreshSummary = () => {
        count(ui("{{count}} items found", { count: filtered().length }));
        empty(filtered().length ? "" : ui("No items match. Try another type or clear the filters."));
    };
    filtered.on(refreshSummary, { signal: dispose.signal });
    language.on(refreshSummary, { signal: dispose.signal });
    const list = html.map(filtered, function*(entries) { for (const entry of entries) yield [entry.id, entry] as [number, Entry]; }, ([id, entry], previous?: html<{ button: HTMLButtonElement; key: Signal<string>; detail: Signal<string> }>) => {
        let row = previous;
        if (!row) {
            const key = signal(""), detail = signal("");
            row = html<Mutable<{ button: HTMLButtonElement; key: Signal<string>; detail: Signal<string> }>>`<button m-id="button" type="button" class="${finderStyle.item}"><span>${key}</span><small>${detail}</small></button>`;
            html(row).box(); row.key = key; row.detail = detail;
            row.button.addEventListener("click", () => {
                const current = values().find(entry => entry.id === id);
                if (current) view()?.renderer.get("Controls")?.tp(current.item.position, current.dimension);
            });
        }
        row.key(entry.key);
        row.detail(entry.place);
        row.button.setAttribute("data-tooltip", ui("Locate item in the replay"));
        return row;
    });
    const dom = html<Mutable<Finder & { search: HTMLInputElement; reset: HTMLButtonElement }>>`
        <div class="${style.wrapper}">
            <h1>${uiText("ITEM FINDER")}</h1>
            <p>${uiText("Find items around the map.")}</p>
            <div class="${finderStyle.filters}">
                <label class="${finderStyle.field}" style="grid-column:1/-1">${uiText("Name or number")}<input m-id="search" class="${style.search}" type="search" spellcheck="false" autocomplete="off" /></label>
                <div class="${finderStyle.field}"><span>${uiText("Dimension")}</span>${dimension}</div>
                <div class="${finderStyle.field}"><span>${uiText("Item type")}</span>${category}</div>
                <div class="${finderStyle.field}" style="grid-column:1/-1"><span>${uiText("Sort by")}</span>${sort}</div>
                <div class="${finderStyle.row}"><span>${uiText("Include Unknown Items")}</span>${includeUnknown}</div>
                <div class="${finderStyle.row}"><span role="status">${count}</span><button m-id="reset" type="button" class="${finderStyle.reset}">${uiText("Clear filters")}</button></div>
            </div>
            <p role="status">${empty}</p>
            <div class="${style.body}" style="gap:0">${list}</div>
        </div>`;
    html(dom).box(); dom.view = view; dom.active = active;
    uiAttribute(dom.search, "placeholder", "Search name or serial number", dispose.signal);
    dom.search.addEventListener("input", () => query(dom.search.value));
    dom.reset.addEventListener("click", () => { dom.search.value = ""; query(""); dimension.value(0); category.value(""); sort.value("name"); includeUnknown.value(false); });
    const updateItems = () => {
        if (!active()) return;
        const items = view()?.api()?.get("Vanilla.Map.Items");
        const mapped: Entry[] = [];
        for (const item of items?.values() ?? []) {
            const spec = item.itemID.type === "Internal_Finder_Item" ? undefined : ItemDatablock.get(item.itemID);
            const type = item.itemID.type === "Internal_Finder_Item" ? item.itemID.stringKey : spec?.serial ?? spec?.name ?? "Unknown";
            const suffix = item.serialNumber < 1000 ? `_${item.serialNumber}` : "";
            mapped.push({ item, id:item.id, type, key:type === "Unknown" ? item.itemID.hash : `${type}${suffix}`, known:type !== "Unknown", dimension:item.dimension, onGround:item.onGround, serial:item.serialNumber, place:dimensionName(item.dimension) });
        }
        values(mapped);
    };
    active.on(updateItems, { signal: dispose.signal });
    language.on(updateItems, { signal: dispose.signal });
    view.on(current => {
        values([]); dimensions([]);
        if (!current) return;
        current.replay.on(replay => {
            dimensions([]);
            replay?.watch("Vanilla.Map.Geometry").on(map => dimensions(map ? [...map.keys()] : []), { signal: dispose.signal });
        }, { signal: dispose.signal });
        current.api.on(updateItems, { signal: dispose.signal });
    }, { signal: dispose.signal });
    return dom as html<Finder>;
};
