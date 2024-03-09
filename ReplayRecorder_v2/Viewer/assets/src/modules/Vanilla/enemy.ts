import { Color, Group, Mesh, MeshPhongMaterial, Quaternion, Scene, SphereGeometry } from "three";
import * as BitHelper from "../../replay/bithelper.js";
import { ModuleLoader } from "../../replay/moduleloader.js";
import * as Pod from "../../replay/pod.js";
import { DuplicateDynamic, DynamicNotFound, DynamicParse, DynamicPosition, DynamicTransform } from "../replayrecorder.js";
import { Skeleton, SkeletonModel } from "./model.js";

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Enemy": {
                parse: DynamicParse;
                spawn: {
                    dimension: number;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                    animFlags: number;
                };
                despawn: void;
            };

            "Vanilla.Enemy.Model": {
                parse: Skeleton;
                spawn: Skeleton;
                despawn: void;
            };

            "Vanilla.Enemy.LimbCustom": {
                parse: {
                    dimension: number;
                    absolute: boolean;
                    position: Pod.Vector;
                };
                spawn: {
                    dimension: number;
                    position: Pod.Vector;
                    owner: number;
                    scale: number;
                };
                despawn: void;
            };
        }
    
        interface Events {
            "Vanilla.Enemy.State": {
                id: number;
                state: EnemyState;
            }

            "Vanilla.Enemy.LimbDestruction": {
                id: number;
                limb: Limb; 
            };
        }

        interface Data {
            "Vanilla.Enemy": Map<number, Enemy>;
            "Vanilla.Enemy.Model": Map<number, Skeleton>;
            "Vanilla.Enemy.LimbCustom": Map<number, LimbCustom>;
        }
    }
}

type Limb = 
    "Head";
const limbTypemap: Limb[] = [
    "Head"
];

type EnemyState = 
    "Default" |
    "Stagger" |
    "Glue"; 
const enemyStateTypemap: EnemyState[] = [
    "Default",
    "Stagger",
    "Glue"
];

export interface LimbCustom extends DynamicPosition {
    owner: number;
    scale: number;
}

export interface Enemy extends DynamicTransform {
    animFlags: number;
    health: number;
    state: EnemyState;
    head: boolean;
}

ModuleLoader.registerDynamic("Vanilla.Enemy", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicTransform.parse(data);
            return result;
        }, 
        exec: (id, data, snapshot, lerp) => {
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
    
            if (!enemies.has(id)) throw new EnemyNotFound(`Enemy of id '${id}' was not found.`);
            DynamicTransform.lerp(enemies.get(id)!, data, lerp);
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicTransform.parseSpawn(data);
            const result = {
                ...spawn,
                animFlags: await BitHelper.readUShort(data)
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
        
            if (enemies.has(id)) throw new DuplicateEnemy(`Enemy of id '${id}' already exists.`);
            enemies.set(id, { 
                id, ...data,
                health: 0, // TODO(randomuserhi)
                state: "Default",
                head: true
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());

            if (!enemies.has(id)) throw new EnemyNotFound(`Enemy of id '${id}' did not exist.`);
            enemies.delete(id);
        }
    }
});

ModuleLoader.registerDynamic("Vanilla.Enemy.Model", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await Skeleton.parse(data);
            return result;
        }, 
        exec: (id, data, snapshot, lerp) => {
            const skeletons = snapshot.getOrDefault("Vanilla.Enemy.Model", () => new Map());
    
            if (!skeletons.has(id)) throw new DynamicNotFound(`Skeleton of id '${id}' was not found.`);
            Skeleton.lerp(skeletons.get(id)!, data, lerp);
        }
    },
    spawn: {
        parse: async (data) => {
            const result = await Skeleton.parse(data);
            return result;
        },
        exec: (id, data, snapshot) => {
            const skeletons = snapshot.getOrDefault("Vanilla.Enemy.Model", () => new Map());
        
            if (skeletons.has(id)) throw new DuplicateDynamic(`Skeleton of id '${id}' already exists.`);
            skeletons.set(id, data);
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const skeletons = snapshot.getOrDefault("Vanilla.Enemy.Model", () => new Map());

            if (!skeletons.has(id)) throw new DynamicNotFound(`Skeleton of id '${id}' did not exist.`);
            skeletons.delete(id);
        }
    }
});

