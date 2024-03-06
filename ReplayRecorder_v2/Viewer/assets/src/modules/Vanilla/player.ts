import { BoxGeometry, Mesh, MeshPhongMaterial, Quaternion, Vector3 } from "three";
import * as BitHelper from "../../replay/bithelper.js";
import { ModuleLoader } from "../../replay/moduleloader.js";
import * as Pod from "../../replay/pod.js";
import { DynamicTransform } from "../replayrecorder.js";

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Player": {
                parse: {
                    dimension: number;
                    absolute: boolean;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                };
                spawn: {
                    dimension: number;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                    snet: bigint;
                    slot: number;
                    nickname: string;
                };
                despawn: void;
            };
        }
    
        interface Data {
            "Vanilla.Player": Map<number, Player>
        }
    }
}

export interface Player extends DynamicTransform {
    snet: bigint;
    slot: number;
    nickname: string;
}

ModuleLoader.registerDynamic("Vanilla.Player", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicTransform.parseTransform(data);
            return result;
        }, 
        exec: (id, data, snapshot, lerp) => {
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
    
            if (!players.has(id)) throw new PlayerNotFound(`Dynamic of id '${id}' was not found.`);
            DynamicTransform.lerp(players.get(id)!, data, lerp);
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicTransform.parseSpawn(data);
            const result = {
                ...spawn,
                snet: await BitHelper.readULong(data),
                slot: await BitHelper.readByte(data),
                nickname: await BitHelper.readString(data)
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
        
            const { snet } = data;
        
            if (players.has(id)) throw new DuplicatePlayer(`Player of id '${id}(${snet})' already exists.`);
            players.set(id, { id, ...data });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());

            if (!players.has(id)) throw new PlayerNotFound(`Player of id '${id}' did not exist.`);
            players.delete(id);
        }
    }
});

export class PlayerNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicatePlayer extends Error {
    constructor(message?: string) {
        super(message);
    }
}

// --------------------------- RENDERING ---------------------------


declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Players": void;
        }

        interface RenderData {
            "Players": Map<number, Mesh>;
        }
    }
}

// TODO(randomuserhi): Proper player models
ModuleLoader.registerRender("Players", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([{ 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Players", () => new Map());
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
            for (const [id, player] of players) {
                if (player.dimension !== renderer.get("Dimension")) {
                    models.delete(id);
                    continue;
                }

                if (!models.has(id)) {
                    const geometry = new BoxGeometry( 0.5, 0.5, 0.5 );
                    const material = new MeshPhongMaterial({
                        color: 0x00ff00
                    });

                    const model = new Mesh(geometry, material);
                    model.castShadow = true;
                    model.receiveShadow = true;

                    models.set(id, model);
                    renderer.scene.add(model);
                }

                const model = models.get(id)!;
                const offset = new Vector3(0, 1, 0);
                model.position.set(player.position.x, player.position.y, player.position.z);
                model.position.add(offset);
                model.setRotationFromQuaternion(new Quaternion(player.rotation.x, player.rotation.y, player.rotation.z, player.rotation.w));
            }

            for (const [id, model] of [...models.entries()]) {
                if (!players.has(id)) {
                    renderer.scene.remove(model);
                    models.delete(id);
                }
            }
        } 
    }, ...renderLoop]);
});