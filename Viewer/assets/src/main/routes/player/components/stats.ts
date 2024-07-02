import { Constructor, Macro } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";
import Fuse from "fuse.js";
import { PlayerStats } from "../../../../modules/parser/stattracker/stats.js";
import { specification } from "../../../../modules/renderer/specification.js";
import { player } from "../index.js";
import { dropdown } from "./dropdown.js";

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
    gap: 30px;
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

    return {
        wrapper,
        search,
        row,
        divider,
        body,
        toggle,
        active
    };
});

export interface stats extends HTMLDivElement {
    search: HTMLInputElement;
    body: HTMLDivElement;
    dropdown: dropdown;
    empty: HTMLDivElement;

    features: [node: Node, key: string, update?: () => void, reset?: () => void][];
    fuse: Fuse<[node: Node, key: string, update?: () => void, reset?: () => void]>;

    player: player;
    init(player: player): void;
    update(): void;
    reset(): void;
    render(): void;
}

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "routes/player.stats": stats;
    }
}

function createTypeTable<T>(parent: stats, title: string, all: (stats: PlayerStats) => T[], extract: (data: T) => [string, number]): [node: Node, key: string, update?: () => void, reset?: () => void] {
    // TODO(randomuserhi): Nicer visualisations

    const [frag, node] = Macro.anon<{
        list: HTMLUListElement;
        empty: HTMLSpanElement;
        total: HTMLSpanElement;
        nodes: { root: HTMLLIElement, name: HTMLSpanElement, value: HTMLSpanElement }[];
    }>(/*html*/`
        <div class="${style.row}" style="
        gap: 10px;
        ">
            <div style="display: flex">
                <span style="font-size: 20px;">${title}</span>
                <div style="flex: 1"></div>
                <span rhu-id="total"></span>
            </div>
            <span rhu-id="empty" style="display: none;">None</span>
            <ul rhu-id="list">
            </ul>
        </div>
        `);
    frag.nodes = [];

    const update = () => {
        // TODO(randomuserhi): handle empty data (early returns) and display correctly instead of skipping.

        if (parent.dropdown.value === undefined) return;
        const snet = parent.dropdown.value as bigint;

        const api = parent.player.api;
        if (api === undefined) return;

        const tracker = api.get("Vanilla.StatTracker");
        if (tracker === undefined) return;
        const stats = tracker.players.get(snet);
        if (stats === undefined) {
            frag.empty.style.display = "block";
            frag.list.style.display = "none";
            return;
        }

        const counts = all(stats);
        let total = 0;
        const nodes: { root: HTMLLIElement, name: HTMLSpanElement, value: HTMLSpanElement }[] = [];
        let i = 0;
        for (const item of frag.nodes) {
            if (i < counts.length) {
                const [type, count] = extract(counts[i]);
                total += count;
                item.name.innerText = type;
                item.value.innerText = count.toString();
                nodes.push(item);
            } else {
                break;
            }
            ++i;
        }
        for (; i < frag.nodes.length; ++i) {
            frag.nodes[i].root.replaceWith();
        }
        frag.nodes = nodes;
        for (; i < counts.length; ++i) {
            const [item, node] = Macro.anon<{
                name: HTMLSpanElement;
                value: HTMLSpanElement;
                root: HTMLLIElement;
            }>(/*html*/`
                <li rhu-id="root" style="display: flex">
                    <span rhu-id="name"></span>
                    <div style="flex: 1"></div>
                    <span rhu-id="value"></span>
                </li>
                `);
            const [type, count] = extract(counts[i]);
            total += count;
            item.name.innerText = type;
            item.value.innerText = count.toString();
            frag.nodes.push(item);
            frag.list.append(node);
        }
        if (counts.length === 0) {
            frag.empty.style.display = "block";
            frag.list.style.display = "none";
        } else {
            frag.list.style.display = "block";
            frag.empty.style.display = "none";
        }
        frag.total.innerText = `${Math.round(total)}`;
    };

    return [node.children[0], title, update];
}

