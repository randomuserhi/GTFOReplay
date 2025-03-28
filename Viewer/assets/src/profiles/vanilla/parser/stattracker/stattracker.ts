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
    accuracy: Map<IdentifierHash, { gear: Identifier, total: number, hits: number, crits: number, pierceHits: number, pierceCrits: number }>;
    enemyDamage: EnemyDamage;
    playerDamage: PlayerDamage;
    revives: number;
    packsUsed: Map<PackType, number>;
    packsGiven: Map<PackType, number>;
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
    };
}

interface Database {
    players: Map<bigint, PlayerStats> 
}

export namespace StatTracker {
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
    players: new Map(),
}));