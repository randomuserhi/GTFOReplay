import { ModuleLoader, ReplayApi } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../library/factory.js";
import { PackType } from "../events/packuse.js";
import { Identifier, IdentifierHash } from "../identifier.js";

ModuleLoader.registerASLModule(module.src);

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Data {
            "Vanilla.StatTracker": Database
        }
    }
}

interface PlayerDamage {
    explosiveDamage: Map<bigint, number>;
    bulletDamage: Map<bigint, number>;
    sentryDamage: Map<bigint, number>;
}

function PlayerDamage(): PlayerDamage {
    return {
        explosiveDamage: new Map(),
        bulletDamage: new Map(),
        sentryDamage: new Map()
    };
}

interface IdentifiedValue {
    type: Identifier;
    value: number;
}

interface EnemyDamage {
    explosiveDamage: Map<IdentifierHash, IdentifiedValue>;
    bulletDamage: Map<IdentifierHash, IdentifiedValue>;
    sentryDamage: Map<IdentifierHash, IdentifiedValue>;
    meleeDamage: Map<IdentifierHash, IdentifiedValue>;
    staggerDamage: Map<IdentifierHash, IdentifiedValue>;
    sentryStaggerDamage: Map<IdentifierHash, IdentifiedValue>;

    // TODO(randomuserhi): Typescript on string key
    custom: Map<string, Map<IdentifierHash, IdentifiedValue>>;
}

function EnemyDamage(): EnemyDamage {
    return {
        explosiveDamage: new Map(),
        bulletDamage: new Map(),
        sentryDamage: new Map(),
        meleeDamage: new Map(),
        staggerDamage: new Map(),
        sentryStaggerDamage: new Map(),
        custom: new Map()
    };
}

export interface PlayerStats {
    snet: bigint;
    accuracy: Map<IdentifierHash, { gear: Identifier, total: number, hits: number, crits: number, pierceHits: number, pierceCrits: number, pierceCount: Map<number, number> }>;
    enemyDamage: EnemyDamage;
    playerDamage: PlayerDamage;
    revives: number;
    packsUsed: Map<PackType, number>;
    packsGiven: Map<PackType, number>;
    packsConsumed: Map<PackType, number>;
    timeSpentDowned: number;
    timeSpentSolo: number;
    kills: Map<IdentifierHash, IdentifiedValue>;
    mineKills: Map<IdentifierHash, IdentifiedValue>;
    sentryKills: Map<IdentifierHash, IdentifiedValue>;
    assists: Map<IdentifierHash, IdentifiedValue>;
    fallDamage: number;
    tongueDodges: Map<IdentifierHash, IdentifiedValue>;
    _downedTimeStamp?: number;
    _isSolo: boolean;
    _timeSpentSoloTimeStamp?: number;
    silentShots: number;
    timesDowned: number;
}

function PlayerStats(snet: bigint): PlayerStats {
    return {
        snet,
        accuracy: new Map(),
        enemyDamage: EnemyDamage(),
        playerDamage: PlayerDamage(),
        revives: 0,
        packsUsed: new Map(),
        packsGiven: new Map(),
        packsConsumed: new Map(),
        timeSpentDowned: 0,
        timeSpentSolo: 0,
        kills: new Map(),
        mineKills: new Map(),
        sentryKills: new Map(),
        assists: new Map(),
        fallDamage: 0,
        tongueDodges: new Map(),
        _downedTimeStamp: undefined,
        _isSolo: false,
        _timeSpentSoloTimeStamp: undefined,
        silentShots: 0,
        timesDowned: 0,
    };
}

interface Database {
    confirmedEnemyDeaths: number;
    players: Map<bigint, PlayerStats> 
}

export namespace StatTracker {
    // Rendering statistics must not insert empty or unselected players into replay snapshots.
    export function readPlayer(snet: bigint | undefined, snapshot: ReplayApi): PlayerStats {
        return (snet === undefined ? undefined : snapshot.get("Vanilla.StatTracker")?.players.get(snet)) ?? PlayerStats(snet ?? 0n);
    }

    export function availability(snapshot: ReplayApi, snet?: bigint) {
        const header = snapshot.header.get("ReplayRecorder.Header");
        const core = [...snapshot.get("ReplayRecorder.Player")?.values() ?? []];
        return {
            host: header?.isMaster === true || core.some(player => player.isMaster && player.hasReplayMod),
            accuracy: snet !== undefined && (header?.recorder === snet || core.some(player => player.snet === snet && player.hasReplayMod)),
            dodges: header?.isMaster === true
        };
    }

    export function clientPacksAvailable(snapshot: ReplayApi, snet?: bigint): boolean {
        return snapshot.header.get("Vanilla.StatTracker.Client") === true && snet !== undefined && snapshot.header.get("ReplayRecorder.Header")?.recorder === snet;
    }

    export function from(snapshot: ReplayApi): Database {
        return snapshot.getOrDefault("Vanilla.StatTracker", Factory("StatDatabase"));
    }
    export function getPlayer(snet: bigint, db: Database): PlayerStats {
        if (!db.players.has(snet)) {
            db.players.set(snet, PlayerStats(snet));
        }
        return db.players.get(snet)!;
    }
}

declare module "../../library/factory.js" {
    interface Typemap {
        "StatDatabase": Database;
    }
}

Factory.register("StatDatabase", () => ({
    confirmedEnemyDeaths: 0,
    players: new Map(),
}));
