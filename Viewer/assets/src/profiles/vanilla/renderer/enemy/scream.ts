import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Group, Mesh, MeshStandardMaterial, TorusGeometry } from "@esm/three";
import { Factory } from "../../library/factory.js";
import { duration, ScreamEffect } from "../../parser/enemy/scream.js";
import { ObjectWrapper } from "../objectwrapper.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.Enemy.ScreamEffect": void;
        }

        interface RenderData {
            "Vanilla.Enemy.ScreamEffect": ScreamEffectModel[];
        }
    }
}

const geometry = new TorusGeometry(10, 0.5, 16, 30).rotateX(90 * Math.deg2rad);

class ScreamEffectModel extends ObjectWrapper<Group> {
    root: Group = new Group();
    
    rings: Mesh[] = [];
    materials: MeshStandardMaterial[] = [];
    effect: ScreamEffect;

    constructor(screamEffect: ScreamEffect) {
        super();

        this.effect = screamEffect;

        for (let i = 0; i < 3; ++i) {
            const material = new MeshStandardMaterial({ color: screamEffect.type === "Regular" ? 0xffffff : 0xff0000 });
            material.transparent = true;
            material.opacity = 1;
            material.depthWrite = false;

            const mesh = new Mesh(geometry, material);
            this.rings.push(mesh);
            this.materials.push(material);

            this.root.add(mesh);
        }

        this.root.position.copy(this.effect.position);
    }

    public animate(time: number) {
        const t = (time - this.effect.time) / duration;

        for (let i = 0; i < this.rings.length; ++i) {
            const ring = this.rings[i];
            const material = this.materials[i];
            
            const _t = (t - 0.1 * i) / (1 - 0.1 * i);
            if (_t < 0) {
                ring.visible = false;
                continue;
            }

            ring.visible = true;
            const scale = 2 * _t;
            ring.scale.set(scale, scale, scale);
            material.opacity = (1 - _t);
        }
    }
}

ModuleLoader.registerRender("Vanilla.Enemy.ScreamEffect", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, {
        name, pass: (renderer, snapshot) => {
            const t = snapshot.time();
            const _models: ScreamEffectModel[] = [];
            const models = renderer.getOrDefault("Vanilla.Enemy.ScreamEffect", Factory("Array"));
            const screamEffects = snapshot.getOrDefault("Vanilla.Enemy.ScreamEffect", Factory("Array"));
            for (const screamEffect of screamEffects) {
                const i = _models.length;
                if (models[i] === undefined) {
                    const model = new ScreamEffectModel(screamEffect);
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
            renderer.set("Vanilla.Enemy.ScreamEffect", _models);
        } 
    }]);
});

