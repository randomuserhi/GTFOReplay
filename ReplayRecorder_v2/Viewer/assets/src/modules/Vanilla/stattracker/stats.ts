import { Enemy, EnemyCache } from "../enemy/enemy";
import { Player } from "../player/player";
import { PackType } from "./pack";

export function isPlayer(id: number, players: Map<number, Player>) {
    return players.has(id);
}

export function isEnemy(id: number, enemies: Map<number, Enemy>, cache: Map<number, EnemyCache>) {
    return enemies.has(id) || cache.has(id);
}

export function getEnemy(id: number, enemies: Map<number, Enemy>, cache: Map<number, EnemyCache>): Enemy | undefined {
    if (enemies.has(id)) {
        return enemies.get(id)!;
    }
    return cache.get(id)?.enemy;
}

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Data {
            "Vanilla.StatTracker": StatTracker
        }
    }
}

export interface PlayerDamage {
    explosiveDamage: Map<bigint, number>;
    bulletDamage: Map<bigint, number>;
    sentryDamage: Map<bigint, number>;
}

export function PlayerDamage(): PlayerDamage {
    return {
        explosiveDamage: new Map(),
        bulletDamage: new Map(),
        sentryDamage: new Map()
    };
}

export interface EnemyDamage {
    explosiveDamage: Map<number, number>;
    bulletDamage: Map<number, number>;
    sentryDamage: Map<number, number>;
    meleeDamage: Map<number, number>;
    staggerDamage: Map<number, number>;
    sentryStaggerDamage: Map<number, number>;
}

export function EnemyDamage(): EnemyDamage {
    return {
        explosiveDamage: new Map(),
        bulletDamage: new Map(),
        sentryDamage: new Map(),
        meleeDamage: new Map(),
        staggerDamage: new Map(),
        sentryStaggerDamage: new Map(),
    };
}

export interface PlayerStats {
    snet: bigint;
    enemyDamage: EnemyDamage;
    playerDamage: PlayerDamage;
    revives: number;
    packsUsed: Map<PackType, number>;
    packsGiven: Map<PackType, number>;
    timeSpentDowned: number;
    kills: Map<number, number>;
    mineKills: Map<number, number>;
    sentryKills: Map<number, number>;
    assists: Map<number, number>;
    fallDamage: number;
    tongueDodges: Map<number, number>;
    _downedTimeStamp?: number;
}

export function PlayerStats(snet: bigint): PlayerStats {
    return {
        snet,
        enemyDamage: EnemyDamage(),
        playerDamage: PlayerDamage(),
        revives: 0,
        packsUsed: new Map(),
        packsGiven: new Map(),
        timeSpentDowned: 0,
        kills: new Map(),
        mineKills: new Map(),
        sentryKills: new Map(),
        assists: new Map(),
        fallDamage: 0,
        tongueDodges: new Map(),
        _downedTimeStamp: undefined,
    };
}

export interface StatTracker {
    players: Map<bigint, PlayerStats> 
}

export function StatTracker(): StatTracker {
    return {
        players: new Map(),
    };
}

export function getPlayerStats(snet: bigint, tracker: StatTracker): PlayerStats {
    if (!tracker.players.has(snet)) {
        tracker.players.set(snet, PlayerStats(snet));
    }
    return tracker.players.get(snet)!;
}