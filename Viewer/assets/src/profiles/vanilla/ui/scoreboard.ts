import { html, Mutable } from "@esm/@/rhu/html.js";
import { Rest } from "@esm/@/rhu/rest.js";
import { Signal, signal } from "@esm/@/rhu/signal.js";
import { Style } from "@esm/@/rhu/style.js";
import type { View } from "@esm/@root/main/routes/player/components/view/index.js";
import { dispose } from "./main.js";
import { Medal, MedalDatablock } from "./medals.js";

const style = Style(({ css }) => {
    const wrapper = css.class`
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
    css`
    ${wrapper} thead,
    ${wrapper} tbody,
    ${wrapper} tr {
        display: contents;
    }`;

    const slot = css.class`
    font-size: 20px;
    color: white;
    background-color: rgba(0, 0, 0, 0.9);

    transition: background-color 200ms;
    `;

    css`
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
    const avatar = css.class`
    cursor: pointer;
    `;
    css`
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

export const Slot = (key: bigint) => {
    interface Slot {
        readonly view: Signal<html<typeof View> | undefined>;
        readonly medals: Signal<Map<string, string>>;

        readonly name: Signal<string>
        readonly kills: Signal<string>
        readonly assists: Signal<string>
        readonly health: Signal<number>
    }
    interface Private {
        readonly wrapper: HTMLTableElement;
        readonly avatar: HTMLTableCellElement;
    }

    const medals = signal<Map<string, string>>(new Map(), (current, next) => {
        if (current === undefined && next === undefined) return true;
        if (current === undefined || next === undefined) return false;
        if (current.size === 0 && next.size === 0) return true;
        return false;
    });
    const list = html.map(medals, undefined, (kv, el?: html<typeof Medal>) => {
        const [key, value] = kv;
        if (el === undefined) {
            el = Medal();
            const medal = MedalDatablock.get(key);
            if (medal === undefined) throw new Error(`Unable to find medal of type ${key}.`);
            el.set(key, medal.icon, medal.description);
        }
        el.value(value);
        return el;
    });

    const name = signal("Name");
    const kills = signal("0");
    const assists = signal("0");

    const dom = html<Mutable<Private & Slot>>/**//*html*/`
        <tr m-id="wrapper" class="${style.slot}">
            <td m-id="avatar" class="${style.avatar}" style="padding: 10px;"></td>
            <td><span>${name}</span></td>
            <td><span>${kills}</span></td>
            <td><span>${assists}</span></td>
            <td style="padding: 0;">
                <span m-id="medalList" style="display: flex; gap: 10px;">
                    ${list}
                </span>
            </td>
        </tr>
        `;
    html(dom).box();
    
    dom.view = signal<html<typeof View> | undefined>(undefined);

    dom.name = name;
    dom.kills = kills;
    dom.assists = assists;
    dom.health = signal(0);
    dom.medals = medals;

    dom.health.on((health) => {
        let bgColor = "rgba(0, 0, 0, 0.9)";
        if (health <= 0) {
            bgColor = "rgba(255, 0, 0, 0.5)";
        }
        dom.wrapper.style.backgroundColor = bgColor;
    });

    fetchProfilePicture(key).then(frag => { 
        if (frag !== undefined && frag !== null) {
            dom.avatar.replaceChildren(frag);
            dom.avatar.addEventListener("click", () => {
                window.open(`https://steamcommunity.com/profiles/${key}`, '_blank')?.focus();
            }, { signal: dispose.signal });
        } 
    });

    dom.name.guard = (name) => {
        if (name.length > 30) {
            return `${name.slice(0, 27)}...`;
        }
        return name;
    };

    return dom as html<Slot>;
};

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

export const Scoreboard = () => {
    interface Scoreboard {
        readonly view: Signal<html<typeof View> | undefined>;

        readonly wrapper: HTMLDivElement;
    }
    interface Private {
        readonly table: HTMLTableElement;
    }

    const _view = signal<html<typeof View> | undefined>(undefined);

    const awardedMedals = new Map<bigint, Map<string, string>>();
    const slots = signal<bigint[]>([], (current, next) => {
        if (current === undefined && next === undefined) return true;
        if (current === undefined || next === undefined) return false;
        if (current.length === 0 && next.length === 0) return true;
        return false;
    }); 

    const list = html.map(slots, function* (slots) { for (const slot of slots) { yield [slot, slot]; } }, (kv, el?: html<typeof Slot>) => {
        const view = _view();
        if (view === undefined) return;

        const api = view.api();
        if (api === undefined) return;

        awardedMedals.clear();
        for (const definition of MedalDatablock.values()) {
            definition.award(awardedMedals, api, slots());
        }

        const tracker = api.get("Vanilla.StatTracker");
        const players = api.get("Vanilla.Player.Snet");
        const status = api.get("Vanilla.Player.Stats");
        if (players === undefined) return;

        const [snet, ] = kv;
        const player = players.get(snet);
        if (player === undefined) return;

        if (el === undefined) {
            el = Slot(snet);
        }

        el.name(`${player.nickname}`);
        const health = status?.get(player.id)?.health;
        el.health(health === undefined ? 100 : health);

        if (awardedMedals.has(snet)) el.medals(awardedMedals.get(snet)!);
        else el.medals(new Map());

        const stats = tracker?.players.get(snet);
        if (stats === undefined) {
            el.kills(`${0}`);
            el.assists(`${0}`);
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
            el.kills(`${totalKills}${(nonPlayerKills != 0 ? ` (${nonPlayerKills})` : "")}`);

            let totalAssists = 0;
            for (const assists of stats.assists.values()) {
                totalAssists += assists.value;
            }
            el.assists(`${totalAssists}`);
        }
        return el;
    });

    const dom = html<Mutable<Private & Scoreboard>>/**//*html*/`
        <div m-id="wrapper" style="display: none;">
            <table class="${style.wrapper}">
                <tbody m-id="table">
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
        `;
    html(dom).box();

    dom.table.append(...list);
    
    dom.view = _view;

    dom.view.on((view) => {
        if (view === undefined) {
            slots([]);
            return;
        }

        view.replay.on(() => {
            slots([]);
        }, { signal: dispose.signal }); 

        view.api.on((api) => {
            if (api === undefined) return;
            
            const players = api.get("Vanilla.Player");
            if (players === undefined) {
                slots([]);
                return;
            }
            const newSlots = [];
            for (const { snet } of players.values()) {
                newSlots.push(snet);
            }
            slots(newSlots);
        }, { signal: dispose.signal });
    }, { signal: dispose.signal });

    return dom as html<Scoreboard>;
};