const _features: ((parent: stats) => [node: Node, key: string, update?: () => void, reset?: () => void])[] = [
    (parent) => {
        // TODO(randomuserhi): Nicer visualisations

        const [frag, node] = Macro.anon<{
            ebulletDamage: HTMLSpanElement;
            emeleeDamage: HTMLSpanElement;
            esentryDamage: HTMLSpanElement;
            eexplosiveDamage: HTMLSpanElement;
            estaggerDamage: HTMLSpanElement;
            esentryStaggerDamage: HTMLSpanElement;

            pbulletDamage: HTMLSpanElement;
            psentryDamage: HTMLSpanElement;
            pexplosiveDamage: HTMLSpanElement;
        }>(/*html*/`
            <div class="${style.row}" style="
            gap: 10px;
            ">
                <span style="font-size: 20px;">Damage Dealt to Enemies</span>
                <ul>
                    <li style="display: flex">
                        <span>Bullet Damage</span>
                        <div style="flex: 1"></div>
                        <span rhu-id="ebulletDamage"></span>
                    </li>
                    <li style="display: flex">
                        <span>Melee Damage</span>
                        <div style="flex: 1"></div>
                        <span rhu-id="emeleeDamage"></span>
                    </li>
                    <li style="display: flex">
                        <span>Sentry Damage</span>
                        <div style="flex: 1"></div>
                        <span rhu-id="esentryDamage"></span>
                    </li>
                    <li style="display: flex">
                        <span>Explosive Damage</span>
                        <div style="flex: 1"></div>
                        <span rhu-id="eexplosiveDamage"></span>
                    </li>
                    <li style="display: flex">
                        <span>Stagger Damage</span>
                        <div style="flex: 1"></div>
                        <span rhu-id="estaggerDamage"></span>
                    </li>
                    <li style="display: flex">
                        <span>Sentry Stagger Damage</span>
                        <div style="flex: 1"></div>
                        <span rhu-id="esentryStaggerDamage"></span>
                    </li>
                </ul>
                <div></div>
                <span style="font-size: 20px;">Damage Dealt to Players</span>
                <ul>
                    <li style="display: flex">
                        <span>Bullet Damage</span>
                        <div style="flex: 1"></div>
                        <span rhu-id="pbulletDamage"></span>
                    </li>
                    <li style="display: flex">
                        <span>Sentry Damage</span>
                        <div style="flex: 1"></div>
                        <span rhu-id="psentryDamage"></span>
                    </li>
                    <li style="display: flex">
                        <span>Explosive Damage</span>
                        <div style="flex: 1"></div>
                        <span rhu-id="pexplosiveDamage"></span>
                    </li>
                </ul>
            </div>
            `);
    
        const update = () => {
            // TODO(randomuserhi): handle empty data (early returns) and display correctly instead of skipping.

            if (parent.dropdown.value === undefined) return;
            const snet = parent.dropdown.value as bigint;

            let ebulletDamage = 0;
            let emeleeDamage = 0;
            let esentryDamage = 0;
            let eexplosiveDamage = 0;
            let estaggerDamage = 0;
            let esentryStaggerDamage = 0;
            let pbulletDamage = 0;
            let psentryDamage = 0;
            let pexplosiveDamage = 0;

            const api = parent.player.api;
            if (api !== undefined) {
                const stats = api.getOrDefault("Vanilla.StatTracker", StatTracker).players.get(snet);
                if (stats !== undefined) {
                    ebulletDamage = Math.round([...stats.enemyDamage.bulletDamage.values()].reduce((p, c) => p + c.value, 0) * 10) / 10;
                    emeleeDamage = Math.round([...stats.enemyDamage.meleeDamage.values()].reduce((p, c) => p + c.value, 0) * 10) / 10;
                    esentryDamage = Math.round([...stats.enemyDamage.sentryDamage.values()].reduce((p, c) => p + c.value, 0) * 10) / 10;
                    eexplosiveDamage = Math.round([...stats.enemyDamage.explosiveDamage.values()].reduce((p, c) => p + c.value, 0) * 10) / 10;
                    estaggerDamage = Math.round([...stats.enemyDamage.staggerDamage.values()].reduce((p, c) => p + c.value, 0) * 10) / 10;
                    esentryStaggerDamage = Math.round([...stats.enemyDamage.sentryStaggerDamage.values()].reduce((p, c) => p + c.value, 0) * 10) / 10;

                    pbulletDamage = Math.round([...stats.playerDamage.bulletDamage.values()].reduce((p, c) => p + c, 0) * 10) / 10;
                    psentryDamage = Math.round([...stats.playerDamage.sentryDamage.values()].reduce((p, c) => p + c, 0) * 10) / 10;
                    pexplosiveDamage = Math.round([...stats.playerDamage.explosiveDamage.values()].reduce((p, c) => p + c, 0) * 10) / 10;
                }
            }

            frag.ebulletDamage.innerText = `${ebulletDamage}`;
            frag.emeleeDamage.innerText = `${emeleeDamage}`;
            frag.esentryDamage.innerText = `${esentryDamage}`;
            frag.eexplosiveDamage.innerText = `${eexplosiveDamage}`;
            frag.estaggerDamage.innerText = `${estaggerDamage}`;
            frag.esentryStaggerDamage.innerText = `${esentryStaggerDamage}`;

            frag.pbulletDamage.innerText = `${Math.round(pbulletDamage / specification.player.maxHealth * 1000) / 10}%`;
            frag.psentryDamage.innerText = `${Math.round(psentryDamage / specification.player.maxHealth * 1000) / 10}%`;
            frag.pexplosiveDamage.innerText = `${Math.round(pexplosiveDamage / specification.player.maxHealth * 1000) / 10}%`;
        };

        return [node.children[0], "Damage Dealt", update];
    },
    (parent) => {
        return createTypeTable(parent, "Kills", (stats) => [...stats.kills.values()], (data) => {
            const spec = specification.getEnemy(data.type);
            return [spec?.name === undefined ? "Unknown" : spec.name, data.value];
        });
    },
    (parent) => {
        return createTypeTable(parent, "Sentry Kills", (stats) => [...stats.sentryKills.values()], (data) => {
            const spec = specification.getEnemy(data.type);
            return [spec?.name === undefined ? "Unknown" : spec.name, data.value];
        });
    },
    (parent) => {
        return createTypeTable(parent, "Mine Kills", (stats) => [...stats.mineKills.values()], (data) => {
            const spec = specification.getEnemy(data.type);
            return [spec?.name === undefined ? "Unknown" : spec.name, data.value];
        });
    },
    (parent) => {
        return createTypeTable(parent, "Assists", (stats) => [...stats.assists.values()], (data) => {
            const spec = specification.getEnemy(data.type);
            return [spec?.name === undefined ? "Unknown" : spec.name, data.value];
        });
    },
    (parent) => {
        return createTypeTable(parent, "Tongues Dodged", (stats) => [...stats.tongueDodges.values()], (data) => {
            const spec = specification.getEnemy(data.type);
            return [spec?.name === undefined ? "Unknown" : spec.name, data.value];
        });
    },
    (parent) => {
        return createTypeTable(parent, "Packs Used", (stats) => [...stats.packsUsed.entries()], (data) => [data[0], data[1]]);
    },
    (parent) => {
        return createTypeTable(parent, "Packs Given", (stats) => [...stats.packsGiven.entries()], (data) => [data[0], data[1]]);
    },
    (parent) => {
        // TODO(randomuserhi): Nicer visualisations

        const [frag, node] = Macro.anon<{
            fallDamage: HTMLSpanElement;
            revives: HTMLSpanElement;
        }>(/*html*/`
            <div class="${style.row}" style="
            gap: 10px;
            ">
                <span style="font-size: 20px;">Miscellaneous</span>
                <ul rhu-id="list">
                    <li style="display: flex">
                        <span>Revives</span>
                        <div style="flex: 1"></div>
                        <span rhu-id="revives"></span>
                    </li>
                    <li style="display: flex">
                        <span>Fall Damage</span>
                        <div style="flex: 1"></div>
                        <span rhu-id="fallDamage"></span>
                    </li>
                </ul>
            </div>
            `);
    
        const update = () => {
            // TODO(randomuserhi): handle empty data (early returns) and display correctly instead of skipping.

            if (parent.dropdown.value === undefined) return;
            const snet = parent.dropdown.value as bigint;

            const api = parent.player.api;
            if (api === undefined) return;

            const stats = api.getOrDefault("Vanilla.StatTracker", StatTracker).players.get(snet);
            if (stats === undefined) {
                frag.fallDamage.innerText = `0%`;
                frag.revives.innerText = `0`;
                return;
            }

            frag.fallDamage.innerText = `${Math.round(stats.fallDamage / specification.player.maxHealth / 10) * 10}%`;
            frag.revives.innerText = `${stats.revives}`;
        };

        return [node.children[0], "Packs Given", update];
    }
];

