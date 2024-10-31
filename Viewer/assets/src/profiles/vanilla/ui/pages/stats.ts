import { html, Macro, MacroElement, RHU_CHILDREN } from "@esm/@/rhu/macro.js";
import { Signal, signal } from "@esm/@/rhu/signal.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import Fuse from "@esm/fuse.js";
import { EnemyDatablock } from "../../datablocks/enemy/enemy.js";
import { PlayerDatablock } from "../../datablocks/player/player.js";
import { StatTracker } from "../../parser/stattracker/stattracker.js";
import { Dropdown } from "../components/dropdown.js";
import { dispose } from "../main.js";
import { pageStyles } from "./lib.js";

const style = pageStyles;

const FeatureWrapper = Macro(class FeatureWrapper extends MacroElement {
    private body: HTMLDivElement;
    public tag: string;
    
    private _frag = new DocumentFragment();
    get frag() {
        this._frag.replaceChildren(...this.dom);
        return this._frag;
    }

    constructor(dom: Node[], bindings: any, children: RHU_CHILDREN, tag: string) {
        super(dom, bindings);
        this.tag = tag;
        this.body.append(...children);
    }
}, html`
    <div m-id="body"></div>
`);

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
    public value: Signal<string>;

    constructor(dom: Node[], bindings: any, children: RHU_CHILDREN, key: string) {
        super(dom, bindings);

        this.key(key);
    }
}, html`
    <li style="display: flex">
        <span>${Macro.signal("key")}</span>
        <div style="flex: 1"></div>
        <span>${Macro.signal("value")}</span>
    </li>`
);

const TypeList = Macro(class TypeList extends MacroElement {
    private list: HTMLDivElement;
    private empty: HTMLSpanElement;

    private title: Signal<string>;
    private total: Signal<string>;

    private _items = new Map<string, Macro<typeof Item>>(); 
    private items = new Map<string, Macro<typeof Item>>();

    constructor(dom: Node[], bindings: any, children: RHU_CHILDREN, title: string) {
        super(dom, bindings);

        this.title(title);

        this.values.on((values) => {
            let total = 0;
            for (const [key, value] of values) {
                let item: Macro<typeof Item>;
                if (this.items.has(key)) {
                    item = this.items.get(key)!;
                    this._items.set(key, item);
                } else {
                    item = Macro.create(Item(key));
                    this._items.set(key, item);
                    this.list.append(item.frag);
                }
                item.value(`${value}`);

                total += value;
            }
            this.total(`${total}`);
            
            for (const [key, item] of this.items) {
                if (this._items.has(key)) continue;
                item.remove();
            }
            
            const temp = this.items;
            this.items = this._items;
            this._items = temp;
            this._items.clear();

            if (values.length === 0) {
                this.empty.style.display = "block";
            } else {
                this.empty.style.display = "none";
            }
        }, { signal: dispose.signal });
    }

    public values = signal<[key: string, value: number][]>([], (a, b) => {
        if (a === undefined && b === undefined) return true;
        if (a === undefined || b === undefined) return false;
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; ++i) {
            if (a[i][0] !== b[i][0]) return false;
            if (a[i][1] !== b[i][1]) return false;
        }
        return true;
    });
}, html`
    <div style="display: flex">
        <span style="font-size: 20px;">${Macro.signal("title")}</span>
        <div style="flex: 1"></div>
        <span>${Macro.signal("total")}</span>
    </div>
    <span m-id="empty" style="display: block;">None</span>
    <ul m-id="list">
    </ul>
`);

