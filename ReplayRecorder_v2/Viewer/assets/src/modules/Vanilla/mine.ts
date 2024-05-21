import { BufferGeometry, Color, ColorRepresentation, CylinderGeometry, Group, Material, Mesh, MeshPhongMaterial, MeshStandardMaterial, Object3D, Scene } from "three";
import * as BitHelper from "../../replay/bithelper.js";
import { ModuleLoader } from "../../replay/moduleloader.js";
import * as Pod from "../../replay/pod.js";
import { DynamicTransform } from "../replayrecorder.js";
import { loadGLTF } from "./modeloader.js";

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
                id: number;
                trigger: number;
                shot: boolean;
            };
        }

        interface Data {
            "Vanilla.Mine": Map<number, Mine>
            "Vanilla.Mine.Detonate": Map<number, MineDetonate>
        }
    }
}

export type MineType = 
    "Explosive" |
    "Cfoam" |
    "ConsumableExplosive";
const mineTypemap: MineType[] = [
    "Explosive",
    "Cfoam",
    "ConsumableExplosive"
];

export interface Mine extends DynamicTransform {
    type: MineType;
    owner: number;
    snet: bigint;
    length: number;
}

export interface MineDetonate {
    id: number;
    time: number;
    trigger: number;
    shot: boolean;
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
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
        
            if (mines.has(id)) throw new DuplicateMine(`Mine of id '${id}' already exists.`);
            if (!players.has(data.owner)) throw new Error(`Mine owner, '${data.owner}', does not exist.`);
            const player = players.get(data.owner)!;
            mines.set(id, { id, ...data, snet: player.snet, length: 0 });
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
    exec: async (data, snapshot) => {
        const detonations = snapshot.getOrDefault("Vanilla.Mine.Detonate", () => new Map());
        
        const { id } = data;
        if (detonations.has(id)) throw new DuplicateMine(`Mine Detonation of id '${id}' already exist.`);
        detonations.set(id, { ...data, time: snapshot.time() });
    }
});

// NOTE(randomuserhi): Keep detonation events around for 1 second to watch for explosion damage events that may reference it
const detonateClearTime = 1000;
ModuleLoader.registerTick((snapshot) => {
    const detonations = snapshot.getOrDefault("Vanilla.Mine.Detonate", () => new Map());
    for (const [id, item] of [...detonations.entries()]) {
        if (snapshot.time() - item.time > detonateClearTime) {
            detonations.delete(id);
        }
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

let consumableMineAsset: BufferGeometry | undefined = undefined;
loadGLTF("../js3party/models/Consumables/emine.glb").then((model) => {
    consumableMineAsset = model;
    for (const { parent, material } of waitingConsumable) {
        parent.add(new Mesh(consumableMineAsset, material));
    }
});
const waitingConsumable: { parent: Object3D, material: Material }[] = [];
function getConsumableMineAsset(parent: Object3D, material: Material) {
    if (consumableMineAsset === undefined) {
        waitingConsumable.push({ parent, material });
    } else {
        parent.add(new Mesh(consumableMineAsset, material));
    }
}

let deployableMineAsset: BufferGeometry | undefined = undefined;
loadGLTF("../js3party/models/Consumables/emine.glb").then((model) => {
    deployableMineAsset = model;
    for (const { parent, material } of waitingDeployable) {
        parent.add(new Mesh(deployableMineAsset, material));
    }
});
const waitingDeployable: { parent: Object3D, material: Material }[] = [];
function getDeployableMineAsset(parent: Object3D, material: Material) {
    if (deployableMineAsset === undefined) {
        waitingDeployable.push({ parent, material });
    } else {
        parent.add(new Mesh(deployableMineAsset, material));
    }
}

let cfoamMineAsset: BufferGeometry | undefined = undefined;
loadGLTF("../js3party/models/Consumables/ctrip.glb").then((model) => {
    cfoamMineAsset = model;
    for (const { parent, material } of waitingCfoam) {
        parent.add(new Mesh(cfoamMineAsset, material));
    }
});
const waitingCfoam: { parent: Object3D, material: Material }[] = [];
function getCfoamMineAsset(parent: Object3D, material: Material) {
    if (cfoamMineAsset === undefined) {
        waitingCfoam.push({ parent, material });
    } else {
        parent.add(new Mesh(cfoamMineAsset, material));
    }
}

class MineModel {
    readonly group: Group;

    readonly base: Group;
    readonly laser: Mesh;
    
    constructor(color: Color, type: MineType) {
        this.group = new Group();

        const material = new MeshPhongMaterial({ color });
        
        const laserMaterial = new MeshStandardMaterial({ color });
        laserMaterial.transparent = true;
        laserMaterial.opacity = 0.5;
        
        this.base = new Group();
        this.group.add(this.base);
        switch(type) {
        case "Explosive": getDeployableMineAsset(this.base, material); break;
        case "Cfoam": getCfoamMineAsset(this.base, material); break;
        case "ConsumableExplosive": getConsumableMineAsset(this.base, material); break;
        }
        this.base.scale.set(0.05, 0.05, 0.05);
        this.base.rotateX(90 * Math.deg2rad);
        
        this.laser = new Mesh(cylinder, laserMaterial);
        this.group.add(this.laser);
    }

    public update(mine: Mine) {
        this.group.quaternion.copy(mine.rotation);
        this.group.position.copy(mine.position);

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
                    const model = new MineModel(new Color(color), mine.type);
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