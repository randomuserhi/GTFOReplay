import { Color, Group, Mesh, MeshPhongMaterial, Scene, SphereGeometry } from "three";
import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";
import { DuplicateDynamic, DynamicNotFound, DynamicParse, DynamicPosition, DynamicTransform } from "../../replayrecorder.js";
import { createDeathCross } from "../deathcross.js";
import { Skeleton, SkeletonModel } from "../humanmodel.js";
import { specification } from "../specification.js";
import { Damage } from "../stattracker/damage.js";
import { StatTracker, getPlayerStats, isPlayer } from "../stattracker/stats.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Enemy": {
                parse: DynamicParse;
                spawn: {
                    dimension: number;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                    animFlags: number;
                    hasSkeleton: boolean;
                    type: number;
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
                    active: boolean;
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
            "Vanilla.Enemy.Cache": Map<number, EnemyCache>;
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
    active: boolean;
}

export interface EnemyCache {
    time: number;
    enemy: Enemy;
}

export interface Enemy extends DynamicTransform {
    animFlags: number;
    health: number;
    state: EnemyState;
    head: boolean;
    hasSkeleton: boolean;
    type: number;
    players: Set<bigint>;
    lastHit?: Damage;
    lastHitTime?: number;
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
                animFlags: await BitHelper.readUShort(data),
                hasSkeleton: await BitHelper.readBool(data),
                type: await BitHelper.readUShort(data)
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
        
            if (enemies.has(id)) throw new DuplicateEnemy(`Enemy of id '${id}' already exists.`);
            const datablock = specification.enemies.get(data.type);
            if (datablock === undefined) throw new Error(`Could not find enemy datablock of type '${data.type}'.`);
            enemies.set(id, { 
                id, ...data,
                health: datablock.maxHealth,
                state: "Default",
                head: true,
                players: new Set(),
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            // TODO(randomuserhi): Cleanup code
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
            const cache = snapshot.getOrDefault("Vanilla.Enemy.Cache", () => new Map());

            if (!enemies.has(id)) throw new EnemyNotFound(`Enemy of id '${id}' did not exist.`);
            const enemy = enemies.get(id)!;
            createDeathCross(snapshot, id, enemy.dimension, enemy.position);
            enemies.delete(id);

            // Check kill stats in the event enemy health prediction fails
            if (enemy.health > 0 && enemy.lastHit !== undefined && enemy.lastHitTime !== undefined && 
                snapshot.time() - enemy.lastHitTime <= cacheClearTime) {
                enemy.health = 0;
                // Update kill to last player that hit enemy
                const statTracker = snapshot.getOrDefault("Vanilla.StatTracker", StatTracker);
                const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
                
                let lastHit;
                if (isPlayer(enemy.lastHit.source, players)) {
                    lastHit = players.get(enemy.lastHit.source)!.snet;
                } else if(enemy.lastHit.type === "Explosive") {
                    const detonations = snapshot.getOrDefault("Vanilla.Mine.Detonate", () => new Map());
                    const mines = snapshot.getOrDefault("Vanilla.Mine", () => new Map());

                    const detonation = detonations.get(enemy.lastHit.source);
                    if (detonation === undefined) throw new Error("Explosive damage was dealt, but cannot find detonation event.");

                    const mine = mines.get(enemy.lastHit.source);
                    if (mine === undefined) throw new Error("Explosive damage was dealt, but cannot find mine.");

                    lastHit = mine.snet;
                }
                if (lastHit === undefined) throw new Error(`Could not find player '${enemy.lastHit.source}'.`);
                
                for (const snet of enemy.players) {
                    const sourceStats = getPlayerStats(snet, statTracker);

                    if (snet === lastHit) {
                        if (enemy.lastHit.type === "Explosive") {
                            if (!sourceStats.mineKills.has(enemy.type)) {
                                sourceStats.mineKills.set(enemy.type, 0);
                            }
                            sourceStats.mineKills.set(enemy.type, sourceStats.mineKills.get(enemy.type)! + 1);
                        } else if (enemy.lastHit.sentry) {
                            if (!sourceStats.sentryKills.has(enemy.type)) {
                                sourceStats.sentryKills.set(enemy.type, 0);
                            }
                            sourceStats.sentryKills.set(enemy.type, sourceStats.sentryKills.get(enemy.type)! + 1);
                        } else {
                            if (!sourceStats.kills.has(enemy.type)) {
                                sourceStats.kills.set(enemy.type, 0);
                            }
                            sourceStats.kills.set(enemy.type, sourceStats.kills.get(enemy.type)! + 1);
                        }
                    } else {
                        if (!sourceStats.assists.has(enemy.type)) {
                            sourceStats.assists.set(enemy.type, 0);
                        }
                        sourceStats.assists.set(enemy.type, sourceStats.assists.get(enemy.type)! + 1);
                    }
                }
            }
            
            if (!cache.has(id)) {
                cache.set(id, {
                    time: snapshot.time(),
                    enemy
                });
            }
        }
    }
});