export const stats = Macro((() => {
    const stats = function(this: stats) {
        this.features = [];
        for (const feature of _features) {
            const f = feature(this);
            const [node, key, update] = f;
            this.features.push(f);
            this.body.append(node);
        }
        this.fuse = new Fuse(this.features, {
            keys: ["1"]
        });

        this.render = () => {
            let value = this.search.value;
            value = value.trim();
            if (value.length === 0) {
                this.body.replaceChildren(...this.features.map((n) => n[0]));
                return;
            }
            const results = this.fuse.search(value).map((n) => n.item[0]);
            this.body.replaceChildren(...results);
        };
        this.search.addEventListener("keyup", this.render);
    } as Constructor<stats>;

    stats.prototype.init = function(player) {
        this.player = player;
    };

    stats.prototype.update = function() {
        const api = this.player.api;
        if (api !== undefined) {
            const all = api.get("Vanilla.Player.Snet");
            if (all === undefined) {
                this.dropdown.clear();
            } else {
                const players: [any, string][] = [];
                for (const player of all.values()) {
                    players.push([player.snet, player.nickname]);
                }
                this.dropdown.update(players);
            }
        }

        if (this.dropdown.value === undefined) {
            this.body.style.display = "none";
            this.empty.style.display = "block";
        } else {
            this.body.style.display = "flex";
            this.empty.style.display = "none";
            for (const [node, key, update, reset] of this.features) {
                if (update !== undefined) update();
            }
        }
    };

    stats.prototype.reset = function() {
        this.dropdown.clear();
        for (const [node, key, update, reset] of this.features) {
            if (reset !== undefined) reset();
        }
    };

    return stats;
})(), "routes/player.stats", //html
`
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
    display: flex;
    flex-direction: column;
    gap: 10px;
    ">
        ${dropdown`rhu-id="dropdown" style="width: 100%;"`}
        <input rhu-id="search" placeholder="Search ..." class="${style.search}" type="text" spellcheck="false" autocomplete="false"/>
    </div>
    <div rhu-id="body" class="${style.body}" style="display: none; padding-bottom: 50px;">
    </div>
    <div rhu-id="empty">
        No player selected.
    </div>
    `, {
    element: //html
        `<div class="${style.wrapper}"></div>`
});