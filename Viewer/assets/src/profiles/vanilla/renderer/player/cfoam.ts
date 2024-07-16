import { consume, createInstance } from "@esm/@root/replay/instancing.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Color, DynamicDrawUsage, Matrix4, MeshPhongMaterial, SphereGeometry, Vector3 } from "@esm/three";
import { zeroQ } from "../../library/constants.js";
import { Factory } from "../../library/factory.js";
import { Cfoam } from "../../parser/player/cfoam.js";

declare module "@esm/@root/replay/instancing.js" {
    interface InstanceTypes {
        "Cfoam.Sphere.MeshPhong": void;
    } 
}

(() => {
    const spheres = createInstance("Cfoam.Sphere.MeshPhong", new SphereGeometry(0.4, 10, 10), new MeshPhongMaterial(), 100);
    spheres.mesh.frustumCulled = false;
    spheres.mesh.instanceMatrix.setUsage( DynamicDrawUsage );
    spheres.mesh.castShadow = false;
    spheres.mesh.receiveShadow = true;
})();

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Cfoam": void;
        }

        interface RenderData {
            "Cfoam": Map<number, CfoamModel>;
        }
    }
}

const color = new Color(0xd8f0f2);
const scale = new Vector3();
const mat = new Matrix4();
class CfoamModel {
    visible: boolean;
    
    constructor() {
    }

    public update(cfoam: Cfoam) {
        if (!this.visible) return;

        scale.set(cfoam.scale, cfoam.scale, cfoam.scale);
        mat.compose(cfoam.position, zeroQ, scale);
        consume("Cfoam.Sphere.MeshPhong", mat, color);
    }

    public setVisible(visible: boolean) {
        this.visible = visible;
    }
}

ModuleLoader.registerRender("Cfoam", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Cfoam", Factory("Map"));
            const collection = snapshot.getOrDefault("Vanilla.Cfoam", Factory("Map"));
            for (const [id, cfoam] of collection) {
                if (!models.has(id)) {
                    const model = new CfoamModel();
                    models.set(id, model);
                }

                const model = models.get(id)!;
                model.update(cfoam);
                model.setVisible(cfoam.dimension === renderer.get("Dimension"));
            }

            for (const [id, model] of [...models.entries()]) {
                if (!collection.has(id)) {
                    models.delete(id);
                }
            }
        } 
    }]);
});