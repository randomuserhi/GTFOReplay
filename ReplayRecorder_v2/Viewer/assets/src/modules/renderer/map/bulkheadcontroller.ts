import { Group, Mesh, MeshPhongMaterial, Scene } from "three";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import { BulkheadController } from "../../parser/map/bulkheadcontroller.js";
import { loadGLTF } from "../modeloader.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.BulkheadControllers": void;
        }

        interface RenderData {
            "BulkheadControllers": Map<number, BulkheadControllerModel>;
        }
    }
}

const material = new MeshPhongMaterial({
    color: 0xffffff
});

class BulkheadControllerModel {
    group: Group;
    model: Group;
    mesh: Mesh;

    constructor(controller: BulkheadController) {
        this.group = new Group();

        this.model = new Group();
        this.group.add(this.model);

        this.group.position.copy(controller.position);
        this.group.quaternion.copy(controller.rotation);
    
        loadGLTF("../js3party/models/bulkhead_dc.glb").then((geometry) => {
            this.mesh = new Mesh(geometry, material);
            this.model.add(this.mesh);
        });
    }

    public addToScene(scene: Scene) {
        scene.add(this.group);
    }

    public setVisible(visible: boolean) {
        this.group.visible = visible;
    }
}

ModuleLoader.registerRender("Vanilla.BulkheadControllers", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const stations = snapshot.header.getOrDefault("Vanilla.Map.BulkheadControllers", () => new Map());
            const models = renderer.getOrDefault("BulkheadControllers", () => new Map());
            for (const [id, controller] of stations.entries()) {
                if (!models.has(id)) {
                    const model = new BulkheadControllerModel(controller);
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                const visible = controller.dimension === renderer.get("Dimension");
                model.setVisible(visible);
            }
        } 
    }]);
});