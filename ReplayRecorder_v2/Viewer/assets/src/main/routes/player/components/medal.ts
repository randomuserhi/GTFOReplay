import { Constructor, Macro } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";
import { StatTracker, getPlayerStats } from "../../../../modules/Vanilla/stattracker/stats.js";
import { ReplayApi } from "../../../../replay/moduleloader.js";

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "routes/player.scoreboard.medal": medal;
    }
}

export interface MedalDescriptor {
    id: number;
    title: string;
    icon: string;
    text: string;
}

interface MedalRequirement {
    id: number;
    award: (medals: Map<bigint, MedalDescriptor[]>, snapshot: ReplayApi) => void;
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

let id = 0;
const medalRequirements: MedalRequirement[] = [
    {
        id: id++,
        award(medals, snapshot: ReplayApi) {
            const statTracker = snapshot.getOrDefault("Vanilla.StatTracker", StatTracker);
            const players = [...snapshot.getOrDefault("Vanilla.Player", () => new Map()).values()];

            if (players.length === 0) return;

            let chosen: bigint[] = [];
            let maxDamage = 0;
            for (let i = 0; i < players.length; ++i) {
                const player = players[i];
                const stats = getPlayerStats(player.snet, statTracker);
                
                let bulletDamage = 0;
                for (const damage of stats.enemyDamage.bulletDamage.values()) {
                    bulletDamage += damage;
                } 

                let meleeDamage = 0;
                for (const damage of stats.enemyDamage.meleeDamage.values()) {
                    meleeDamage += damage;
                }

                const total = bulletDamage + meleeDamage;
                if (total > maxDamage) {
                    chosen = [];
                    maxDamage = total;
                }
                if (total == maxDamage) {
                    chosen.push(player.snet);
                }
            } 

            if (maxDamage === 0) return;

            if (chosen.length === 1) {
                const snet = chosen[0];
                if (!medals.has(snet)) {
                    medals.set(snet, []);
                }
                medals.get(snet)!.push({
                    id: this.id,
                    title: "MVP",
                    icon: "./medals/MVP.png",
                    text: /*html*/`
                        <div>Deal the most damage</div>
                        <div><span style="color: #e9bc29">${(maxDamage).toFixed(2)}</span> damage dealt</div>
                    `
                });
            }
        }
    },
    {
        id: id++,
        award(medals, snapshot: ReplayApi) {
            const statTracker = snapshot.getOrDefault("Vanilla.StatTracker", StatTracker);
            const players = [...snapshot.getOrDefault("Vanilla.Player", () => new Map()).values()];

            if (players.length === 0) return;

            let chosen: bigint[] = [];
            let maxDamage = 0;
            for (let i = 0; i < players.length; ++i) {
                const player = players[i];
                const stats = getPlayerStats(player.snet, statTracker);
                
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
                    chosen.push(player.snet);
                }
            } 

            if (maxDamage < 10) return;

            if (chosen.length === 1) {
                const snet = chosen[0];
                if (!medals.has(snet)) {
                    medals.set(snet, []);
                }
                medals.get(snet)!.push({
                    id: this.id,
                    title: "Imposter",
                    icon: "./medals/imposter.png",
                    text: /*html*/`
                        <div>Most damage dealt to teammates (more than 50 damage)</div>
                        <div><span style="color: #e9bc29">${(maxDamage).toFixed(2)}</span> damage dealt</div>
                    `
                });
            }
        }
    },
    {
        id: id++,
        award(medals, snapshot: ReplayApi) {
            const statTracker = snapshot.getOrDefault("Vanilla.StatTracker", StatTracker);
            const players = [...snapshot.getOrDefault("Vanilla.Player", () => new Map()).values()];

            if (players.length === 0) return;

            let chosen: bigint[] = [];
            let maxDodges = 0;
            for (let i = 0; i < players.length; ++i) {
                const player = players[i];
                const stats = getPlayerStats(player.snet, statTracker);
                
                let dodges = 0;
                for (const count of stats.tongueDodges.values()) {
                    dodges += count;
                }

                if (dodges > maxDodges) {
                    chosen = [];
                    maxDodges = dodges;
                }
                if (dodges == maxDodges) {
                    chosen.push(player.snet);
                }
            } 

            if (maxDodges === 0) return;

            if (chosen.length === 1) {
                const snet = chosen[0];
                if (!medals.has(snet)) {
                    medals.set(snet, []);
                }
                medals.get(snet)!.push({
                    id: this.id,
                    title: "Fancy Feet",
                    icon: "./medals/faker.png",
                    text: /*html*/`
                        <div>Most tongues avoided</div>
                        <div><span style="color: #e9bc29">${maxDodges}</span> avoided</div>
                    `
                });
            }
        }
    },
    {
        id: id++,
        award(medals, snapshot: ReplayApi) {
            const statTracker = snapshot.getOrDefault("Vanilla.StatTracker", StatTracker);
            const players = [...snapshot.getOrDefault("Vanilla.Player", () => new Map()).values()];

            if (players.length === 0) return;

            let chosen: bigint[] = [];
            let maxRevives = 0;
            for (let i = 0; i < players.length; ++i) {
                const player = players[i];
                const stats = getPlayerStats(player.snet, statTracker);
                
                const revives = stats.revives;

                if (revives > maxRevives) {
                    chosen = [];
                    maxRevives = revives;
                }
                if (revives == maxRevives) {
                    chosen.push(player.snet);
                }
            } 

            if (maxRevives === 0) return;

            if (chosen.length === 1) {
                const snet = chosen[0];
                if (!medals.has(snet)) {
                    medals.set(snet, []);
                }
                medals.get(snet)!.push({
                    id: this.id,
                    title: "Guardian Angel",
                    icon: "./medals/angel.png",
                    text: /*html*/`
                        <div>Most revives</div>
                        <div><span style="color: #e9bc29">${maxRevives}</span> revives</div>
                    `
                });
            }
        }
    },
    {
        id: id++,
        award(medals, snapshot: ReplayApi) {
            const statTracker = snapshot.getOrDefault("Vanilla.StatTracker", StatTracker);
            const players = [...snapshot.getOrDefault("Vanilla.Player", () => new Map()).values()];

            if (players.length === 0) return;

            let chosen: bigint[] = [];
            let maxAssists = 0;
            for (let i = 0; i < players.length; ++i) {
                const player = players[i];
                const stats = getPlayerStats(player.snet, statTracker);
                
                let assists = 0;
                for (const count of stats.assists.values()) {
                    assists += count;
                }

                if (assists > maxAssists) {
                    chosen = [];
                    maxAssists = assists;
                }
                if (assists == maxAssists) {
                    chosen.push(player.snet);
                }
            } 

            if (maxAssists === 0) return;

            if (chosen.length === 1) {
                const snet = chosen[0];
                if (!medals.has(snet)) {
                    medals.set(snet, []);
                }
                medals.get(snet)!.push({
                    id: this.id,
                    title: "Supporter",
                    icon: "./medals/support.png",
                    text: /*html*/`
                        <div>Most assists</div>
                        <div><span style="color: #e9bc29">${maxAssists}</span> assists</div>
                    `
                });
            }
        }
    },
    {
        id: id++,
        award(medals, snapshot: ReplayApi) {
            const statTracker = snapshot.getOrDefault("Vanilla.StatTracker", StatTracker);
            const players = [...snapshot.getOrDefault("Vanilla.Player", () => new Map()).values()];

            if (players.length === 0) return;

            let chosen: bigint[] = [];
            let maxKills = 0;
            for (let i = 0; i < players.length; ++i) {
                const player = players[i];
                const stats = getPlayerStats(player.snet, statTracker);
                
                // NOTE(randomuserhi): Only accounts for player-earned kills (no sentry / mine kills)

                let kills = 0;
                for (const count of stats.kills.values()) {
                    kills += count;
                }

                if (kills > maxKills) {
                    chosen = [];
                    maxKills = kills;
                }
                if (kills == maxKills) {
                    chosen.push(player.snet);
                }
            } 

            if (maxKills === 0) return;

            let chosenDamageMax: bigint[] = [];
            let maxDamage = 0;
            for (let i = 0; i < players.length; ++i) {
                const player = players[i];
                const stats = getPlayerStats(player.snet, statTracker);
                
                let bulletDamage = 0;
                for (const damage of stats.enemyDamage.bulletDamage.values()) {
                    bulletDamage += damage;
                } 

                let meleeDamage = 0;
                for (const damage of stats.enemyDamage.meleeDamage.values()) {
                    meleeDamage += damage;
                }

                const total = bulletDamage + meleeDamage;
                if (total > maxDamage) {
                    chosenDamageMax = [];
                    maxDamage = total;
                }
                if (total == maxDamage) {
                    chosenDamageMax.push(player.snet);
                }
            } 

            if (chosen.length === 1) {
                const snet = chosen[0];
                if (chosenDamageMax.some(s => s === snet)) return;

                if (!medals.has(snet)) {
                    medals.set(snet, []);
                }
                medals.get(snet)!.push({
                    id: this.id,
                    title: "Kill Stealer",
                    icon: "./medals/killstealer.png",
                    text: /*html*/`
                        <div>Most kills (excluding sentry / mines), but not most damage</div>
                        <div><span style="color: #e9bc29">${maxKills}</span> kills</div>
                    `
                });
            }
        }
    },
    {
        id: id++,
        award(medals, snapshot: ReplayApi) {
            const statTracker = snapshot.getOrDefault("Vanilla.StatTracker", StatTracker);
            const players = [...snapshot.getOrDefault("Vanilla.Player", () => new Map()).values()];

            if (players.length === 0) return;

            let chosen: bigint[] = [];
            let maxDownedTime = 0;
            for (let i = 0; i < players.length; ++i) {
                const player = players[i];
                const stats = getPlayerStats(player.snet, statTracker);
                
                let downedTime = stats.timeSpentDowned;
                if (stats._downedTimeStamp !== undefined) {
                    downedTime += Math.clamp(snapshot.time() - stats._downedTimeStamp, 0, Infinity);
                }

                if (downedTime > maxDownedTime) {
                    chosen = [];
                    maxDownedTime = downedTime;
                }
                if (downedTime == maxDownedTime) {
                    chosen.push(player.snet);
                }
            } 

            if (maxDownedTime === 0) return;

            if (chosen.length === 1) {
                const snet = chosen[0];
                if (!medals.has(snet)) {
                    medals.set(snet, []);
                }
                medals.get(snet)!.push({
                    id: this.id,
                    title: "Sleepy",
                    icon: "./medals/sleepy.png",
                    text: /*html*/`
                        <div>Most time spent downed</div>
                        <div><span style="color: #e9bc29">${msToString(maxDownedTime)}</span> time spent</div>
                    `
                });
            }
        }
    },
    {
        id: id++,
        award(medals, snapshot: ReplayApi) {
            const statTracker = snapshot.getOrDefault("Vanilla.StatTracker", StatTracker);
            const players = [...snapshot.getOrDefault("Vanilla.Player", () => new Map()).values()];

            if (players.length === 0) return;

            let chosen: bigint[] = [];
            let maxMedi = 0;
            for (let i = 0; i < players.length; ++i) {
                const player = players[i];
                const stats = getPlayerStats(player.snet, statTracker);
                
                let mediUsed = 0;
                if (stats.packsUsed.has("Medi")) {
                    mediUsed = stats.packsUsed.get("Medi")!;
                }

                if (mediUsed > maxMedi) {
                    chosen = [];
                    maxMedi = mediUsed;
                }
                if (mediUsed == maxMedi) {
                    chosen.push(player.snet);
                }
            } 

            if (maxMedi === 0) return;

            if (chosen.length === 1) {
                const snet = chosen[0];
                if (!medals.has(snet)) {
                    medals.set(snet, []);
                }
                medals.get(snet)!.push({
                    id: this.id,
                    title: "Fragile",
                    icon: "./medals/fragile.png",
                    text: /*html*/`
                        <div>Most medipacks consumed</div>
                        <div><span style="color: #e9bc29">${maxMedi}</span> packs used</div>
                    `
                });
            }
        }
    },
    {
        id: id++,
        award(medals, snapshot: ReplayApi) {
            const statTracker = snapshot.getOrDefault("Vanilla.StatTracker", StatTracker);
            const players = [...snapshot.getOrDefault("Vanilla.Player", () => new Map()).values()];

            if (players.length === 0) return;

            const chosen: {snet: bigint, sentryDamage: number, gunDamage: number}[] = [];
            for (let i = 0; i < players.length; ++i) {
                const player = players[i];
                const stats = getPlayerStats(player.snet, statTracker);
                
                let sentryDamage = 0;
                for (const damage of stats.enemyDamage.sentryDamage.values()) {
                    sentryDamage += damage;
                }
                if (sentryDamage === 0) continue;

                let bulletDamage = 0;
                for (const damage of stats.enemyDamage.bulletDamage.values()) {
                    bulletDamage += damage;
                } 

                let meleeDamage = 0;
                for (const damage of stats.enemyDamage.meleeDamage.values()) {
                    meleeDamage += damage;
                }

                let explosiveDamage = 0;
                for (const damage of stats.enemyDamage.explosiveDamage.values()) {
                    explosiveDamage += damage;
                }

                const gunDamage = bulletDamage + meleeDamage + explosiveDamage;

                if (sentryDamage > gunDamage) {
                    chosen.push({
                        snet: player.snet,
                        gunDamage,
                        sentryDamage
                    });
                }
            } 

            for (const { snet, sentryDamage, gunDamage } of chosen) {
                if (!medals.has(snet)) {
                    medals.set(snet, []);
                }
                medals.get(snet)!.push({
                    id: this.id,
                    title: "Lazy",
                    icon: "./medals/lazy.png",
                    text: /*html*/`
                        <div>Deal more damage with your sentry than your guns.</div>
                        <div>Sentry did <span style="color: #e9bc29">${Math.ceil((sentryDamage / gunDamage - 1) * 100)}%</span> more damage.</div>
                    `
                });
            }
        }
    },
]; 

