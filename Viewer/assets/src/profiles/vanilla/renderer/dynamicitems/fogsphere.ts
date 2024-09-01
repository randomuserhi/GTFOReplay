import { signal } from "@esm/@/rhu/signal.js";
import { consume, createInstance } from "@esm/@root/replay/instancing.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Color, DynamicDrawUsage, Matrix4, MeshPhongMaterial, SphereGeometry, Vector3 } from "@esm/three";
import { zeroQ } from "../../library/constants.js";
import { Factory } from "../../library/factory.js";
import { FogSphere } from "../../parser/dynamicitems/fogsphere.js";

declare module "@esm/@root/replay/instancing.js" {
    interface InstanceTypes {
        "FogSphere.MeshPhong.Mask": void;
        "FogSphere.MeshPhong.Transparent": void;
    } 
}

const geometry = new SphereGeometry(1, 20, 20);

(() => {
    const material = new MeshPhongMaterial();
    material.transparent = true;
    material.opacity = 0.2;
    material.colorWrite = false;

    const mask = createInstance("FogSphere.MeshPhong.Mask", geometry, material, 100);
    mask.mesh.frustumCulled = false;
    mask.mesh.instanceMatrix.setUsage( DynamicDrawUsage );
    mask.mesh.castShadow = false;
    mask.mesh.receiveShadow = true;
    mask.mesh.renderOrder = 3;
})();

(() => {
    const material = new MeshPhongMaterial();
    material.transparent = true;
    material.opacity = 0.2;
    material.colorWrite = true;

    const spheres = createInstance("FogSphere.MeshPhong.Transparent", geometry, material, 100);
    spheres.mesh.frustumCulled = false;
    spheres.mesh.instanceMatrix.setUsage( DynamicDrawUsage );
    spheres.mesh.castShadow = false;
    spheres.mesh.receiveShadow = true;
    spheres.mesh.renderOrder = 4;
})();

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "FogSphere": void;
        }

        interface RenderData {
            "FogSphere": Map<number, FogSphereModel>;
        }
    }
}

const color = new Color(0xffffff);
const scale = new Vector3();
const mat = new Matrix4();
export class FogSphereModel {
    visible: boolean;

    static show = signal(false);

    public update(sphere: FogSphere) {
        if (!this.visible) return;

        scale.set(sphere.range, sphere.range, sphere.range);
        mat.compose(sphere.position, zeroQ, scale);
        consume("FogSphere.MeshPhong.Mask", mat, color);
        consume("FogSphere.MeshPhong.Transparent", mat, color);
    }

    public setVisible(visible: boolean) {
        this.visible = visible;
    }
}

ModuleLoader.registerRender("FogSphere", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const show = FogSphereModel.show();
            if (show === false) return;

            const models = renderer.getOrDefault("FogSphere", Factory("Map"));
            const collection = snapshot.getOrDefault("Vanilla.FogSphere", Factory("Map"));
            for (const [id, sphere] of collection) {
                if (!models.has(id)) {
                    const model = new FogSphereModel();
                    models.set(id, model);
                }

                const model = models.get(id)!;
                model.update(sphere);
                model.setVisible(sphere.dimension === renderer.get("Dimension"));
            }

            for (const [id, model] of [...models.entries()]) {
                if (!collection.has(id)) {
                    models.delete(id);
                }
            }
        } 
    }]);
});