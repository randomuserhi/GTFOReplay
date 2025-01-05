import { signal } from "@esm/@/rhu/signal.js";
import { DynamicInstanceManager } from "@esm/@root/replay/instancing.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { CapsuleGeometry, Color, ColorRepresentation, CylinderGeometry, Group, Matrix4, Mesh, MeshPhongMaterial, MeshStandardMaterial, Scene, SphereGeometry, Vector3 } from "@esm/three";
import { MineInstanceDatablock } from "../../datablocks/items/mineinstance.js";
import { getPlayerColor } from "../../datablocks/player/player.js";
import { Bezier } from "../../library/bezier.js";
import { zeroQ } from "../../library/constants.js";
import { Factory } from "../../library/factory.js";
import { Identifier } from "../../parser/identifier.js";
import { duration, Mine, MineDetonate } from "../../parser/player/mine.js";
import { ObjectWrapper } from "../objectwrapper.js";

declare module "@esm/@root/replay/moduleloader.js" {
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

    readonly base: Group;
    readonly laser: Mesh;
    
    constructor(playerColor: Color, item: Identifier) {
        this.group = new Group();

        let datablock = MineInstanceDatablock.get(item);
        if (datablock === undefined) {
            datablock = MineInstanceDatablock.obtain(Identifier.unknown);
        }

        const laserMaterial = new MeshStandardMaterial({ color: datablock.laserColor === undefined ? 0xff0000 : datablock.laserColor });
        laserMaterial.transparent = true;
        laserMaterial.opacity = 0.5;
        laserMaterial.depthWrite = false;
        
        this.base = new Group();
        this.group.add(this.base);
        if (datablock.model !== undefined) datablock.model(this.base, playerColor);
        
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
            const models = renderer.getOrDefault("Mine", Factory("Map"));
            const mines = snapshot.getOrDefault("Vanilla.Mine", Factory("Map"));
            const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
            for (const [id, mine] of mines) {
                if (!models.has(id)) {
                    let color: ColorRepresentation = 0xffffff;
                    if (players.has(mine.owner)) color = getPlayerColor(players.get(mine.owner)!.slot);
                    const model = new MineModel(new Color(color), mine.item);
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

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.Mine.ExplosionEffect": void;
        }

        interface RenderData {
            "Vanilla.Mine.ExplosionEffect": ExplosionEffectModel[];
        }
    }
}

const geometry = new SphereGeometry(1, 10, 10);
const material = new MeshPhongMaterial({ color: 0xfc9803 });
const posBezier = Bezier(.18,.67,.49,.91);
const sizeBezier = Bezier(.11,.93,.09,.98);

const particleInstanceManager = new DynamicInstanceManager(geometry, material, 100);

const explosionCapsule = new CapsuleGeometry(2.5, 13.5, 10, 10).translate(0, 6.75, 0).rotateX(Math.PI * 0.5);
const explosionRadiusMaterial = new MeshPhongMaterial({
    color: 0xfc9803,
    transparent: true,
    opacity: 0.5
});

export class ExplosionEffectModel extends ObjectWrapper<Group> {
    static showRadius = signal(false);

    root: Group = new Group();
    range: Mesh;
    
    materials: MeshStandardMaterial[] = [];
    effect: MineDetonate;

    constructor(effect: MineDetonate) {
        super();

        this.range = new Mesh(explosionCapsule, explosionRadiusMaterial);
        this.range.visible = false;
        this.effect = effect;
        this.root.position.copy(this.effect.position);
        this.root.add(this.range);
    }

    private static FUNC_animate = {
        pM: new Matrix4(),
        scale: new Vector3(),
        pos: new Vector3()
    } as const;
    public animate(time: number) {
        this.root.position.copy(this.effect.position);
        this.root.quaternion.copy(this.effect.rotation);

        if (ExplosionEffectModel.showRadius()) {
            this.range.visible = true;
            return;
        }

        const t = (time - this.effect.time) / duration;

        const { pM, scale, pos } = ExplosionEffectModel.FUNC_animate;

        for (const [dir, dist, size] of this.effect.directions) {
            const s = sizeBezier(1 - t) * size;
            particleInstanceManager.consume(pM.compose(pos.copy(dir).multiplyScalar(dist * posBezier(t)).add(this.effect.position), zeroQ, scale.set(s, s, s)));
        }
    }
}

ModuleLoader.registerRender("Vanilla.Mine.ExplosionEffect", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, {
        name, pass: (renderer, snapshot) => {
            const t = snapshot.time();
            const _models: ExplosionEffectModel[] = [];
            const models = renderer.getOrDefault("Vanilla.Mine.ExplosionEffect", Factory("Array"));
            const explosionEffects = snapshot.getOrDefault("Vanilla.Mine.Detonate", Factory("Map"));
            for (const effect of explosionEffects.values()) {
                if (t - effect.time > duration) continue;
                
                const i = _models.length;
                if (models[i] === undefined) {
                    const model = new ExplosionEffectModel(effect);
                    models[i] = model;
                    model.addToScene(renderer.scene);
                }
                const model = models[i];
                model.animate(t);

                _models.push(models[i]);
            }
            for (let i = _models.length; i < models.length; ++i) {
                models[i].removeFromScene(renderer.scene);
            }
            renderer.set("Vanilla.Mine.ExplosionEffect", _models);
        } 
    }]);
});
