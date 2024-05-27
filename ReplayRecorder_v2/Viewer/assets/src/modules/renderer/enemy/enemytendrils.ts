import { Color, Matrix4, Quaternion, Vector3 } from "three";
import * as BitHelper from "../../../replay/bithelper.js";
import { consume } from "../../../replay/instancing.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";
import { upV, zeroV } from "../constants.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Enemy.Tendril": {
                parse: {
                    sourcePos: Pod.Vector;
                    relPos: Pod.Vector;
                    detect: boolean;
                };
                spawn: {
                    sourcePos: Pod.Vector;
                    relPos: Pod.Vector;
                    detect: boolean;
                    owner: number;
                };
                despawn: void;
            };
        }

        interface Events {
            "Vanilla.Enemy.TongueEvent": {
                id: number;
                spline: Pod.Vector[];
            }
        }
    
        interface Data {
            "Vanilla.Enemy.Tendril": Map<number, EnemyTendril>
        }
    }
}

export interface EnemyTendril {
    sourcePos: Pod.Vector;
    relPos: Pod.Vector;
    detect: boolean;
    owner: number;
}

ModuleLoader.registerDynamic("Vanilla.Enemy.Tendril", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                sourcePos: await BitHelper.readHalfVector(data),
                relPos: await BitHelper.readHalfVector(data),
                detect: await BitHelper.readBool(data)
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const tendrils = snapshot.getOrDefault("Vanilla.Enemy.Tendril", () => new Map());
    
            if (!tendrils.has(id)) throw new TendrilNotFound(`Tendril of id '${id}' was not found.`);
            
            const tendril = tendrils.get(id)!;
            tendril.detect = data.detect;
            Pod.Vec.lerp(tendril.relPos, tendril.relPos, data.relPos, lerp); 
        }
    },
    spawn: {
        parse: async (data) => {
            return {
                sourcePos: await BitHelper.readHalfVector(data),
                relPos: await BitHelper.readHalfVector(data),
                detect: await BitHelper.readBool(data),
                owner: await BitHelper.readUShort(data)
            };
        },
        exec: (id, data, snapshot) => {
            const tendrils = snapshot.getOrDefault("Vanilla.Enemy.Tendril", () => new Map());
        
            if (tendrils.has(id)) throw new DuplicateTendril(`Tendril of id '${id}' already exists.`);
            tendrils.set(id, { ...data });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const tendrils = snapshot.getOrDefault("Vanilla.Enemy.Tendril", () => new Map());

            if (!tendrils.has(id)) throw new TendrilNotFound(`Tendril of id '${id}' did not exist.`);
            tendrils.delete(id);
        }
    }
});

class TendrilNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

class DuplicateTendril extends Error {
    constructor(message?: string) {
        super(message);
    }
}

// --------------------------- RENDERING ---------------------------


declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Enemy.Tendril": void;
        }
    }
}

const pM = new Matrix4();
const scale = new Vector3(0.02, 0.02, 0.02);
const rot = new Quaternion();
const temp = new Vector3();
const color = new Color();

ModuleLoader.registerRender("Enemy.Tendril", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const tendrils = snapshot.getOrDefault("Vanilla.Enemy.Tendril", () => new Map());
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
            for (const [_, tendril] of tendrils) {
                const owner = enemies.get(tendril.owner);
                if (owner === undefined || owner.dimension !== renderer.get("Dimension")) continue;

                pM.lookAt(temp.copy(tendril.relPos).sub(tendril.sourcePos), zeroV, upV);
                scale.z = Pod.Vec.dist(tendril.sourcePos, tendril.relPos);
                pM.compose(temp.copy(owner.position).add(tendril.sourcePos), rot.setFromRotationMatrix(pM), scale);
                consume("Cylinder.MeshPhong", pM, tendril.detect ? color.set(0xff0000) : color.set(0xffffff));
            }
        } 
    }]);
});

