import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader, ReplayApi } from "@esm/@root/replay/moduleloader.js";
import { ByteStream } from "@esm/@root/replay/stream.js";
import { Factory } from "../library/factory.js";

ModuleLoader.registerASLModule(module.src);

// NOTE(randomuserhi): Identifiers should be treated as immutable - mutating them causes issues.

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Data {
            "IdentifierData": IdentifierData;
        }
    }
}

const identifierTypes = [
    "Unknown",
    "Gear",
    "Alias_Gear",
    "Item",
    "Enemy",
] as const;
type IdentifierType = typeof identifierTypes[number];

export type IdentifierHash = string;

// Database of internal aliases created by this replay instance
export interface IdentifierData {
    gearTable: Map<number, string>;
}

declare module "../library/factory.js" {
    interface Typemap {
        "IdentifierDatabase": IdentifierData;
    }
}

Factory.register("IdentifierDatabase", () => ({
    gearTable: new Map()
}));
export function IdentifierData(api: ReplayApi): IdentifierData {
    return api.getOrDefault("IdentifierData", Factory("IdentifierDatabase"));
}

export interface Identifier {
    type: IdentifierType;
    id: number;
    stringKey: string;
    hash: IdentifierHash;
}

export namespace Identifier {
    export function create(type: IdentifierType = "Unknown", id: number = 0, stringKey: string = "") {
        return {
            type,
            id,
            stringKey,
            hash: `${stringKey}(${id})[${type}]`
        };
    }
    export const unknown: Identifier = create();

    export function copy(self: Identifier, other: Identifier) {
        self.type = other.type;
        self.id = other.id;
        self.stringKey = other.stringKey;
        self.hash = other.hash;
    }

    export function set(self: Identifier, type: IdentifierType = "Unknown", id: number = 0, stringKey: string = "") {
        self.type = type;
        self.id = id;
        self.stringKey = stringKey;
        self.hash = `${self.stringKey}(${self.id})[${self.type}]`;
    }

    export function isKnown(self: Identifier) {
        return self.type !== "Unknown";
    }

    export function equals(database: IdentifierData, a?: Identifier, b?: Identifier) {
        if (b === undefined || a === undefined) return false;
        const gearTable = database.gearTable;
        switch (a.type) {
        case "Unknown": return b.type === "Unknown";
        case "Gear": {
            if (b.type === "Gear") {
                return a.stringKey === b.stringKey;
            }
            return gearTable.get(b.id) === a.stringKey;
        }
        case "Alias_Gear": {
            if (b.type === "Alias_Gear") {
                return a.id === b.id;
            }
            return gearTable.get(a.id) === b.stringKey;
        }
        case "Enemy":
        case "Item": return a.type == b.type && a.id == b.id;
        default: throw new Error("Not yet implemented.");
        }
    }

    export async function parse(database: IdentifierData, data: ByteStream): Promise<Identifier> {
        const identifier = create();
        
        const gearTable = database.gearTable;

        identifier.type = identifierTypes[await BitHelper.readByte(data)];
        switch (identifier.type) {
        case "Gear": {
            identifier.stringKey = await BitHelper.readString(data);
            identifier.id = await BitHelper.readUShort(data);
            gearTable.set(identifier.id, identifier.stringKey);
        } break;
        case "Alias_Gear": {
            identifier.id = await BitHelper.readUShort(data);
            if (!gearTable.has(identifier.id)) throw new Error(`Unable to find gear of id '${identifier.id}' in gear table.`);
            identifier.stringKey = gearTable.get(identifier.id)!;
            identifier.type = "Gear"; // NOTE(randomuserhi): Normalize 'GearAlias' types to 'Gear'.
        } break;
        case "Item": {
            identifier.id = await BitHelper.readUShort(data);
        } break;
        case "Enemy": {
            identifier.id = await BitHelper.readUShort(data);
        } break;
        }
        identifier.hash = `${identifier.stringKey}(${identifier.id})[${identifier.type}]`;
        return identifier;
    }
}