const cacheClearTime = 1000;
ModuleLoader.registerTick((snapshot) => {
    const cache = snapshot.getOrDefault("Vanilla.Enemy.Cache", () => new Map());
    for (const [id, item] of [...cache.entries()]) {
        if (snapshot.time() - item.time > cacheClearTime) {
            if (item.enemy.health > 0) {
                console.warn(`Cache cleared enemy: ${id}[health: ${item.enemy.health}]`);
            }
            cache.delete(id);
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
        if (!enemies.has(id)) return;
        switch(limb) {
        case "Head": enemies.get(id)!.head = false; break;
        }
    }
});

ModuleLoader.registerDynamic("Vanilla.Enemy.LimbCustom", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicPosition.parse(data);
            return {
                ...result,
                active: await BitHelper.readBool(data)
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const limbs = snapshot.getOrDefault("Vanilla.Enemy.LimbCustom", () => new Map());
    
            if (!limbs.has(id)) throw new DynamicNotFound(`Limb of id '${id}' was not found.`);
            const limb = limbs.get(id)!;
            DynamicPosition.lerp(limb, data, lerp);
            limb.active = data.active;
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
                id, ...data, active: true
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

declare module "../../../replay/moduleloader.js" {
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
        this.showHead = enemy.head;

        let color = 0xaa0000;
        switch (enemy.state) {
        case "Stagger": color = 0xffffff; break;
        case "Glue": color = 0x0000ff; break;
        }     
        this.color.setHex(color);
        
        this.group.position.set(enemy.position.x, enemy.position.y, enemy.position.z);
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
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Enemies", () => new Map());
            const flyers = renderer.getOrDefault("Flyers", () => new Map());
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
            const skeletons = snapshot.getOrDefault("Vanilla.Enemy.Model", () => new Map());
            for (const [id, enemy] of enemies) {
                const skeleton = skeletons.get(id);
                // TODO(randomuserhi): Sometimes skeleton is created late
                //                     => I need to check enemy type rather than just checking instance of skeleton
                //                     => Or store when spawning an enemy whether it has a valid skeleton
                if (skeleton !== undefined && enemy.hasSkeleton) {
                    if (!models.has(id)) {
                        const model = new EnemyModel(new Color(0xff0000));
                        models.set(id, model);
                        model.addToScene(renderer.scene);
                    }
    
                    const model: EnemyModel = models.get(id)!;

                    model.morph(enemy);
                    model.update(skeleton);
                    model.setVisible(enemy.dimension === renderer.get("Dimension"));
                } else if (!enemy.hasSkeleton) {
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
                model.mesh.visible = limb.active && limb.dimension === renderer.get("Dimension");
            }

            for (const [id, model] of [...models.entries()]) {
                if (!limbs.has(id)) {
                    renderer.scene.remove(model.mesh);
                    models.delete(id);
                }
            }
        } 
    }]);
});