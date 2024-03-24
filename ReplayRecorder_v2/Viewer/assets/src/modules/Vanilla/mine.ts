import { Color, ColorRepresentation, CylinderGeometry, Group, Mesh, MeshPhongMaterial, MeshStandardMaterial, Scene } from "three";
import * as BitHelper from "../../replay/bithelper.js";
import { ModuleLoader } from "../../replay/moduleloader.js";
import * as Pod from "../../replay/pod.js";
import { DynamicTransform } from "../replayrecorder.js";

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Mine": {
                parse: {
                    dimension: number; 
                    absolute: boolean;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                    length: number;
                };
                spawn: {
                    dimension: number;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                    type: MineType;
                    owner: number;
                };
                despawn: void;
            };
        }

        interface Events {
            "Vanilla.Mine.Detonate": {
                id: number,
                trigger: number,
                shot: boolean
            };
        }

        interface Data {
            "Vanilla.Mine": Map<number, Mine>
        }
    }
}

export type MineType = 
    "Explosive" |
    "Cfoam";
const mineTypemap: MineType[] = [
    "Explosive",
    "Cfoam"
];

export interface Mine extends DynamicTransform {
    type: MineType;
    owner: number;
    length: number;
}

ModuleLoader.registerDynamic("Vanilla.Mine", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicTransform.parse(data);
            return {
                ...result,
                length: await BitHelper.readHalf(data)
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const mines = snapshot.getOrDefault("Vanilla.Mine", () => new Map());
    
            if (!mines.has(id)) throw new MineNotFound(`Dynamic of id '${id}' was not found.`);
            const mine = mines.get(id)!;
            DynamicTransform.lerp(mine, data, lerp);
            mine.length = data.length;
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicTransform.parseSpawn(data);
            const result = {
                ...spawn,
                type: mineTypemap[await BitHelper.readByte(data)],
                owner: await BitHelper.readUShort(data)
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const mines = snapshot.getOrDefault("Vanilla.Mine", () => new Map());
        
            if (mines.has(id)) throw new DuplicateMine(`Mine of id '${id}' already exists.`);
            mines.set(id, { id, ...data, length: 0 });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const mines = snapshot.getOrDefault("Vanilla.Mine", () => new Map());

            if (!mines.has(id)) throw new MineNotFound(`Mine of id '${id}' did not exist.`);
            mines.delete(id);
        }
    }
});

ModuleLoader.registerEvent("Vanilla.Mine.Detonate", "0.0.1", {
    parse: async (bytes) => {
        return {
            id: await BitHelper.readInt(bytes),
            trigger: await BitHelper.readUShort(bytes),
            shot: await BitHelper.readBool(bytes)
        };
    },
    exec: async () => {
        // TODO(randomuserhi) -> explosion effect?
    }
});

export class MineNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicateMine extends Error {
    constructor(message?: string) {
        super(message);
    }
}

// --------------------------- RENDERING ---------------------------


declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Mine": void;
        }

        interface RenderData {
            "Mine": Map<number, MineModel>;
        }
    }
}

const cylinder = new CylinderGeometry(1, 1, 1, 10, 10).translate(0, 0.5, 0).rotateX(Math.PI * 0.5);

class MineModel {
    readonly group: Group;

    readonly base: Mesh;
    readonly laser: Mesh;
    
    constructor(color: Color) {
        this.group = new Group();

        const material = new MeshPhongMaterial({ color });
        
        const laserMaterial = new MeshStandardMaterial({ color });
        laserMaterial.transparent = true;
        laserMaterial.opacity = 0.5;
        
        this.base = new Mesh(cylinder, material);
        this.group.add(this.base);
        this.base.scale.set(0.1, 0.1, 0.05);
        
        this.laser = new Mesh(cylinder, laserMaterial);
        this.group.add(this.laser);
    }

    public update(mine: Mine) {
        this.group.quaternion.set(mine.rotation.x, mine.rotation.y, mine.rotation.z, mine.rotation.w);
        this.group.position.set(mine.position.x, mine.position.y, mine.position.z);

        this.laser.scale.set(0.03, 0.03, mine.length);
    }

    public setVisible(visible: boolean) {
        this.group.visible = visible;
    }

    public addToScene(scene: Scene) {
        scene.add(this.group);
    }

    public removeFromScene(scene: Scene) {
        scene.remove(this.group);
    }
}

ModuleLoader.registerRender("Mine", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Mine", () => new Map());
            const mines = snapshot.getOrDefault("Vanilla.Mine", () => new Map());
            for (const [id, mine] of mines) {
                if (!models.has(id)) {
                    let color: ColorRepresentation;
                    switch(mine.type) {
                    case "Cfoam": color = 0x0000ff; break;
                    default: color = 0xff0000; break;
                    }
                    const model = new MineModel(new Color(color));
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.update(mine);
                model.setVisible(mine.dimension === renderer.get("Dimension"));
            }

            for (const [id, model] of [...models.entries()]) {
                if (!mines.has(id)) {
                    model.removeFromScene(renderer.scene);
                    models.delete(id);
                }
            }
        } 
    }]);
});