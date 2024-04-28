import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Player.Animation": {
                parse: PlayerAnimState;
                spawn: PlayerAnimState;
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Player.Animation": Map<number, PlayerAnimState>;
        }
    }
}

export interface PlayerAnimState {
    velocity: Pod.Vector;
    crouch: number;
}

ModuleLoader.registerDynamic("Vanilla.Player.Animation", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                velocity: { x: await BitHelper.readHalf(data), y: 0, z: await BitHelper.readHalf(data) },
                crouch: await BitHelper.readHalf(data)
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const anims = snapshot.getOrDefault("Vanilla.Player.Animation", () => new Map());
    
            if (!anims.has(id)) throw new AnimNotFound(`PlayerAnim of id '${id}' was not found.`);
            const anim = anims.get(id)!;
            Pod.Vec.lerp(anim.velocity, anim.velocity, data.velocity, lerp);
            anim.crouch = anim.crouch + (data.crouch - anim.crouch) * lerp;
        }
    },
    spawn: {
        parse: async (data) => {
            return {
                velocity: { x: await BitHelper.readHalf(data), y: 0, z: await BitHelper.readHalf(data) },
                crouch: await BitHelper.readHalf(data)
            };
        },
        exec: (id, data, snapshot) => {
            const anims = snapshot.getOrDefault("Vanilla.Player.Animation", () => new Map());
        
            if (anims.has(id)) throw new DuplicateAnim(`PlayerAnim of id '${id}' already exists.`);
            anims.set(id, { ...data });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const anims = snapshot.getOrDefault("Vanilla.Player.Animation", () => new Map());

            if (!anims.has(id)) throw new AnimNotFound(`PlayerAnim of id '${id}' did not exist.`);
            anims.delete(id);
        }
    }
});

export class AnimNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicateAnim extends Error {
    constructor(message?: string) {
        super(message);
    }
}