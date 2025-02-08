import { html, Mutable } from "@esm/@/rhu/html.js";
import { Signal, signal } from "@esm/@/rhu/signal.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import Fuse from "@esm/fuse.js";
import { EnemyDatablock } from "../../datablocks/enemy/enemy.js";
import { GearDatablock } from "../../datablocks/gear/models.js";
import { PlayerDatablock } from "../../datablocks/player/player.js";
import { Factory } from "../../library/factory.js";
import { Identifier, IdentifierHash } from "../../parser/identifier.js";
import { PlayerStats, StatTracker } from "../../parser/stattracker/stattracker.js";
import { Dropdown } from "../components/dropdown.js";
import { dispose } from "../main.js";
import { pageStyles } from "./lib.js";

const style = pageStyles;

export const FeatureWrapper = (tag: string) => {
    interface Public {
        readonly tag: string
    }
    interface Private {
        readonly body: HTMLDivElement;
    }

    const dom = html<Mutable<Private & Public>>/**//*html*/`
        <div m-id="body"></div>
        `;
    html(dom).box().children((children) => {
        dom.body.append(...children);
    });
    
    dom.tag = tag;

    return dom;
};

const Item = (inKey: string) => {
    interface Item {
        readonly key: Signal<string>;
        readonly value: Signal<string>;
    }
    interface Private {
    }

    const key = signal(inKey);
    const value = signal("");

    const dom = html<Mutable<Private & Item>>/**//*html*/`
        <li style="display: flex">
            <span>${key}</span>
            <div style="flex: 1"></div>
            <span>${value}</span>
        </li>
        `;
    html(dom).box();

    dom.key = key;
    dom.value = value;

    return dom as html<Item>;
};

export const TypeList = (inTitle: string) => {
    interface TypeList {
        readonly values: Signal<[key: string, value: number][]>;
    }
    interface Private {
        readonly empty: HTMLSpanElement;
    }

    const title = signal(inTitle);
    const total = signal("total");

    const values = signal<[key: string, value: number][]>([], (a, b) => {
        if (a === undefined && b === undefined) return true;
        if (a === undefined || b === undefined) return false;
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; ++i) {
            if (a[i][0] !== b[i][0]) return false;
            if (a[i][1] !== b[i][1]) return false;
        }
        return true;
    });

    const list = html.map(values, (values) => values, (kv, el?: html<typeof Item>) => {
        const [key, value] = kv;
        if (el === undefined) {
            el = Item(key);
        }
        el.value(`${value}`);
        return el;
    });

    const dom = html<Mutable<Private & TypeList>>/**//*html*/`
        <div style="display: flex">
            <span style="font-size: 20px;">${title}</span>
            <div style="flex: 1"></div>
            <span>${total}</span>
        </div>
        <span m-id="empty" style="display: block;">None</span>
        <ul>
            ${list}
        </ul>
		`;
    html(dom).box();

    dom.values = values;

    values.on((values) => {
        let vtotal = 0;
        for (const [, value] of values) {
            vtotal += value;
        }
        total(`${vtotal}`);

        if (values.length === 0) {
            dom.empty.style.display = "block";
        } else {
            dom.empty.style.display = "none";
        }
    }, { signal: dispose.signal });

    return dom as html<TypeList>;
};

