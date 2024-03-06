import { BoxGeometry, CapsuleGeometry, Group, Mesh, MeshPhongMaterial, Quaternion, Scene } from "three";
import * as BitHelper from "../../replay/bithelper.js";
import { ModuleLoader } from "../../replay/moduleloader.js";
import * as Pod from "../../replay/pod.js";
import { DynamicTransform } from "../replayrecorder.js";

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Enemy": {
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
                    animFlags: number;
                };
                despawn: void;
            };
        }
    
        interface Data {
            "Vanilla.Enemy": Map<number, Enemy>
        }
    }
}

export interface Enemy extends DynamicTransform {
    animFlags: number;
    health: number;
}

ModuleLoader.registerDynamic("Vanilla.Enemy", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicTransform.parseTransform(data);
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
                health: 0 // TODO(randomuserhi) 
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

class EnemyModel {
    readonly group: Group;
    readonly body: Mesh;
    readonly head: Group;
    readonly eyes: Mesh;

    readonly height: number;
    readonly radius: number;

    constructor(animFlags: number) {
        this.group = new Group;

        this.radius = 0.25;
        this.height = 0.6;
        if ((animFlags & AnimFlags.EnemyCrawl) !== 0) {
            this.height = 0.25;
        }

        const material = new MeshPhongMaterial({
            color: 0x00ff00
        });
        material.transparent = true;
        material.opacity = 0.8;

        {
            const geometry = new CapsuleGeometry(this.radius * 1.1, this.height, 10, 10);

            this.body = new Mesh(geometry, material);
            this.body.castShadow = true;
            this.body.receiveShadow = true;
            this.group.add(this.body);
            this.body.position.set(0, this.height / 2 + this.radius * 1.1, 0);
        }

        {
            this.head = new Group();
            this.group.add(this.head);
            this.head.position.set(0, this.height + this.radius * 1.1, 0);
        }

        {
            const geometry = new BoxGeometry(this.radius * 2, this.radius / 2, this.radius * 1.4);

            this.eyes = new Mesh(geometry, material);
            this.eyes.castShadow = true;
            this.eyes.receiveShadow = true;
            this.head.add(this.eyes);
            this.eyes.position.set(0, 0, this.radius * 1.4 / 2);
        }
    }

    public addToScene(scene: Scene) {
        scene.add(this.group);
    }

    public removeFromScene(scene: Scene) {
        scene.remove(this.group);
    }

    public setVisible(visible: boolean) {
        this.group.visible = visible;
    }    

    public setPosition(x: number, y: number, z: number) {
        this.group.position.set(x, y, z);
    }
    public setRotation(x: number, y: number, z: number, w: number) {
        this.head.setRotationFromQuaternion(new Quaternion(x, y, z, w));
    }
}

// TODO(randomuserhi): Proper enemy models + enemy types
ModuleLoader.registerRender("Enemies", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([{ 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Enemies", () => new Map());
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
            for (const [id, enemy] of enemies) {
                if (!models.has(id)) {
                    const model = new EnemyModel(enemy.animFlags);
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.setPosition(enemy.position.x, enemy.position.y, enemy.position.z);
                model.setRotation(enemy.rotation.x, enemy.rotation.y, enemy.rotation.z, enemy.rotation.w);
                model.setVisible(enemy.dimension === renderer.get("Dimension"));
            }

            for (const [id, model] of [...models.entries()]) {
                if (!enemies.has(id)) {
                    model.removeFromScene(renderer.scene);
                    models.delete(id);
                }
            }
        } 
    }, ...renderLoop]);
});