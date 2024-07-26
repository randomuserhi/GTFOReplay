import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Factory } from "../../library/factory.js";
import { loadGLTFGeometry } from "../../library/modelloader.js";
import { DisinfectStation } from "../../parser/map/disinfectstation.js";
import { ObjectWrapper } from "../objectwrapper.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.DisinfectStations": void;
        }

        interface RenderData {
            "DisinfectStations": Map<number, DisinfectStationModel>;
        }
    }
}

const material = new MeshPhongMaterial({
    color: 0xa0c7eb
});

class DisinfectStationModel extends ObjectWrapper<Group> {
    model: Group;
    mesh: Mesh;

    constructor(station: DisinfectStation) {
        super();
        this.root = new Group();

        this.model = new Group();
        this.root.add(this.model);

        this.root.position.copy(station.position);
        this.root.quaternion.copy(station.rotation);
    
        loadGLTFGeometry("../js3party/models/disinfect_station.glb").then((geometry) => {
            this.mesh = new Mesh(geometry, material);
            this.model.add(this.mesh);
        });

        this.model.scale.set(0.4, 0.4, 0.4);
        this.model.position.set(0, 0.6, 0);
    }
}

ModuleLoader.registerRender("Vanilla.DisinfectStations", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const stations = snapshot.header.getOrDefault("Vanilla.Map.DisinfectStations", Factory("Map"));
            const models = renderer.getOrDefault("DisinfectStations", Factory("Map"));
            for (const [id, generator] of stations.entries()) {
                if (!models.has(id)) {
                    const model = new DisinfectStationModel(generator);
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                const visible = generator.dimension === renderer.get("Dimension");
                model.setVisible(visible);
            }
        } 
    }]);
});