const featureList: ((self: html<typeof Stats>, v: Signal<html<typeof View> | undefined>) => html<typeof FeatureWrapper>)[] = [
    (self, v) => {
        const customSignal = signal<Map<string, Map<IdentifierHash, { type: Identifier; value: number; }>>>(new Map());
        const customList = html.map(customSignal, undefined, (kv, el?: html<{ value: Signal<string> }>) => {
            const [key, value] = kv;
            if (el === undefined) {
                el = html<{ value: Signal<string> }>/**//*html*/`
                <li style="display: flex">
                    <span>${key}</span>
                    <div style="flex: 1"></div>
                    <span>${html.bind(signal(""), "value")}</span>
                </li>
                `;
            }
            el.value(`${Math.round([...value.values()].reduce((p, c) => p + c.value, 0) * 10) / 10}`);
            return el;
        });

        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            bulletDamage: Signal<string>;
            meleeDamage: Signal<string>;
            sentryDamage: Signal<string>;
            explosiveDamage: Signal<string>;
            staggerDamage: Signal<string>;
            sentryStaggerDamage: Signal<string>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Damage Dealt to Enemies")).bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    <span>Damage Dealt to Enemies</span>
                    <ul>
                        <li style="display: flex">
                            <span>Bullet Damage</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "bulletDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>Melee Damage</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "meleeDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>Sentry Damage</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "sentryDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>Explosive Damage</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "explosiveDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>Stagger Damage</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "staggerDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>Sentry Stagger Damage</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "sentryStaggerDamage")}</span>
                        </li>
                        ${customList}
                    </ul>
                </div>
            ${html.close()}
        `;

        const { bulletDamage, meleeDamage, sentryDamage, explosiveDamage, staggerDamage, sentryStaggerDamage } = dom;

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

                customSignal(player.enemyDamage.custom);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return dom.wrapper;
    },
    (self, v) => {
        const gears = signal<PlayerStats["accuracy"]>(new Map());
        const list = html.map(gears, undefined, (kv, el?: html<{
            name: Signal<string>;
            hitRate: Signal<string>;
            critRate: Signal<string>;
            avgHitPerShot: Signal<string>;
        }>) => {
            if (el === undefined) {
                el = html`
                <ul>
                    <li style="margin-bottom: 5px;">
                        <span>${html.bind(signal(""), "name")}</span>
                    </li>
                    <li style="display: flex">
                        <span>Hit Rate</span>
                        <div style="flex: 1"></div>
                        <span>${html.bind(signal(""), "hitRate")}</span>
                    </li>
                    <li style="display: flex">
                        <span>Crit Rate</span>
                        <div style="flex: 1"></div>
                        <span>${html.bind(signal(""), "critRate")}</span>
                    </li>
                    <li style="display: flex">
                        <span>Average Hit Per Bullet</span>
                        <div style="flex: 1"></div>
                        <span>${html.bind(signal(""), "avgHitPerShot")}</span>
                    </li>
                </ul>
                `;
            }

            const [,v] = kv;

            const gear = GearDatablock.getOrMatchCategory(v.gear);
            let name = "Unknown Gear";
            if (gear?.name !== undefined) {
                name = gear.name;
            }

            el.name(name);
            el.hitRate(`${Math.round((v.hits / Math.clamp(v.total, 1, Infinity)) * 1000) / 10}%`);
            el.critRate(`${Math.round((v.crits / Math.clamp(v.hits, 1, Infinity)) * 1000) / 10}%`);
            el.avgHitPerShot(`${Math.round((v.pierceHits / Math.clamp(v.hits, 1, Infinity)) * 10) / 10}`);

            return el;
        });

        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Accuracy")).bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    <span>Accuracy</span>
                    ${list}
                </div>
            ${html.close()}
        `;

        v.on((view) => {
            if (view === undefined) return;

            view.api.on((api) => {
                if (!self.active()) return;

                if (api === undefined) return;

                const snet = self.dropdown.value();
                const player = StatTracker.getPlayer(snet, StatTracker.from(api));
                
                gears(player.accuracy);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return dom.wrapper;
    },
    (self, v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            bulletDamage: Signal<string>;
            sentryDamage: Signal<string>;
            explosiveDamage: Signal<string>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Damage Dealt to Players")).bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    <span>Damage Dealt to Players</span>
                    <ul>
                        <li style="display: flex">
                            <span>Bullet Damage</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "bulletDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>Sentry Damage</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "sentryDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>Explosive Damage</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "explosiveDamage")}</span>
                        </li>
                    </ul>
                </div>
            ${html.close()}
        `;

        const { bulletDamage, sentryDamage, explosiveDamage } = dom;

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

        return dom.wrapper;
    },
    (self, v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            list: html<typeof TypeList>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Kills")).bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    ${html.bind(TypeList("Kills"), "list")}
                </div>
            ${html.close()}
        `;

        const { list } = dom;
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

        return dom.wrapper;
    },
    (self, v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            list: html<typeof TypeList>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Sentry Kills")).bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    ${html.bind(TypeList("Sentry Kills"), "list")}
                </div>
            ${html.close()}
        `;

        const { list } = dom;
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

        return dom.wrapper;
    },
    (self, v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            list: html<typeof TypeList>;
        }>`
            ${html.open(FeatureWrapper("Mine Kills")).bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    ${html.bind(TypeList("Mine Kills"), "list")}
                </div>
            ${html.close()}
        `;

        const { list } = dom;
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

        return dom.wrapper;
    },
    (self, v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            list: html<typeof TypeList>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Assists")).bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    ${html.bind(TypeList("Assists"), "list")}
                </div>
            ${html.close()}
        `;

        const { list } = dom;
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

        return dom.wrapper;
    },
    (self, v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            list: html<typeof TypeList>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Tongue Dodges")).bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    ${html.bind(TypeList("Tongue Dodges"), "list")}
                </div>
            ${html.close()}
        `;

        const { list } = dom;
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

        return dom.wrapper;
    },
    (self, v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            list: html<typeof TypeList>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Packs Used")).bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    ${html.bind(TypeList("Packs Used"), "list")}
                </div>
            ${html.close()}
        `;

        const { list } = dom;
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

        return dom.wrapper;
    },
    (self, v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            list: html<typeof TypeList>;
        }>`
            ${html.open(FeatureWrapper("Packs Given")).bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    ${html.bind(TypeList("Packs Given"), "list")}
                </div>
            ${html.close()}
        `;

        const { list } = dom;
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

        return dom.wrapper;
    },
    (self, v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            revives: Signal<string>;
            silent: Signal<string>;
            hasReplayMod: Signal<string>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Miscellaneous")).bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    <span>Miscellaneous</span>
                    <ul>
                        <li style="display: flex">
                            <span>HasReplayMod</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "hasReplayMod")}</span>
                        </li>
                        <li style="display: flex">
                            <span>Revives</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "revives")}</span>
                        </li>
                        <li style="display: flex">
                            <span>Silent Shots</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "silent")}</span>
                        </li>
                    </ul>
                </div>
            ${html.close()}
        `;

        const { revives, silent, hasReplayMod } = dom;

        v.on((view) => {
            if (view === undefined) return;

            view.api.on((api) => {
                if (!self.active()) return;
                
                if (api === undefined) return;

                const snet = self.dropdown.value();
                if (snet === undefined) {
                    revives(`0`);
                    silent(`0`);
                    hasReplayMod(`-`);
                    return;
                }

                const player = StatTracker.getPlayer(snet, StatTracker.from(api));

                revives(`${player.revives}`);
                silent(`${player.silentShots}`);
                const players = api.getOrDefault("Vanilla.Player.Snet", Factory("Map"));
                const p = players.get(snet);
                if (p === undefined) throw new Error(`Could not find player with snet '${snet}'`);
                const core = api.getOrDefault("ReplayRecorder.Player", Factory("Map"));
                const c = core.get(p.id);
                if (c === undefined) throw new Error(`Could not find player with id '${p.id}'`);
                hasReplayMod(`${(c.hasReplayMod ? "True" : "False")}`);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return dom.wrapper;
    },
];

export const Stats = () => {
    interface Settings {
        readonly active: Signal<boolean>;
        readonly view: Signal<html<typeof View> | undefined>;
        readonly dropdown: html<typeof Dropdown>;
    }
    interface Private {
        readonly body: HTMLDivElement;
        readonly search: HTMLInputElement;
    }
    
    const dropdown = Dropdown();
    dropdown.wrapper.style.width = "100%";

    const dom = html<Mutable<Private & Settings>>/**//*html*/`
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
                    ${dropdown}
                </div>
            </div>
            <div m-id="body" class="${style.body}">
            </div>
        </div>
        `;
    html(dom).box();
        
    dom.view = signal<html<typeof View> | undefined>(undefined);
    dom.dropdown = dropdown;
    
    dom.active = signal(false);
    const features: html<typeof FeatureWrapper>[] = [];
    const fuse = new Fuse(features, {
        keys: ["tag"]
    });
    
    for (const feature of featureList) {
        const f = feature(dom, dom.view);
        features.push(f);
    
        dom.body.append(...f);
    }
    
    dom.search.addEventListener("keyup", () => {
        let value = dom.search.value;
        value = value.trim();
        if (value.length === 0) {
            html.replaceChildren(dom.body, ...features);
            return;
        }
        const results = fuse.search(value).map((n) => n.item);
        html.replaceChildren(dom.body, ...results);
    });

    dom.view.on((view) => {
        if (view === undefined) {
            dropdown.options([]);
            return;
        }

        view.api.on((api) => {
            if (!dom.active()) return;

            if (api === undefined) {
                dropdown.options([]);
                return;
            }

            const all = api.get("Vanilla.Player.Snet");
            if (all === undefined) {
                dropdown.options([]);
                return;
            }

            const players: [key: string, value: any][] = [];
            for (const player of all.values()) {
                players.push([
                    player.nickname,
                    player.snet
                ]);
            }
            dropdown.options(players);
        }, { signal: dispose.signal });
    }, { signal: dispose.signal });
    
    return dom as html<Settings>;
};