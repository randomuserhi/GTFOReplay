import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { white } from "../../library/constants.js";
import { Factory } from "../../library/factory.js";
import { loadGLTFGeometry } from "../../library/modelloader.js";
import { BulkheadController } from "../../parser/map/bulkheadcontroller.js";
import { ObjectWrapper } from "../objectwrapper.js";

declare module "@esm/@root/replay/moduleloader.js" {
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
    color: 0x535966
});
material.specular = white;

class BulkheadControllerModel extends ObjectWrapper<Group> {
    model: Group;
    mesh: Mesh;

    constructor(controller: BulkheadController) {
        super();

        this.root = new Group();

        this.model = new Group();
        this.root.add(this.model);

        this.root.position.copy(controller.position);
        this.root.quaternion.copy(controller.rotation);
    
        loadGLTFGeometry("../js3party/models/bulkhead_dc.glb").then((geometry) => {
            this.mesh = new Mesh(geometry, material);
            this.model.add(this.mesh);
        });

        this.model.scale.set(0.5, 0.5, 0.5);
        this.model.position.set(0, 0.8, 0);
    }
}

ModuleLoader.registerRender("Vanilla.BulkheadControllers", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const stations = snapshot.header.getOrDefault("Vanilla.Map.BulkheadControllers", Factory("Map"));
            const models = renderer.getOrDefault("BulkheadControllers", Factory("Map"));
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