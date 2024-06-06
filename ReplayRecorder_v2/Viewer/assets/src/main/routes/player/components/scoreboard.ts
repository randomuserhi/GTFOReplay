import { Constructor, Macro } from "@/rhu/macro.js";
import { Style } from "@/rhu/style.js";
import { Player } from "../../../../modules/parser/player/player.js";
import { PlayerStats } from "../../../../modules/parser/player/playerstats.js";
import { PlayerStats as PlayerStatTracker, StatTracker, getPlayerStats } from "../../../../modules/parser/stattracker/stats.js";
import { ReplayApi } from "../../../../replay/moduleloader.js";
import { MedalDescriptor, getMedals, medal } from "./medal.js";

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "routes/player.scoreboard": scoreboard;
        "routes/player.scoreboard.slot": slot
    }
}

const slotStyle = Style(({ style }) => {
    const wrapper = style.class`
    font-size: 20px;
    color: white;
    background-color: rgba(0, 0, 0, 0.9);

    transition: background-color 200ms;
    `;

    style`
    ${wrapper} td {
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

    return {
        wrapper
    };
});

export interface slot extends HTMLDivElement {
    playerId: number;
    medals: Map<number, medal>;

    update(player: Player, status: PlayerStats, stats: PlayerStatTracker, medals?: MedalDescriptor[]): void;

    name: HTMLSpanElement;
    kills: HTMLSpanElement;
    assists: HTMLSpanElement;
    overlay: HTMLDivElement;
    medalList: HTMLDivElement;
}

const slot = Macro((() => {
    const slot = function(this: slot) {
        this.playerId = 0;
        this.medals = new Map();
    } as Constructor<slot>;

    slot.prototype.update = function(player, status, stats, medals) {
        let bgColor = "rgba(0, 0, 0, 0.9)";
        if (status.health <= 0) {
            bgColor = "rgba(255, 0, 0, 0.5)";
        }
        for (const el of (this.children as any) as HTMLElement[]) {
            el.style.backgroundColor = bgColor;
        }

        this.playerId = player.id;
        
        if (this.name.innerText !== player.nickname) {
            this.name.innerText = player.nickname;
        }

        let totalKills = 0;
        for (const kills of stats.kills.values()) {
            totalKills += kills;
        }
        let mineKills = 0;
        for (const kills of stats.mineKills.values()) {
            mineKills += kills;
        }
        let sentryKills = 0;
        for (const kills of stats.sentryKills.values()) {
            sentryKills += kills;
        }
        const nonPlayerKills = mineKills + sentryKills;
        let text = `${totalKills}${(nonPlayerKills != 0 ? ` (${nonPlayerKills})` : "")}`;
        if (this.kills.innerText !== text) {
            this.kills.innerText = text;
        }

        let totalAssists = 0;
        for (const assists of stats.assists.values()) {
            totalAssists += assists;
        }
        text = `${totalAssists}`;
        if (this.assists.innerText !== text) {
            this.assists.innerText = text;
        }

        if (medals === undefined) {
            this.medalList.replaceChildren();
            this.medals.clear();
            return;
        }

        for (const medal of medals) {
            if (!this.medals.has(medal.id)) {
                const macro = document.createMacro("routes/player.scoreboard.medal");
                this.medalList.append(macro);
                this.medals.set(medal.id, macro);
            }
            this.medals.get(medal.id)!.update(medal);
        }

        for (const [id, medal] of [...this.medals.entries()]) {
            if (!medals.some(m => m.id === id)) {
                medal.replaceWith();
                this.medals.delete(id);
            }
        }
    };

    return slot;
})(), "routes/player.scoreboard.slot", //html
`
    <td><span rhu-id="name">Name</span></td>
    <td><span rhu-id="kills">0</span></td>
    <td><span rhu-id="assists">0</span></td>
    <td rhu-id="medalList" style="padding: 0; gap: 10px;">
    </td>
    `, {
    element: //html
        `<tr class="${slotStyle.wrapper}"></tr>`
});

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

    return {
        wrapper,
    };
});

export interface scoreboard extends HTMLDivElement {
    slots: Map<bigint, slot>;
    update(snapshot: ReplayApi): void;
}

export const scoreboard = Macro((() => {
    const scoreboard = function(this: scoreboard) {
        this.slots = new Map();
    } as Constructor<scoreboard>;

    scoreboard.prototype.update = function(snapshot) {
        const statTracker = snapshot.getOrDefault("Vanilla.StatTracker", StatTracker);
        const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
        const playerStats = snapshot.getOrDefault("Vanilla.Player.Stats", () => new Map());

        const medals = getMedals(snapshot);

        for (const player of players.values()) {
            const stats = getPlayerStats(player.snet, statTracker);
            if (!this.slots.has(stats.snet)) {
                const macro = document.createMacro("routes/player.scoreboard.slot");
                this.slots.set(stats.snet, macro);
                
                this.appendChild(macro);
            }
            if (playerStats.has(player.id)) {
                this.slots.get(stats.snet)!.update(player, playerStats.get(player.id)!, stats, medals.get(stats.snet));
            }
        }

        for (const [snet, slot] of [...this.slots.entries()]) {
            if (!players.has(slot.playerId)) {
                slot.replaceWith();
                this.slots.delete(snet);
            }
        }
    };

    return scoreboard;
})(), "routes/player.scoreboard", //html
`
    <tr style="color: white; font-size: 20px;">
        <td></td>
        <td style="display: flex; align-items: center; justify-content: center;"><span>K</span></td>
        <td style="display: flex; align-items: center; justify-content: center;"><span>A</span></td>
        <td></td>
    </tr>
    `, {
    element: //html
        `<table class="${style.wrapper}"></table>`
});