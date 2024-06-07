import * as BitHelper from "../../replay/bithelper.js";
import { ReplayApi } from "../../replay/moduleloader.js";
import { ByteStream } from "../../replay/stream";

declare module "../../replay/moduleloader.js" {
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

export interface IdentifierData {
    gearTable: Map<number, string>;
}

const _IdentifierData = () => ({
    gearTable: new Map()
});
export function IdentifierData(api: ReplayApi): IdentifierData {
    return api.getOrDefault("IdentifierData", _IdentifierData);
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

    export function equals(self: Identifier, database: IdentifierData, other?: Identifier) {
        if (other === undefined) return false;
        const gearTable = database.gearTable;
        switch (self.type) {
        case "Unknown": return other.type === "Unknown";
        case "Gear": {
            if (other.type === "Gear") {
                return self.stringKey === other.stringKey;
            }
            return gearTable.get(other.id) === self.stringKey;
        }
        case "Alias_Gear": {
            if (other.type === "Alias_Gear") {
                return self.id === other.id;
            }
            return gearTable.get(self.id) === other.stringKey;
        }
        case "Enemy":
        case "Item": return self.type == other.type && self.id == other.id;
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