export function getMedals(snapshot: ReplayApi): Map<bigint, MedalDescriptor[]> {
    const medals: Map<bigint, MedalDescriptor[]> = new Map();

    for (const requirement of medalRequirements) {
        requirement.award(medals, snapshot);
    }

    return medals;
}

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

export interface medal extends HTMLDivElement {
    update(descriptor: MedalDescriptor): void;

    medalId: number;
    icon: HTMLImageElement;
    name: HTMLSpanElement;
    desc: HTMLSpanElement;
}

export const medal = Macro((() => {
    const medal = function(this: medal) {
    } as Constructor<medal>;

    medal.prototype.update = function(descriptor: MedalDescriptor) {
        this.medalId = descriptor.id;
        this.icon.src = descriptor.icon;
        this.name.innerHTML = descriptor.title;
        this.desc.innerHTML = descriptor.text;
    };

    return medal;
})(), "routes/player.scoreboard.medal", //html
`
    <img rhu-id="icon"/>
    <div class="${style.mount}">
        <span rhu-id="name" style="
            font-size: 20px;
            margin-bottom: 0.4rem;
        "></span>
        <span rhu-id="desc" style="font-size: 15px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem;"></span>
    </div>
    `, {
    element: //html
        `<div class="${style.wrapper}"></div>`
});