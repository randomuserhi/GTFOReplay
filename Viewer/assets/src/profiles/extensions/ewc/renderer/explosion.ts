import { DynamicInstanceManager } from "@esm/@root/replay/instancing.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Group, Matrix4, Mesh, MeshPhongMaterial, MeshStandardMaterial, SphereGeometry, Vector3 } from "@esm/three";
import { Bezier } from "../../../vanilla/library/bezier.js";
import { zeroQ } from "../../../vanilla/library/constants.js";
import { Factory } from "../../../vanilla/library/factory.js";
import { ObjectWrapper } from "../../../vanilla/renderer/objectwrapper.js";
import { ExplosionEffectModel } from "../../../vanilla/renderer/player/mine.js";
import { duration, EWCExplosionEffect } from "../parser/explosion.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "EWC.Explosion.ExplosionEffect": void;
        }

        interface RenderData {
            "EWC.Explosion.ExplosionEffect": EWCExplosionEffectModel[];
        }
    }
}

const geometry = new SphereGeometry(1, 10, 10);
const material = new MeshPhongMaterial({ color: 0xfc9803 });
const posBezier = Bezier(.18,.67,.49,.91);
const sizeBezier = Bezier(.3,.65,.46,.97);

const particleInstanceManager = new DynamicInstanceManager(geometry, material, 100);

const explosionRadiusMaterial = new MeshPhongMaterial({
    color: 0xfc9803,
    transparent: true,
    opacity: 0.5
});

class EWCExplosionEffectModel extends ObjectWrapper<Group> {
    root: Group = new Group();
    range: Mesh;
    
    materials: MeshStandardMaterial[] = [];
    effect: EWCExplosionEffect;

    constructor(effect: EWCExplosionEffect) {
        super();

        this.range = new Mesh(geometry, explosionRadiusMaterial);

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

        if (ExplosionEffectModel.showRadius()) {
            this.range.scale.set(this.effect.radius, this.effect.radius, this.effect.radius);
            this.range.visible = true;
            return;
        }

        this.range.visible = false;

        const t = (time - this.effect.time) / duration;

        const { pM, scale, pos } = EWCExplosionEffectModel.FUNC_animate;

        if (t < 0.4) { 
            const s = this.effect.radius * 0.05 * (t / 0.4);
            particleInstanceManager.consume(pM.compose(this.effect.position, zeroQ, scale.set(s, s, s)));
        }

        for (const [dir, dist, size] of this.effect.directions) {
            const s = sizeBezier(1 - t) * size;
            particleInstanceManager.consume(pM.compose(pos.copy(dir).multiplyScalar(dist * posBezier(t)).add(this.effect.position), zeroQ, scale.set(s, s, s)));
        }
    }
}

ModuleLoader.registerRender("EWC.Explosion.ExplosionEffect", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, {
        name, pass: (renderer, snapshot) => {
            const t = snapshot.time();
            const _models: EWCExplosionEffectModel[] = [];
            const models = renderer.getOrDefault("EWC.Explosion.ExplosionEffect", Factory("Array"));
            const explosionEffects = snapshot.getOrDefault("EWC.Explosion.ExplosionEffect", Factory("Array"));
            for (const effect of explosionEffects) {
                const i = _models.length;
                if (models[i] === undefined) {
                    const model = new EWCExplosionEffectModel(effect);
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
            renderer.set("EWC.Explosion.ExplosionEffect", _models);
        } 
    }]);
});

