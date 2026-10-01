import { ui, uiText, uiAttribute, language } from "@esm/@root/main/i18n.js";
import { html, Mutable } from "@esm/@/rhu/html.js";
import { computed, Signal, signal } from "@esm/@/rhu/signal.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import Fuse from "@esm/fuse.js";
import { BoosterConditionDatablock, BoosterDatablock, BoosterEffectDatablock } from "../../datablocks/boosters/boosters.js";
import { EnemyDatablock } from "../../datablocks/enemy/enemy.js";
import { GearDatablock } from "../../datablocks/gear/models.js";
import { PlayerDatablock } from "../../datablocks/player/player.js";
import { Factory } from "../../library/factory.js";
import { Identifier, IdentifierHash } from "../../parser/identifier.js";
import { PlayerBoosters } from "../../parser/player/boosters.js";
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
    
    Object.defineProperty(dom, "tag", { get: () => `${tag} ${ui(tag)}` });

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

export const TypeList = (inTitle: string, titleFontSize: string = "20", units: string = "") => {
    interface TypeList {
        readonly values: Signal<[key: string, value: number][]>;
        readonly available: Signal<boolean>;
    }
    interface Private {
        readonly empty: HTMLSpanElement;
    }

    const title = uiText(inTitle);
    const total = signal("total");
    const available = signal(true);
    const emptyText = computed<string>(set => { set(available() ? ui("None") : window.ReplayInterface.t("statsUnavailable")); }, [available, language]);

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
        el.value(`${value}${units}`);
        return el;
    });

    const dom = html<Mutable<Private & TypeList>>/**//*html*/`
        <div style="display: flex">
            <span style="font-size: ${titleFontSize}px;">${title}</span>
            <div style="flex: 1"></div>
            <span>${total}${units}</span>
        </div>
        <span m-id="empty" style="display: block;">${emptyText}</span>
        <ul>
            ${list}
        </ul>
		`;
    html(dom).box();

    dom.values = values;
    dom.available = available;

    const updateTotal = () => {
        const entries = values();
        let vtotal = 0;
        for (const [, value] of entries) {
            vtotal += value;
        }
        total(entries.length === 0 && !available() ? "—" : `${vtotal}`);

        if (entries.length === 0) {
            dom.empty.style.display = "block";
        } else {
            dom.empty.style.display = "none";
        }
    };
    values.on(updateTotal, { signal: dispose.signal });
    available.on(updateTotal, { signal: dispose.signal });

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
                    <span>${uiText("Damage Dealt to Enemies")}</span>
                    <ul>
                        <li style="display: flex">
                            <span>${uiText("Bullet Damage")}</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "bulletDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>${uiText("Melee Damage")}</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "meleeDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>${uiText("Sentry Damage")}</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "sentryDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>${uiText("Explosive Damage")}</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "explosiveDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>${uiText("Stagger Damage")}</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "staggerDamage")}</span>
                        </li>
                        <li style="display: flex">
                            <span>${uiText("Sentry Stagger Damage")}</span>
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
                const player = StatTracker.readPlayer(snet, api);

                bulletDamage(`${Math.round([...player.enemyDamage.bulletDamage.values()].reduce((p, c) => p + c.value, 0) * 10) / 10}`);
                meleeDamage(`${Math.round([...player.enemyDamage.meleeDamage.values()].reduce((p, c) => p + c.value, 0) * 10) / 10}`);
                sentryDamage(`${Math.round([...player.enemyDamage.sentryDamage.values()].reduce((p, c) => p + c.value, 0) * 10) / 10}`);
                explosiveDamage(`${Math.round([...player.enemyDamage.explosiveDamage.values()].reduce((p, c) => p + c.value, 0) * 10) / 10}`);
                staggerDamage(`${Math.round([...player.enemyDamage.staggerDamage.values()].reduce((p, c) => p + c.value, 0) * 10) / 10}`);
                sentryStaggerDamage(`${Math.round([...player.enemyDamage.sentryStaggerDamage.values()].reduce((p, c) => p + c.value, 0) * 10) / 10}`);

                customSignal(player.enemyDamage.custom);
                if (!StatTracker.availability(api).host) {
                    if (!player.enemyDamage.bulletDamage.size) bulletDamage("—");
                    if (!player.enemyDamage.meleeDamage.size) meleeDamage("—");
                    if (!player.enemyDamage.sentryDamage.size) sentryDamage("—");
                    if (!player.enemyDamage.explosiveDamage.size) explosiveDamage("—");
                    if (!player.enemyDamage.staggerDamage.size) staggerDamage("—");
                    if (!player.enemyDamage.sentryStaggerDamage.size) sentryStaggerDamage("—");
                }
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
            pierceHits: Signal<Map<number, number>>
        }>) => {
            if (el === undefined) {
                const pierceHits = signal<Map<number, number>>(new Map());
                const sortedPierceHits = computed((set) => { set([...pierceHits().entries()].sort((a, b) => b[0] - a[0])); }, [pierceHits]);
                const pierceHitsList = html.map(sortedPierceHits, undefined, (kv, el?: html<{ 
                    pierceCount: Signal<number>,
                    count: Signal<number>
                }>) => {
                    if (el === undefined) {
                        el = html`
                        <li style="display: flex">
                            <span>${html.bind(signal(""), "pierceCount")}</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "count")}</span>
                        </li>
                        `;
                    }
                    const [,v] = kv;

                    el.pierceCount(v[0]);
                    el.count(v[1]);

                    return el;
                });

                el = html`
                <ul>
                    <li style="margin-bottom: 5px;">
                        <span>${html.bind(signal(""), "name")}</span>
                    </li>
                    <li style="display: flex">
                        <span>${uiText("Hit Rate")}</span>
                        <div style="flex: 1"></div>
                        <span>${html.bind(signal(""), "hitRate")}</span>
                    </li>
                    <li style="display: flex">
                        <span>${uiText("Crit Rate")}</span>
                        <div style="flex: 1"></div>
                        <span>${html.bind(signal(""), "critRate")}</span>
                    </li>
                    <li style="display: flex">
                        <span>${uiText("Average Hit Per Bullet")}</span>
                        <div style="flex: 1"></div>
                        <span>${html.bind(signal(""), "avgHitPerShot")}</span>
                    </li>
                    <li style="padding: 5px 0;">
                        <div style="width: 100%; height: 1px; background-color: grey;"></div>
                    </li>
                    <li style="display: flex; flex-direction: column;">
                        <div style="display: flex">
                        <span>${uiText("Hits")}</span>
                        <div style="flex: 1"></div>
                        <span>${uiText("Count")}</span>
                        </div>
                        <ul>${pierceHitsList}</ul>
                    </li>
                </ul>
                `;

                el.pierceHits = pierceHits;
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
            el.pierceHits(v.pierceCount);

            return el;
        });

        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Accuracy")).bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    <span>${uiText("Accuracy")}</span>
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
                const player = StatTracker.readPlayer(snet, api);
                
                gears(player.accuracy);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return dom.wrapper;
    },
    (self, v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            bulletDamage: html<typeof TypeList>;
            sentryDamage: html<typeof TypeList>;
            explosiveDamage: html<typeof TypeList>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Damage Dealt to Players")).bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    <span>${uiText("Damage Dealt to Players")}</span>
                    <ul style="display: flex; flex-direction: column; gap: 10px;">
                        <li>
                            ${html.bind(TypeList("Bullet Damage", "inherit", "%"), "bulletDamage")}
                        </li>
                        <li>
                            ${html.bind(TypeList("Sentry Damage", "inherit", "%"), "sentryDamage")}
                        </li>
                        <li>
                            ${html.bind(TypeList("Explosive Damage", "inherit", "%"), "explosiveDamage")}
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
                const player = StatTracker.readPlayer(snet, api);
                
                bulletDamage.values([...player.playerDamage.bulletDamage.entries()].map((kv) => [api.getOrDefault("Vanilla.Player.Snet", Factory("Map")).get(kv[0])!.nickname, Math.round(Math.round(kv[1] * 10) / 10 / PlayerDatablock.health * 1000) / 10]));
                for (const list of [bulletDamage, sentryDamage, explosiveDamage]) list.available(StatTracker.availability(api).host);
                sentryDamage.values([...player.playerDamage.sentryDamage.entries()].map((kv) => [api.getOrDefault("Vanilla.Player.Snet", Factory("Map")).get(kv[0])!.nickname, Math.round(Math.round(kv[1] * 10) / 10 / PlayerDatablock.health * 1000) / 10]));
                explosiveDamage.values([...player.playerDamage.explosiveDamage.entries()].map((kv) => [api.getOrDefault("Vanilla.Player.Snet", Factory("Map")).get(kv[0])!.nickname, Math.round(Math.round(kv[1] * 10) / 10 / PlayerDatablock.health * 1000) / 10]));
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return dom.wrapper;
    },
    (self, v) => {
        const boosters = signal<PlayerBoosters | undefined>(undefined);
        const list = html.map(boosters, function* (b) { 
            if (b) { 
                for (let i = 0; i < b.implants.length; ++i) {
                    yield [i, { implant: b.implants[i], conditionMet: b.conditionsMet[i] }];
                } 
            } 
        }, (kv, el?: html<{
            type: Signal<string>;
            effects: Signal<{ type: number; value: number; }[]>;
            conditions: Signal<number[]>;
            active: Signal<string>;
        }>) => {
            if (el === undefined) {
                const effects = signal<{ type: number; value: number; }[]>([]);
                const effectList = html.map(effects, undefined, (kv, el?: html<{ name: Signal<string>, value: Signal<string> }>) => {
                    if (el === undefined) {
                        el = html`
                        <li style="display: flex">
                            <span>${html.bind(signal(""), "name")}</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "value")}</span>
                        </li>`;
                    }

                    const [_, v] = kv;

                    const datablock = BoosterEffectDatablock.get(v.type);
                    
                    el.name(datablock ? datablock.name : `Unknown(${v.type})`);
                    el.value(`${(Math.round(v.value * 100) / 100)}`);

                    return el;
                });

                const conditions = signal<number[]>([]);
                const conditionlist = html.map(conditions, undefined, (kv, el?: html<{ name: Signal<string> }>) => {
                    if (el === undefined) {
                        el = html`
                        <li style="display: flex">
                            <span>${html.bind(signal(""), "name")}</span>
                        </li>`;
                    }

                    const [_, v] = kv;

                    const datablock = BoosterConditionDatablock.get(v);
                    
                    el.name(datablock ? datablock.name : `Unknown(${v})`);

                    return el;
                });

                el = html`
                <ul>
                    <li style="margin-bottom: 5px; display: flex;">
                        <span>${html.bind(signal(""), "type")}</span>
                        <div style="flex: 1"></div>
                        <span>${html.bind(signal(""), "active")}</span>
                    </li>
                    <li style="margin-bottom: 5px; display: flex">
                        <ul style="width: 100%;">${effectList}</ul>
                    </li>
                    <li style="display: flex">
                        <ul style="width: 100%;">${conditionlist}</ul>
                    </li>
                </ul>
                `;

                el.effects = effects;
                el.conditions = conditions;
            }

            const [_, v] = kv;

            const datablock = BoosterDatablock.get(v.implant.id);

            el.active(v.conditionMet ? ui("Active") : ui("Inactive"));
            el.type(datablock ? datablock.category : `Unknown(${v.implant.id})`);
            el.effects(v.implant.effects);
            el.conditions(v.implant.conditions);

            return el;
        });

        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            note: Signal<string>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Boosters")).bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    <span>${uiText("Boosters")}</span>
                    <span>${html.bind(signal(""), "note")}</span>
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
                const player = api.getOrDefault("Vanilla.Player.Snet", Factory("Map")).get(snet);
                const booster = player ? api.getOrDefault("Vanilla.Player.Boosters", Factory("Map")).get(player.id) : undefined;
                if (booster === undefined) {
                    dom.note(ui("This player has no booster information."));
                } else if (booster.implants.length === 0) {
                    dom.note(ui("No boosters equipped."));
                } else {
                    dom.note("");
                }
                boosters(booster);
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
                const player = StatTracker.readPlayer(snet, api);

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
                list.available(StatTracker.availability(api).host);
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
                const player = StatTracker.readPlayer(snet, api);

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
                list.available(StatTracker.availability(api).host);
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
                const player = StatTracker.readPlayer(snet, api);

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
                list.available(StatTracker.availability(api).host);
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
                const player = StatTracker.readPlayer(snet, api);

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
                list.available(StatTracker.availability(api).host);
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
                const player = StatTracker.readPlayer(snet, api);

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
                list.available(StatTracker.availability(api).dodges);
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
            ${html.open(FeatureWrapper("Packs Received")).bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    ${html.bind(TypeList("Packs Received"), "list")}
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
                const player = StatTracker.readPlayer(snet, api);

                total.clear();
                for (const [type, count] of player.packsUsed) {
                    if (!total.has(type)) {
                        total.set(type, 0);
                    }
                    total.set(type, total.get(type)! + count);
                }
                list.available(StatTracker.availability(api).host);
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
                const player = StatTracker.readPlayer(snet, api);

                total.clear();
                for (const [type, count] of player.packsGiven) {
                    if (!total.has(type)) {
                        total.set(type, 0);
                    }
                    total.set(type, total.get(type)! + count);
                }
                list.available(StatTracker.availability(api).host);
                list.values([...total.entries()]);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });

        return dom.wrapper;
    },
    (self, v) => {
        const wrapper = FeatureWrapper("Packs Consumed (Local)");
        const list = TypeList("Packs Consumed (Local)");
        html.append(wrapper.body, list);
        v.on(view => {
            if (!view) return;
            view.api.on(api => {
                if (!self.active() || !api) return;
                const snet = self.dropdown.value();
                list.available(StatTracker.clientPacksAvailable(api, snet));
                list.values([...StatTracker.readPlayer(snet, api).packsConsumed]);
            }, { signal: dispose.signal });
        }, { signal: dispose.signal });
        return wrapper;
    },
    (self, v) => {
        const dom = html<{
            wrapper: html<typeof FeatureWrapper>;
            revives: Signal<string>;
            downed: Signal<string>;
            silent: Signal<string>;
            hasReplayMod: Signal<string>;
        }>/**//*html*/`
            ${html.open(FeatureWrapper("Miscellaneous")).bind("wrapper")}
                <div class="${style.row}" style="
                gap: 10px;
                ">
                    <span>${uiText("Miscellaneous")}</span>
                    <ul>
                        <li style="display: flex">
                            <span>${uiText("HasReplayMod")}</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "hasReplayMod")}</span>
                        </li>
                        <li style="display: flex">
                            <span>${uiText("Revives")}</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "revives")}</span>
                        </li>
                        <li style="display: flex">
                            <span>${uiText("Times Downed")}</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "downed")}</span>
                        </li>
                        <li style="display: flex">
                            <span>${uiText("Silent Shots")}</span>
                            <div style="flex: 1"></div>
                            <span>${html.bind(signal(""), "silent")}</span>
                        </li>
                    </ul>
                </div>
            ${html.close()}
        `;

        const { revives, silent, hasReplayMod, downed } = dom;

        v.on((view) => {
            if (view === undefined) return;

            view.api.on((api) => {
                if (!self.active()) return;
                
                if (api === undefined) return;

                const snet = self.dropdown.value();
                if (snet === undefined) {
                    revives(`0`);
                    downed(`0`);
                    silent(`0`);
                    hasReplayMod(`-`);
                    return;
                }

                const player = StatTracker.readPlayer(snet, api);

                revives(`${player.revives}`);
                downed(`${player.timesDowned}`);
                silent(`${player.silentShots}`);
                const players = api.getOrDefault("Vanilla.Player.Snet", Factory("Map"));
                const p = players.get(snet);
                if (p === undefined) throw new Error(`Could not find player with snet '${snet}'`);
                const core = api.getOrDefault("ReplayRecorder.Player", Factory("Map"));
                const c = core.get(p.id);
                if (c === undefined) throw new Error(`Could not find player with id '${p.id}'`);
                hasReplayMod(`${(c.hasReplayMod ? ui("True") : ui("False"))}`);
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
    
    const dropdown = Dropdown("Track player statistics");
    dropdown.wrapper.style.width = "100%";
    const atTime = signal("00:00");
    const recordingHint = computed<string>(set => { set(window.ReplayInterface.t("statsAtTime", { time: atTime() })); }, [language, atTime]);

    const dom = html<Mutable<Private & Settings>>/**//*html*/`
        <div class="${style.wrapper}">
            <div style="margin-bottom: 20px;">
                <h1>${uiText("STATS")}</h1>
                <p>${uiText("View player statistics")}</p>
                <p style="font-size: 12px; line-height: 1.6; color: #a7b1c1;">${recordingHint}</p>
            </div>
            <div style="
            position: sticky; 
            padding: 20px 0; 
            top: 0px; 
            background-color: #171c24;
            margin-bottom: 10px;
            z-index: 100;
            ">
                <input m-id="search" placeholder="${ui("Search ...")}" class="${style.search}" type="text" spellcheck="false" autocomplete="false"/>
                <div class="${style.row}" style="
                margin-top: 20px;
                ">
                    <span class="field-caption">${uiText("Track player statistics")}</span>
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
    
    uiAttribute(dom.search, "placeholder", "Search ...", dispose.signal);
    dom.search.addEventListener("keyup", () => {
        let value = dom.search.value;
        value = value.trim();
        if (value.length === 0) {
            html.replaceChildren(dom.body, ...features);
            return;
        }
        fuse.setCollection(features);
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

            const seconds = Math.floor(api.time() / 1000);
            const hours = Math.floor(seconds / 3600);
            atTime(`${hours ? `${hours}:` : ""}${String(hours ? Math.floor(seconds / 60) % 60 : Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`);

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
