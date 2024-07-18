import { html, Macro, MacroElement } from "@esm/@/rhu/macro.js";
import { Rest } from "@esm/@/rhu/rest.js";
import { Signal, signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import { dispose } from "./main.js";
import { Medal, MedalDatablock } from "./medals.js";

const style = Style(({ style }) => {
    const wrapper = style.class`
    position: relative;
    width: 100%;
    height: 100%;
    
    overflow: visible;
    
    display: grid;
    border-collapse: collapse;
    min-width: 100%;
    grid-template-columns: 
        1fr
        2fr
        2fr
        2fr
        4fr;
    grid-row-gap: 15px;
    `;
    style`
    ${wrapper} thead,
    ${wrapper} tbody,
    ${wrapper} tr {
        display: contents;
    }`;

    const slot = style.class`
    font-size: 20px;
    color: white;
    background-color: rgba(0, 0, 0, 0.9);

    transition: background-color 200ms;
    `;

    style`
    ${slot} td {
        position: relative;

        background-color: inherit;
        border-color: rgba(0, 0, 0, 0);
        padding: 25px 15px;
        border-style: solid;
        border-width: 1px;
        border-bottom-style: solid;
        border-bottom-width: 5px;
        border-bottom-color: white;

        display: flex;
        align-items: center;
        justify-content: center;
    }
    `;

    // Steam styles
    const avatar = style.class`
    cursor: pointer;
    `;
    style`
    ${avatar} .playerAvatarAutoSizeInner {
        position: relative;
    }
    ${avatar} .profile_avatar_frame {
        position: absolute;
    }
    ${avatar} .profile_avatar_frame img {
        transform: scale(1.22);
    }
    `;

    return {
        wrapper,
        slot,
        avatar
    };
});

const Slot = Macro(class Slot extends MacroElement {
    public wrapper: HTMLTableElement;
    private avatar: HTMLTableCellElement;
    constructor(dom: Node[], bindings: any, children: Node[], key: bigint) {
        super(dom, bindings);

        this.key = key;

        this.health.on((health) => {
            let bgColor = "rgba(0, 0, 0, 0.9)";
            if (health <= 0) {
                bgColor = "rgba(255, 0, 0, 0.5)";
            }
            for (const el of this.dom as HTMLElement[]) {
                el.style.backgroundColor = bgColor;
            }
        });

        this.medals.on((medals) => {
            for (const [key, value] of medals) {
                let item: Macro<typeof Medal>;
                if (this.items.has(key)) {
                    item = this.items.get(key)!;
                    this._items.set(key, item);
                } else {
                    const medal = MedalDatablock.get(key);
                    if (medal === undefined) throw new Error(`Unable to find medal of type ${key}.`);
                    item = Macro.create(Medal(key, medal.icon, medal.description));
                    this._items.set(key, item);
                    this.medalList.append(item.frag);
                }
                item.value(value);
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

        fetchProfilePicture(key).then(frag => { 
            if (frag !== undefined) {
                this.avatar.replaceChildren(frag);
                this.avatar.addEventListener("click", () => {
                    window.open(`https://steamcommunity.com/profiles/${key}`, '_blank')?.focus();
                }, { signal: dispose.signal });
            } 
        });

        this.name.guard = (name) => {
            if (name.length > 30) {
                return `${name.slice(0, 27)}...`;
            }
            return name;
        };
    }

    public remove() {
        this.wrapper.remove();
    }

    private key: bigint;
    public health = signal<number>(100);

    public name: Signal<string>;
    public kills: Signal<string>;
    public assists: Signal<string>;
    public medals = signal<Map<string, string>>(new Map(), (current, next) => {
        if (current.size === 0 && next.size === 0) return true;
        return false;
    });

    private medalList: HTMLTableCellElement;

    private _items = new Map<string, Macro<typeof Medal>>(); 
    private items = new Map<string, Macro<typeof Medal>>();

    public view = signal<Macro<typeof View> | undefined>(undefined);
}, html`
    <tr m-id="wrapper" class="${style.slot}">
        <td m-id="avatar" class="${style.avatar}" style="padding: 10px;"></td>
        <td><span>${Macro.signal("name", "Name")}</span></td>
        <td><span>${Macro.signal("kills", "0")}</span></td>
        <td><span>${Macro.signal("assists", "0")}</span></td>
        <td m-id="medalList" style="padding: 0; gap: 10px;">
        </td>
    </tr>
    `);

const htmlParser = new DOMParser();
const fetchProfilePicture = Rest.fetch<HTMLDivElement | undefined, [snet: bigint]>({
    url: (snet: bigint) => new URL(`https://steamcommunity.com/profiles/${snet}`),
    fetch: async () => ({
        method: "GET"
    }),
    callback: async (resp) => {
        const frame = htmlParser.parseFromString(await resp.text(), 'text/html');
        return frame.querySelector("div.playerAvatarAutoSizeInner") as (HTMLDivElement | undefined);
    }
});

export const Scoreboard = Macro(class Scoreboard extends MacroElement {
    public wrapper: HTMLDivElement;
    private table: HTMLTableElement;

    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);

        this.view.on((view) => {
            if (view === undefined) {
                this.slots([]);
                return;
            }

            this.slots.on((slots) => {
                const api = view.api();
                if (api === undefined) return;

                this.awardedMedals.clear();
                for (const definition of MedalDatablock.values()) {
                    definition.award(this.awardedMedals, api, slots);
                }

                const tracker = api.get("Vanilla.StatTracker");
                const players = api.get("Vanilla.Player.Snet");
                const status = api.get("Vanilla.Player.Stats");
                if (players === undefined) return;

                for (const snet of slots) {
                    const player = players.get(snet);
                    if (player === undefined) continue;

                    let item: Macro<typeof Slot>;
                    if (this.items.has(snet)) {
                        item = this.items.get(snet)!;
                        this._items.set(snet, item);
                    } else {
                        item = Macro.create(Slot(snet));
                        this._items.set(snet, item);
                        this.table.append(item.wrapper);
                    }
                    item.name(`${player.nickname}`);
                    const health = status?.get(player.id)?.health;
                    item.health(health === undefined ? 100 : health);

                    if (this.awardedMedals.has(snet)) item.medals(this.awardedMedals.get(snet)!);
                    else item.medals(new Map());

                    const stats = tracker?.players.get(snet);
                    if (stats === undefined) {
                        item.kills(`0`);
                        item.assists(`0`);
                    } else {
                        let totalKills = 0;
                        for (const kills of stats.kills.values()) {
                            totalKills += kills.value;
                        }
                        let mineKills = 0;
                        for (const kills of stats.mineKills.values()) {
                            mineKills += kills.value;
                        }
                        let sentryKills = 0;
                        for (const kills of stats.sentryKills.values()) {
                            sentryKills += kills.value;
                        }
                        const nonPlayerKills = mineKills + sentryKills;
                        item.kills(`${totalKills}${(nonPlayerKills != 0 ? ` (${nonPlayerKills})` : "")}`);

                        let totalAssists = 0;
                        for (const assists of stats.assists.values()) {
                            totalAssists += assists.value;
                        }
                        item.assists(`${totalAssists}`);
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

                if (slots.length === 0) {
                    this.table.style.display = "none";
                } else {
                    this.table.style.display = "contents";
                }
            });

            view.api.on((api) => {
                if (api === undefined) return;
                
                const players = api.get("Vanilla.Player");
                if (players === undefined) {
                    this.slots([]);
                    return;
                }
                const slots = [];
                for (const { snet } of players.values()) {
                    slots.push(snet);
                }
                this.slots(slots);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });
    }

    private awardedMedals = new Map<bigint, Map<string, string>>();

    private _items = new Map<bigint, Macro<typeof Slot>>(); 
    private items = new Map<bigint, Macro<typeof Slot>>();

    private slots = signal<bigint[]>([], (current, next) => {
        if (current.length === 0 && next.length === 0) return true;
        return false;
    }); 

    public view = signal<Macro<typeof View> | undefined>(undefined);
}, html`
    <div m-id="wrapper" style="display: none;">
        <table class="${style.wrapper}">
            <tbody m-id="table" style="display: none;">
                <tr style="color: white; font-size: 20px;">
                    <td></td>    
                    <td></td>
                    <td style="display: flex; align-items: center; justify-content: center;"><span>K</span></td>
                    <td style="display: flex; align-items: center; justify-content: center;"><span>A</span></td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    </div>
    `);