ModuleLoader.registerEvent("Vanilla.Enemy.LimbDestruction", "0.0.1", {
    parse: async (data) => {
        return {
            id: await BitHelper.readInt(data),
            limb: limbTypemap[await BitHelper.readByte(data)]
        };
    },
    exec: (data, snapshot) => {
        const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());

        const { id, limb } = data;
        if (!enemies.has(id)) throw new EnemyNotFound(`Enemy of id '${id}' did not exist.`);
        switch(limb) {
        case "Head": enemies.get(id)!.head = false; break;
        }
    }
});

ModuleLoader.registerDynamic("Vanilla.Enemy.LimbCustom", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicPosition.parse(data);
            return result;
        }, 
        exec: (id, data, snapshot, lerp) => {
            const limbs = snapshot.getOrDefault("Vanilla.Enemy.LimbCustom", () => new Map());
    
            if (!limbs.has(id)) throw new DynamicNotFound(`Limb of id '${id}' was not found.`);
            DynamicPosition.lerp(limbs.get(id)!, data, lerp);
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicPosition.parseSpawn(data);
            const result = {
                ...spawn,
                owner: await BitHelper.readUShort(data),
                scale: await BitHelper.readHalf(data)
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const limbs = snapshot.getOrDefault("Vanilla.Enemy.LimbCustom", () => new Map());
        
            if (limbs.has(id)) throw new DuplicateDynamic(`Limb of id '${id}' already exists.`);
            limbs.set(id, { 
                id, ...data
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const limbs = snapshot.getOrDefault("Vanilla.Enemy.LimbCustom", () => new Map());

            if (!limbs.has(id)) throw new DynamicNotFound(`Limb of id '${id}' did not exist.`);
            limbs.delete(id);
        }
    }
});

ModuleLoader.registerEvent("Vanilla.Enemy.State", "0.0.1", {
    parse: async (data) => {
        return {
            id: await BitHelper.readInt(data),
            state: enemyStateTypemap[await BitHelper.readByte(data)]
        };
    },
    exec: (data, snapshot) => {
        const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());

        const { id, state } = data;
        if (!enemies.has(id)) throw new EnemyNotFound(`Enemy of id '${id}' did not exist.`);
        enemies.get(id)!.state = state;
    }
});

export class EnemyNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicateEnemy extends Error {
    constructor(message?: string) {
        super(message);
    }
}

// --------------------------- RENDERING ---------------------------

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Enemies": void;
        }

        interface RenderData {
            "Enemies": Map<number, EnemyModel>;
            "Flyers": Map<number, FlyerModel>;
            "Enemy.LimbCustom": Map<number, { mesh: Mesh, material: MeshPhongMaterial }>;
        }
    }
}

export namespace AnimFlags {
    export const Unspecified = 1;
    export const EnemyCripple = 2;
    export const EnemyRunner = 4;
    export const EnemyFiddler = 8;
    export const EnemyLow = 0x10;
    export const EnemyCrawlFlip = 0x20;
    export const EnemyCrawl = 0x40;
    export const EnemyGiant = 0x80;
    export const EnemyBig = 0x100;
    export const EnemyExploder = 0x200;
    export const EnemyBirtherCrawlFlip = 0x400;
    export const EnemyPouncer = 0x800;
}

class EnemyModel extends SkeletonModel {
    public morph(enemy: Enemy): void {
        this.head.visible = enemy.head;

        let color = 0xaa0000;
        switch (enemy.state) {
        case "Stagger": color = 0xffffff; break;
        case "Glue": color = 0x0000ff; break;
        }     
        this.material.color.setHex(color);
        
        this.group.position.set(enemy.position.x, enemy.position.y, enemy.position.z);
        this.head.setRotationFromQuaternion(new Quaternion(enemy.rotation.x, enemy.rotation.y, enemy.rotation.z, enemy.rotation.w));
    }
}

