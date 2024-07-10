import { Mesh, MeshPhongMaterial } from "@esm/three";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import { isCulled } from "../../library/models/lib.js";
import { Sphere } from "../../library/models/primitives.js";
import { EnemyModel } from "./lib";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Enemies": void;
        }

        interface RenderData {
            "Enemy.ShowInfo": boolean;
            "Enemies": Map<number, EnemyModel>;
            "Enemy.LimbCustom": Map<number, { mesh: Mesh, material: MeshPhongMaterial }>;
        }
    }
}

ModuleLoader.registerRender("Enemies", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot, dt) => {
            EnemyModel.showInfo = renderer.getOrDefault("Enemy.ShowInfo", () => false);

            const time = snapshot.time();
            const models = renderer.getOrDefault("Enemies", () => new Map());
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
            const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", () => new Map());
            const camera = renderer.get("Camera")!;
            const players = snapshot.getOrDefault("Vanilla.Player.Slots", () => []);
            for (const [id, enemy] of enemies) {
                if (!models.has(id)) {
                    const wrapper = new EnemyModel(enemy);
                    models.set(id, wrapper);
                    wrapper.model.addToScene(renderer.scene);
                }

                const wrapper = models.get(id)!;
                const model = wrapper.model;
                model.setVisible(enemy.dimension === renderer.get("Dimension"));
                
                if (anims.has(id)) {
                    const anim = anims.get(id)!;

                    if (isCulled(enemy.position, anim.state === "ScoutDetection" ? Infinity : 2, camera)) model.setVisible(false);

                    model.render(dt, time, enemy, anim);
                    wrapper.updateTmp(enemy, anim, camera, players);
                }
            }

            for (const [id, wrapper] of [...models.entries()]) {
                if (!enemies.has(id)) {
                    wrapper.model.removeFromScene(renderer.scene);
                    wrapper.dispose();
                    models.delete(id);
                }
            }
        } 
    }, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Enemy.LimbCustom", () => new Map());
            const limbs = snapshot.getOrDefault("Vanilla.Enemy.LimbCustom", () => new Map());
            const skeletons = renderer.getOrDefault("Enemies", () => new Map());
            for (const [id, limb] of limbs) {
                if (!skeletons.has(limb.owner)) continue;
                const skeleton = skeletons.get(limb.owner)!;

                if (!models.has(id)) {
                    const material = new MeshPhongMaterial({
                        color: 0xff0000
                    });
                    material.transparent = true;
                    material.opacity = 0.8;
                    material.depthWrite = false;
        
                    const geometry = Sphere;
        
                    const mesh = new Mesh(geometry, material);
                
                    models.set(id, { mesh, material });
                    renderer.scene.add(mesh);
                }
                const model = models.get(id)!;
                if (!skeleton.model.isVisible()) {
                    model.mesh.visible = false;
                    continue;
                }

                model.mesh.visible = limb.active;

                // TODO(randomuserhi): I should only need to add once on creation... why need to add every frame?
                model.mesh.scale.set(limb.scale, limb.scale, limb.scale);
                model.mesh.quaternion.set(0, 0, 0, 1);
                model.mesh.position.set(limb.offset.x, limb.offset.y, limb.offset.z);
                skeleton.addToLimb(model.mesh, limb.bone);
            }

            for (const [id, model] of [...models.entries()]) {
                if (!limbs.has(id)) {
                    model.mesh.removeFromParent();
                    models.delete(id);
                }
            }
        } 
    }]);
});