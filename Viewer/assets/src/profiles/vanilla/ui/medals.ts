import { html, HTML, Macro, MacroElement } from "@esm/@/rhu/macro.js";
import { signal, Signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import { ReplayApi } from "@esm/@root/replay/moduleloader.js";
import { PlayerDatablock } from "../datablocks/player/player.js";
import { StatTracker } from "../parser/stattracker/stattracker.js";

interface MedalRequirement {
    name: string;
    icon: string;
    description: HTML<{ value: Signal<string> }>;
    award: (medals: Map<bigint, Map<string, string>>, api: ReplayApi, players: bigint[]) => void;
}

function msToString(time: number): string {
    const seconds = Math.floor(time / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const s = seconds - minutes * 60;
    const m = minutes - hours * 60;
    if (hours > 0)
        return `${hours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    else
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const MedalDatablock = new Map<string, MedalRequirement>(([
    {
        name: "MVP",
        icon: "./medals/MVP.png",
        description: html`
        <div>Deal the most damage<br/>(excluding sentry / mines)</div>
        <div><span style="color: #e9bc29">${Macro.signal("value")}</span> damage dealt</div>
        `,
        award(medals, api, players) {
            const statTracker = StatTracker.from(api);

            if (players.length === 0) return;

            let chosen: bigint[] = [];
            let maxDamage = 0;
            for (const snet of players) {
                const stats = StatTracker.getPlayer(snet, statTracker);
                
                let bulletDamage = 0;
                for (const damage of stats.enemyDamage.bulletDamage.values()) {
                    bulletDamage += damage.value;
                } 

                let meleeDamage = 0;
                for (const damage of stats.enemyDamage.meleeDamage.values()) {
                    meleeDamage += damage.value;
                }

                const total = bulletDamage + meleeDamage;
                if (total > maxDamage) {
                    chosen = [];
                    maxDamage = total;
                }
                if (total == maxDamage) {
                    chosen.push(snet);
                }
            } 

            if (maxDamage === 0) return;

            if (chosen.length === 1) {
                const snet = chosen[0];
                if (!medals.has(snet)) {
                    medals.set(snet, new Map());
                }
                medals.get(snet)!.set(this.name, `${maxDamage.toFixed(2)}`);
            }
        }
    },
    {
        name: "Imposter",
        icon: "./medals/imposter.png",
        description: html`
        <div>Most damage dealt to teammates (more than 50% damage)</div>
        <div><span style="color: #e9bc29">${Macro.signal("value")}%</span> damage dealt</div>
        `,
        award(medals, api, players) {
            const statTracker = StatTracker.from(api);
            if (players.length === 0) return;

            let chosen: bigint[] = [];
            let maxDamage = 0;
            for (const snet of players) {
                const stats = StatTracker.getPlayer(snet, statTracker);
                
                let bulletDamage = 0;
                for (const damage of stats.playerDamage.bulletDamage.values()) {
                    bulletDamage += damage;
                } 

                let explosiveDamage = 0;
                for (const damage of stats.playerDamage.explosiveDamage.values()) {
                    explosiveDamage += damage;
                }

                const total = bulletDamage + explosiveDamage;
                if (total > maxDamage) {
                    chosen = [];
                    maxDamage = total;
                }
                if (total == maxDamage) {
                    chosen.push(snet);
                }
            } 

            if (maxDamage < PlayerDatablock.health / 2) return;

            if (chosen.length === 1) {
                const snet = chosen[0];
                if (!medals.has(snet)) {
                    medals.set(snet, new Map());
                }
                medals.get(snet)!.set(this.name, `${(maxDamage/PlayerDatablock.health*100).toFixed(2)}`);
            }
        }
    },
    {
        name: "Fancy Feet",
        icon: "./medals/faker.png",
        description: html`
        <div>Most tongues avoided</div>
        <div><span style="color: #e9bc29">${Macro.signal("value")}</span> avoided</div>
        `,
        award(medals, api, players) {
            const statTracker = StatTracker.from(api);
            if (players.length === 0) return;

            let chosen: bigint[] = [];
            let maxDodges = 0;
            for (const snet of players) {
                const stats = StatTracker.getPlayer(snet, statTracker);
                
                let dodges = 0;
                for (const count of stats.tongueDodges.values()) {
                    dodges += count.value;
                }

                if (dodges > maxDodges) {
                    chosen = [];
                    maxDodges = dodges;
                }
                if (dodges == maxDodges) {
                    chosen.push(snet);
                }
            } 

            if (maxDodges === 0) return;

            if (chosen.length === 1) {
                const snet = chosen[0];
                if (!medals.has(snet)) {
                    medals.set(snet, new Map());
                }
                medals.get(snet)!.set(this.name, `${maxDodges}`);
            }
        }
    },
    {
        name: "Guardian Angel",
        icon: "./medals/angel.png",
        description: html`
            <div>Most revives</div>
            <div><span style="color: #e9bc29">${Macro.signal("value")}</span> revives</div>
        `,
        award(medals, api, players) {
            const statTracker = StatTracker.from(api);
            if (players.length === 0) return;

            let chosen: bigint[] = [];
            let maxRevives = 0;
            for (const snet of players) {
                const stats = StatTracker.getPlayer(snet, statTracker);
                
                const revives = stats.revives;

                if (revives > maxRevives) {
                    chosen = [];
                    maxRevives = revives;
                }
                if (revives == maxRevives) {
                    chosen.push(snet);
                }
            } 

            if (maxRevives === 0) return;

            if (chosen.length === 1) {
                const snet = chosen[0];
                if (!medals.has(snet)) {
                    medals.set(snet, new Map());
                }
                medals.get(snet)!.set(this.name, `${maxRevives}`);
            }
        }
    },
    {
        name: "Supporter",
        icon: "./medals/support.png",
        description: html`
            <div>Most assists</div>
            <div><span style="color: #e9bc29">${Macro.signal("value")}</span> assists</div>
        `,
        award(medals, api, players) {
            const statTracker = StatTracker.from(api);
            if (players.length === 0) return;

            let chosen: bigint[] = [];
            let maxAssists = 0;
            for (const snet of players) {
                const stats = StatTracker.getPlayer(snet, statTracker);
                
                let assists = 0;
                for (const count of stats.assists.values()) {
                    assists += count.value;
                }

                if (assists > maxAssists) {
                    chosen = [];
                    maxAssists = assists;
                }
                if (assists == maxAssists) {
                    chosen.push(snet);
                }
            } 

            if (maxAssists === 0) return;

            if (chosen.length === 1) {
                const snet = chosen[0];
                if (!medals.has(snet)) {
                    medals.set(snet, new Map());
                }
                medals.get(snet)!.set(this.name, `${maxAssists}`);
            }
        }
    },
    {
        name: "Kill Stealer",
        icon: "./medals/killstealer.png",
        description: html`
            <div>Most kills (excluding sentry / mines), but not most damage</div>
            <div><span style="color: #e9bc29">${Macro.signal("value")}</span> kills</div>
        `,
        award(medals, api, players) {
            const statTracker = StatTracker.from(api);
            if (players.length === 0) return;

            let chosen: bigint[] = [];
            let maxKills = 0;
            for (const snet of players) {
                const stats = StatTracker.getPlayer(snet, statTracker);
                
                // NOTE(randomuserhi): Only accounts for player-earned kills (no sentry / mine kills)

                let kills = 0;
                for (const count of stats.kills.values()) {
                    kills += count.value;
                }

                if (kills > maxKills) {
                    chosen = [];
                    maxKills = kills;
                }
                if (kills == maxKills) {
                    chosen.push(snet);
                }
            } 

            if (maxKills === 0) return;

            if (chosen.length === 1) {
                const snet = chosen[0];
                if (medals.has(snet) && medals.get(snet)!.has("MVP")) return;

                if (!medals.has(snet)) {
                    medals.set(snet, new Map());
                }
                medals.get(snet)!.set(this.name, `${maxKills}`);
            }
        }
    },
    {
        name: "Sleepy",
        icon: "./medals/sleepy.png",
        description: html`
            <div>Most time spent downed</div>
            <div><span style="color: #e9bc29">${Macro.signal("value")}</span> time spent</div>
        `,
        award(medals, api, players) {
            const statTracker = StatTracker.from(api);
            if (players.length === 0) return;

            const time = api.time();

            let chosen: bigint[] = [];
            let maxDownedTime = 0;
            for (const snet of players) {
                const stats = StatTracker.getPlayer(snet, statTracker);
                
                let downedTime = stats.timeSpentDowned;
                if (stats._downedTimeStamp !== undefined) {
                    downedTime += Math.clamp(time - stats._downedTimeStamp, 0, Infinity);
                }

                if (downedTime > maxDownedTime) {
                    chosen = [];
                    maxDownedTime = downedTime;
                }
                if (downedTime == maxDownedTime) {
                    chosen.push(snet);
                }
            } 

            if (maxDownedTime === 0) return;

            if (chosen.length === 1) {
                const snet = chosen[0];
                if (!medals.has(snet)) {
                    medals.set(snet, new Map());
                }
                medals.get(snet)!.set(this.name, msToString(maxDownedTime));
            }
        }
    },
    {
        name: "Fragile",
        icon: "./medals/fragile.png",
        description: html`
            <div>Most healing items consumed</div>
            <div><span style="color: #e9bc29">${Macro.signal("value")}</span> items used</div>
        `,
        award(medals, api, players) {
            const statTracker = StatTracker.from(api);
            if (players.length === 0) return;

            let chosen: bigint[] = [];
            let maxMedi = 0;
            for (const snet of players) {
                const stats = StatTracker.getPlayer(snet, statTracker);
                
                let mediUsed = 0;
                if (stats.packsUsed.has("Healing")) {
                    mediUsed = stats.packsUsed.get("Healing")!;
                }

                if (mediUsed > maxMedi) {
                    chosen = [];
                    maxMedi = mediUsed;
                }
                if (mediUsed == maxMedi) {
                    chosen.push(snet);
                }
            } 

            if (maxMedi === 0) return;

            if (chosen.length === 1) {
                const snet = chosen[0];
                if (!medals.has(snet)) {
                    medals.set(snet, new Map());
                }
                medals.get(snet)!.set(this.name, `${maxMedi}`);
            }
        }
    },
    {
        name: "Lazy",
        icon: "./medals/lazy.png",
        description: html`
            <div>Deal more damage with your sentry than your guns.</div>
            <div>Sentry did <span style="color: #e9bc29">${Macro.signal("value")}%</span> more damage.</div>
        `,
        award(medals, api, players) {
            const statTracker = StatTracker.from(api);
            if (players.length === 0) return;

            const chosen: {snet: bigint, sentryDamage: number, gunDamage: number}[] = [];
            for (const snet of players) {
                const stats = StatTracker.getPlayer(snet, statTracker);
                
                let sentryDamage = 0;
                for (const damage of stats.enemyDamage.sentryDamage.values()) {
                    sentryDamage += damage.value;
                }
                if (sentryDamage === 0) continue;

                let bulletDamage = 0;
                for (const damage of stats.enemyDamage.bulletDamage.values()) {
                    bulletDamage += damage.value;
                } 

                let meleeDamage = 0;
                for (const damage of stats.enemyDamage.meleeDamage.values()) {
                    meleeDamage += damage.value;
                }

                let explosiveDamage = 0;
                for (const damage of stats.enemyDamage.explosiveDamage.values()) {
                    explosiveDamage += damage.value;
                }

                const gunDamage = bulletDamage + meleeDamage + explosiveDamage;

                if (sentryDamage > gunDamage) {
                    chosen.push({
                        snet,
                        gunDamage,
                        sentryDamage
                    });
                }
            } 

            for (const { snet, sentryDamage, gunDamage } of chosen) {
                if (!medals.has(snet)) {
                    medals.set(snet, new Map());
                }
                medals.get(snet)!.set(this.name, `${Math.ceil((sentryDamage / gunDamage - 1) * 100)}`);
            }
        }
    },
    {
        name: "Lone Wolf",
        icon: "./medals/wolf.png",
        description: html`
            <div>Be the longest sole player alive for atleast 1 minute.</div>
            <div><span style="color: #e9bc29">${Macro.signal("value")}</span> time spent solo.</div>
        `,
        award(medals, api, players) {
            const statTracker = StatTracker.from(api);
            if (players.length === 0) return;

            const time = api.time();

            let chosen: bigint[] = [];
            let maxTimeSolo = 0;
            for (const snet of players) {
                const stats = StatTracker.getPlayer(snet, statTracker);
                
                let timeSolo = stats.timeSpentSolo;
                if (stats._timeSpentSoloTimeStamp !== undefined) {
                    timeSolo += Math.clamp(time - stats._timeSpentSoloTimeStamp, 0, Infinity);
                }

                if (timeSolo > maxTimeSolo) {
                    chosen = [];
                    maxTimeSolo = timeSolo;
                }
                if (timeSolo == maxTimeSolo) {
                    chosen.push(snet);
                }
            } 

            if (maxTimeSolo < 60 * 1000) return;

            if (chosen.length === 1) {
                const snet = chosen[0];
                if (!medals.has(snet)) {
                    medals.set(snet, new Map());
                }
                medals.get(snet)!.set(this.name, msToString(maxTimeSolo));
            }
        }
    },
] as MedalRequirement[]).map(m => [m.name, m]));

const style = Style(({ style }) => {
    const wrapper = style.class`
    position: relative;
    width: 50px;
    height: 50px;
    overflow: visible;
    `;

    const mount = style.class`
    display: none;
    position: absolute;
    left: 50%;
    width: 300px;
    bottom: 35px;
    transform: translate(-50%, -50%);
    background-color: black;
    border: 0.125rem solid;
    border-left: 0.5rem solid;
    border-color: white;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0.5rem;
    `;

    style`
    ${wrapper}:has(>img:hover) ${mount} {
        display: flex;
    }
    `;

    return {
        wrapper,
        mount
    };
});

export const Medal = Macro(class Medal extends MacroElement {
    private _frag = new DocumentFragment();
    get frag() {
        this._frag.replaceChildren(...this.dom);
        return this._frag;
    }

    public remove() {
        this._frag.replaceChildren(...this.dom);
    }

    public key: Signal<string>;
    public value = signal("");

    private img: HTMLImageElement;
    private description: HTMLSpanElement;

    constructor(dom: Node[], bindings: any, children: Node[], key: string, icon: string, description: HTML<{ value: Signal<string> }>) {
        super(dom, bindings);

        this.key(key);
        this.img.src = icon;
        const [b, frag] = description.dom();
        this.value = b.value;
        this.description.replaceChildren(frag);
    }
}, html`
    <div class="${style.wrapper}">
        <img m-id="img"/>
        <div class="${style.mount}">
            <span style="
                font-size: 20px;
                margin-bottom: 0.4rem;
            ">${Macro.signal("key", "Surprise!")}</span>
            <span m-id="description" style="font-size: 15px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem;">You shouldn't be able to see this!</span>
        </div>
    </div>
    `);