const sphereGeometry = new SphereGeometry(1, 10, 10);

// TODO(randomuserhi)
class FlyerModel {
    readonly group: Group;

    readonly body: Mesh;
    
    constructor(color: Color) {
        this.group = new Group();

        const material = new MeshPhongMaterial({ color });
        
        this.body = new Mesh(sphereGeometry, material);
        this.group.add(this.body);
        this.body.scale.set(0.5, 0.5, 0.5);
    }

    public update(enemy: Enemy) {
        this.group.quaternion.set(enemy.rotation.x, enemy.rotation.y, enemy.rotation.z, enemy.rotation.w);
        this.group.position.set(enemy.position.x, enemy.position.y, enemy.position.z);
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

// TODO(randomuserhi): Proper enemy models + enemy types
ModuleLoader.registerRender("Enemies", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([{ 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Enemies", () => new Map());
            const flyers = renderer.getOrDefault("Flyers", () => new Map());
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
            const skeletons = snapshot.getOrDefault("Vanilla.Enemy.Model", () => new Map());
            for (const [id, enemy] of enemies) {
                const skeleton = skeletons.get(id);
                if (skeleton !== undefined) {
                    if (!models.has(id)) {
                        const model = new EnemyModel(new Color(0xff0000));
                        models.set(id, model);
                        model.addToScene(renderer.scene);
                    }
    
                    const model: EnemyModel = models.get(id)!;

                    model.update(skeleton);
                    model.morph(enemy);
                    model.setVisible(enemy.dimension === renderer.get("Dimension"));
                } else {
                    if (!flyers.has(id)) {
                        const flyer = new FlyerModel(new Color(0xff0000));
                        flyers.set(id, flyer);
                        flyer.addToScene(renderer.scene);
                    }
    
                    const flyer: FlyerModel = flyers.get(id)!;

                    flyer.update(enemy);
                    flyer.setVisible(enemy.dimension === renderer.get("Dimension"));
                }
            }

            for (const [id, model] of [...models.entries()]) {
                if (!enemies.has(id)) {
                    model.removeFromScene(renderer.scene);
                    models.delete(id);
                    skeletons.delete(id);
                }
            }

            for (const [id, flyer] of [...flyers.entries()]) {
                if (!enemies.has(id)) {
                    flyer.removeFromScene(renderer.scene);
                    flyers.delete(id);
                }
            }
        } 
    }, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Enemy.LimbCustom", () => new Map());
            const limbs = snapshot.getOrDefault("Vanilla.Enemy.LimbCustom", () => new Map());
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
            for (const [id, limb] of limbs) {
                const owner = enemies.get(limb.owner);
                if (!models.has(id)) {
                    const material = new MeshPhongMaterial({
                        color: 0xff0000
                    });
                    material.transparent = true;
                    material.opacity = 0.8;
            
                    const geometry = new SphereGeometry(limb.scale, 10, 10);
            
                    const mesh = new Mesh(geometry, material);
                    models.set(id, { mesh, material });
                    renderer.scene.add(mesh);
                }
                const model = models.get(id)!;
                if (owner === undefined) {
                    model.mesh.visible = false;
                    continue;
                }

                let color = 0xff0000;
                switch (owner.state) {
                case "Stagger": color = 0xffffff; break;
                case "Glue": color = 0x0000ff; break;
                }     
                model.material.color.setHex(color);
                model.mesh.position.set(limb.position.x, limb.position.y, limb.position.z);
                model.mesh.visible = limb.dimension === renderer.get("Dimension");
            }

            for (const [id, model] of [...models.entries()]) {
                if (!limbs.has(id)) {
                    renderer.scene.remove(model.mesh);
                    models.delete(id);
                }
            }
        } 
    }, ...renderLoop]);
});