const features: ((self: Macro<typeof Stats>, v: Signal<Macro<typeof View> | undefined>) => Macro<typeof FeatureWrapper>)[] = [
    (self, v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper("Damage Dealt to Enemies").open().bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    <span>Damage Dealt to Enemies</span>
                    <ul>
                        <li style="display: flex">
                            <span>Bullet Damage</span>
                            <div style="flex: 1"></div>
                            <span>${Macro.signal("bulletDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>Melee Damage</span>
                            <div style="flex: 1"></div>
                            <span>${Macro.signal("meleeDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>Sentry Damage</span>
                            <div style="flex: 1"></div>
                            <span>${Macro.signal("sentryDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>Explosive Damage</span>
                            <div style="flex: 1"></div>
                            <span>${Macro.signal("explosiveDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>Stagger Damage</span>
                            <div style="flex: 1"></div>
                            <span>${Macro.signal("staggerDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>Sentry Stagger Damage</span>
                            <div style="flex: 1"></div>
                            <span>${Macro.signal("sentryStaggerDamage")}</span>
                        </li>
                    </ul>
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            bulletDamage: Signal<string>;
            meleeDamage: Signal<string>;
            sentryDamage: Signal<string>;
            explosiveDamage: Signal<string>;
            staggerDamage: Signal<string>;
            sentryStaggerDamage: Signal<string>;
        }>();

        const { bulletDamage, meleeDamage, sentryDamage, explosiveDamage, staggerDamage, sentryStaggerDamage } = bindings;

        v.on((view) => {
            if (view === undefined) return;

            view.api.on((api) => {
                if (!self.active()) return;

                if (api === undefined) return;

                const snet = self.dropdown.value();
                const player = StatTracker.getPlayer(snet, StatTracker.from(api));

                bulletDamage(`${Math.round([...player.enemyDamage.bulletDamage.values()].reduce((p, c) => p + c.value, 0) * 10) / 10}`);
                meleeDamage(`${Math.round([...player.enemyDamage.meleeDamage.values()].reduce((p, c) => p + c.value, 0) * 10) / 10}`);
                sentryDamage(`${Math.round([...player.enemyDamage.sentryDamage.values()].reduce((p, c) => p + c.value, 0) * 10) / 10}`);
                explosiveDamage(`${Math.round([...player.enemyDamage.explosiveDamage.values()].reduce((p, c) => p + c.value, 0) * 10) / 10}`);
                staggerDamage(`${Math.round([...player.enemyDamage.staggerDamage.values()].reduce((p, c) => p + c.value, 0) * 10) / 10}`);
                sentryStaggerDamage(`${Math.round([...player.enemyDamage.sentryStaggerDamage.values()].reduce((p, c) => p + c.value, 0) * 10) / 10}`);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return bindings.wrapper;
    },
    (self, v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper("Damage Dealt to Players").open().bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    <span>Damage Dealt to Players</span>
                    <ul>
                        <li style="display: flex">
                            <span>Bullet Damage</span>
                            <div style="flex: 1"></div>
                            <span>${Macro.signal("bulletDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>Sentry Damage</span>
                            <div style="flex: 1"></div>
                            <span>${Macro.signal("sentryDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>Explosive Damage</span>
                            <div style="flex: 1"></div>
                            <span>${Macro.signal("explosiveDamage")}</span>
                        </li>
                    </ul>
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            bulletDamage: Signal<string>;
            sentryDamage: Signal<string>;
            explosiveDamage: Signal<string>;
        }>();

        const { bulletDamage, sentryDamage, explosiveDamage } = bindings;

        v.on((view) => {
            if (view === undefined) return;

            view.api.on((api) => {
                if (!self.active()) return;

                if (api === undefined) return;

                const snet = self.dropdown.value();
                const player = StatTracker.getPlayer(snet, StatTracker.from(api));
                
                bulletDamage(`${Math.round((Math.round([...player.playerDamage.bulletDamage.values()].reduce((p, c) => p + c, 0) * 10) / 10) / PlayerDatablock.health * 1000) / 10}%`);
                sentryDamage(`${Math.round((Math.round([...player.playerDamage.sentryDamage.values()].reduce((p, c) => p + c, 0) * 10) / 10) / PlayerDatablock.health * 1000) / 10}%`);
                explosiveDamage(`${Math.round((Math.round([...player.playerDamage.explosiveDamage.values()].reduce((p, c) => p + c, 0) * 10) / 10) / PlayerDatablock.health * 1000) / 10}%`);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return bindings.wrapper;
    },
    (self, v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper("Kills").open().bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    ${TypeList("Kills").bind("list")}
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            list: Macro<typeof TypeList>;
        }>();

        const { list } = bindings;
        const total = new Map<string, number>();

        v.on((view) => {
            if (view === undefined) return;

            view.api.on((api) => {
                if (!self.active()) return;

                if (api === undefined) return;

                const snet = self.dropdown.value();
                const player = StatTracker.getPlayer(snet, StatTracker.from(api));

                total.clear();
                for (const count of player.kills.values()) {
                    let name: string | undefined;
                    const datablock = EnemyDatablock.get(count.type);
                    if (datablock !== undefined) {
                        name = datablock.name;
                    }
                    if (name === undefined) name = count.type.hash;
                    if (!total.has(name)) {
                        total.set(name, 0);
                    }
                    total.set(name, total.get(name)! + count.value);
                }
                list.values([...total.entries()]);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return bindings.wrapper;
    },
    (self, v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper("Sentry Kills").open().bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    ${TypeList("Sentry Kills").bind("list")}
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            list: Macro<typeof TypeList>;
        }>();

        const { list } = bindings;
        const total = new Map<string, number>();

        v.on((view) => {
            if (view === undefined) return;

            view.api.on((api) => {
                if (!self.active()) return;

                if (api === undefined) return;

                const snet = self.dropdown.value();
                const player = StatTracker.getPlayer(snet, StatTracker.from(api));

                total.clear();
                for (const count of player.sentryKills.values()) {
                    let name: string | undefined;
                    const datablock = EnemyDatablock.get(count.type);
                    if (datablock !== undefined) {
                        name = datablock.name;
                    }
                    if (name === undefined) name = count.type.hash;
                    if (!total.has(name)) {
                        total.set(name, 0);
                    }
                    total.set(name, total.get(name)! + count.value);
                }
                list.values([...total.entries()]);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return bindings.wrapper;
    },
    (self, v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper("Mine Kills").open().bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    ${TypeList("Mine Kills").bind("list")}
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            list: Macro<typeof TypeList>;
        }>();

        const { list } = bindings;
        const total = new Map<string, number>();

        v.on((view) => {
            if (view === undefined) return;

            view.api.on((api) => {
                if (!self.active()) return;

                if (api === undefined) return;

                const snet = self.dropdown.value();
                const player = StatTracker.getPlayer(snet, StatTracker.from(api));

                total.clear();
                for (const count of player.mineKills.values()) {
                    let name: string | undefined;
                    const datablock = EnemyDatablock.get(count.type);
                    if (datablock !== undefined) {
                        name = datablock.name;
                    }
                    if (name === undefined) name = count.type.hash;
                    if (!total.has(name)) {
                        total.set(name, 0);
                    }
                    total.set(name, total.get(name)! + count.value);
                }
                list.values([...total.entries()]);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return bindings.wrapper;
    },
    (self, v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper("Assists").open().bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    ${TypeList("Assists").bind("list")}
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            list: Macro<typeof TypeList>;
        }>();

        const { list } = bindings;
        const total = new Map<string, number>();

        v.on((view) => {
            if (view === undefined) return;

            view.api.on((api) => {
                if (!self.active()) return;

                if (api === undefined) return;

                const snet = self.dropdown.value();
                const player = StatTracker.getPlayer(snet, StatTracker.from(api));

                total.clear();
                for (const count of player.assists.values()) {
                    let name: string | undefined;
                    const datablock = EnemyDatablock.get(count.type);
                    if (datablock !== undefined) {
                        name = datablock.name;
                    }
                    if (name === undefined) name = count.type.hash;
                    if (!total.has(name)) {
                        total.set(name, 0);
                    }
                    total.set(name, total.get(name)! + count.value);
                }
                list.values([...total.entries()]);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return bindings.wrapper;
    },
    (self, v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper("Tongue Dodges").open().bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    ${TypeList("Tongue Dodges").bind("list")}
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            list: Macro<typeof TypeList>;
        }>();

        const { list } = bindings;
        const total = new Map<string, number>();

        v.on((view) => {
            if (view === undefined) return;

            view.api.on((api) => {
                if (!self.active()) return;

                if (api === undefined) return;

                const snet = self.dropdown.value();
                const player = StatTracker.getPlayer(snet, StatTracker.from(api));

                total.clear();
                for (const count of player.tongueDodges.values()) {
                    let name: string | undefined;
                    const datablock = EnemyDatablock.get(count.type);
                    if (datablock !== undefined) {
                        name = datablock.name;
                    }
                    if (name === undefined) name = count.type.hash;
                    if (!total.has(name)) {
                        total.set(name, 0);
                    }
                    total.set(name, total.get(name)! + count.value);
                }
                list.values([...total.entries()]);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return bindings.wrapper;
    },
    (self, v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper("Packs Used").open().bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    ${TypeList("Packs Used").bind("list")}
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            list: Macro<typeof TypeList>;
        }>();

        const { list } = bindings;
        const total = new Map<string, number>();

        v.on((view) => {
            if (view === undefined) return;

            view.api.on((api) => {
                if (!self.active()) return;

                if (api === undefined) return;

                const snet = self.dropdown.value();
                const player = StatTracker.getPlayer(snet, StatTracker.from(api));

                total.clear();
                for (const [type, count] of player.packsUsed) {
                    if (!total.has(type)) {
                        total.set(type, 0);
                    }
                    total.set(type, total.get(type)! + count);
                }
                list.values([...total.entries()]);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return bindings.wrapper;
    },
    (self, v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper("Packs Given").open().bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    ${TypeList("Packs Given").bind("list")}
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            list: Macro<typeof TypeList>;
        }>();

        const { list } = bindings;
        const total = new Map<string, number>();

        v.on((view) => {
            if (view === undefined) return;

            view.api.on((api) => {
                if (!self.active()) return;

                if (api === undefined) return;

                const snet = self.dropdown.value();
                const player = StatTracker.getPlayer(snet, StatTracker.from(api));

                total.clear();
                for (const [type, count] of player.packsGiven) {
                    if (!total.has(type)) {
                        total.set(type, 0);
                    }
                    total.set(type, total.get(type)! + count);
                }
                list.values([...total.entries()]);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return bindings.wrapper;
    },
    (self, v) => {
        const [bindings, frag] = html`
            ${FeatureWrapper("Miscellaneous").open().bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    <span>Miscellaneous</span>
                    <ul>
                        <li style="display: flex">
                            <span>Revives</span>
                            <div style="flex: 1"></div>
                            <span>${Macro.signal("revives")}</span>
                        </li>
                        <li style="display: flex">
                            <span>Silent Shots</span>
                            <div style="flex: 1"></div>
                            <span>${Macro.signal("silent")}</span>
                        </li>
                    </ul>
                </div>
            ${FeatureWrapper.close}
        `.dom<{
            wrapper: Macro<typeof FeatureWrapper>;
            revives: Signal<string>;
            silent: Signal<string>;
        }>();

        const { revives, silent } = bindings;

        v.on((view) => {
            if (view === undefined) return;

            view.api.on((api) => {
                if (!self.active()) return;
                
                if (api === undefined) return;

                const snet = self.dropdown.value();
                const player = StatTracker.getPlayer(snet, StatTracker.from(api));

                revives(`${player.revives}`);
                silent(`${player.silentShots}`);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return bindings.wrapper;
    },
];

export const Stats = Macro(class Stats extends MacroElement {
    public view = signal<Macro<typeof View> | undefined>(undefined);

    public dropdown: Macro<typeof Dropdown>;
    private search: HTMLInputElement;
    private body: HTMLDivElement;

    private features: Macro<typeof FeatureWrapper>[];
    private fuse: Fuse<Macro<typeof FeatureWrapper>>;

    public active = signal(false);

    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);

        this.features = [];
        for (const feature of features) {
            const f = feature(this, this.view);
            this.features.push(f);

            this.body.append(f.frag);
        }
        this.fuse = new Fuse(this.features, {
            keys: ["tag"]
        });

        this.search.addEventListener("keyup", () => {
            let value = this.search.value;
            value = value.trim();
            if (value.length === 0) {
                this.body.replaceChildren(...this.features.map((n) => n.frag));
                return;
            }
            const results = this.fuse.search(value).map((n) => n.item.frag);
            this.body.replaceChildren(...results);
        });

        this.view.on((view) => {
            if (view === undefined) {
                this.dropdown.options([]);
                return;
            }

            view.api.on((api) => {
                if (!this.active()) return;

                if (api === undefined) {
                    this.dropdown.options([]);
                    return;
                }

                const all = api.get("Vanilla.Player.Snet");
                if (all === undefined) {
                    this.dropdown.options([]);
                    return;
                }

                const players: [key: string, value: any][] = [];
                for (const player of all.values()) {
                    players.push([
                        player.nickname,
                        player.snet
                    ]);
                }
                this.dropdown.options(players);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });
    }
}, html`
    <div class="${style.wrapper}">
        <div style="margin-bottom: 20px;">
            <h1>STATS</h1>
            <p>View player statistics</p>
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
                ${Dropdown().bind("dropdown").then((dropdown) => dropdown.wrapper.style.width = "100%")}
            </div>
        </div>
        <div m-id="body" class="${style.body}">
        </div>
    </div>
    `);