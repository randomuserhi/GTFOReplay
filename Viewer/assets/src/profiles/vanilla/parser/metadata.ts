import * as BitHelper from "@esm/@root/replay/bithelper.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { describeParticipants } from "../library/eventParticipants.js";
import { enemyNames } from "../library/actorCatalog.js";

ModuleLoader.registerASLModule(module.src);
ModuleLoader.library.index.add((event, snapshot) => {
    const participants = describeParticipants(event, snapshot.get('Vanilla.Player') ?? new Map(), snapshot.get('Vanilla.Enemy.Identities') ?? new Map(), snapshot.get('Vanilla.Mine.Ownership') ?? new Map(), enemyNames);
    if (participants.length) event.participants = participants;
});

export interface Metadata {
    version: string;
    compatibility_OldBulkheadSound: boolean; 
    compatibility_NoArtifact: boolean;
    recordEnemyRagdolls: boolean;
}

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface Headers {
            "Vanilla.Metadata": Metadata;
        }
    }
}

ModuleLoader.registerHeader("Vanilla.Metadata", "0.0.4", {
    parse: async (data, header) => {
        if (header.has("Vanilla.Metadata")) throw new Error("Metadata was already written.");
        header.set("Vanilla.Metadata", {
            version: await BitHelper.readString(data),
            compatibility_OldBulkheadSound: await BitHelper.readBool(data),
            compatibility_NoArtifact: await BitHelper.readBool(data),
            recordEnemyRagdolls: await BitHelper.readBool(data)
        });
    }
});
