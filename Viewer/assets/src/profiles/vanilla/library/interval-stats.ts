import type { PlayerStats } from "../parser/stattracker/stattracker.js";
import type { IntervalPlayerStats } from "@esm/@root/main/interface.js";

const sum = (values?: Map<unknown, number | { value: number }>) => values ? [...values.values()].reduce((total: number, value) => total + (typeof value === "number" ? value : value.value), 0) : 0;
function totals(stats?: PlayerStats) {
    const damage = stats?.enemyDamage;
    return {
        damage: sum(damage?.bulletDamage) + sum(damage?.meleeDamage) + sum(damage?.explosiveDamage) + sum(damage?.sentryDamage) + [...damage?.custom.values() ?? []].reduce((total, values) => total + sum(values), 0),
        kills: sum(stats?.kills) + sum(stats?.mineKills) + sum(stats?.sentryKills), assists: sum(stats?.assists),
        shots: [...stats?.accuracy.values() ?? []].reduce((total, value) => total + value.total, 0),
        hits: [...stats?.accuracy.values() ?? []].reduce((total, value) => total + value.hits, 0),
        revives: stats?.revives ?? 0, packs: sum(stats?.packsUsed), packsConsumed: sum(stats?.packsConsumed)
    };
}
export function intervalStats(before: Map<bigint, PlayerStats>, after: Map<bigint, PlayerStats>, names: Map<bigint, string>, availability: (id: bigint) => { host: boolean; accuracy: boolean; clientPacks: boolean }): IntervalPlayerStats[] {
    return [...names].map(([id, player]) => {
        const a = totals(before.get(id)), b = totals(after.get(id));
        const available = availability(id);
        const captured = (value: number, known: boolean) => value !== 0 || known ? value : null;
        const accuracy = available.accuracy || (after.get(id)?.accuracy.size ?? 0) > 0;
        return { player, damage: captured(b.damage - a.damage, available.host), kills: captured(b.kills - a.kills, available.host), assists: captured(b.assists - a.assists, available.host),
            shots: captured(b.shots - a.shots, accuracy), hits: captured(b.hits - a.hits, accuracy), revives: b.revives - a.revives, packs: captured(b.packs - a.packs, available.host), packsConsumed: captured(b.packsConsumed - a.packsConsumed, available.clientPacks) };
    });
}
