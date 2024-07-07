import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Group, Mesh, MeshPhongMaterial, Scene } from "@esm/three";
import { DisinfectStation } from "../../parser/map/disinfectstation.js";
import { loadGLTF } from "../modeloader.js";

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

class DisinfectStationModel {
    group: Group;
    model: Group;
    mesh: Mesh;

    constructor(station: DisinfectStation) {
        this.group = new Group();

        this.model = new Group();
        this.group.add(this.model);

        this.group.position.copy(station.position);
        this.group.quaternion.copy(station.rotation);
    
        loadGLTF("../js3party/models/disinfect_station.glb").then((geometry) => {
            this.mesh = new Mesh(geometry, material);
            this.model.add(this.mesh);
        });

        this.model.scale.set(0.4, 0.4, 0.4);
        this.model.position.set(0, 0.6, 0);
    }

    public addToScene(scene: Scene) {
        scene.add(this.group);
    }

    public setVisible(visible: boolean) {
        this.group.visible = visible;
    }
}

ModuleLoader.registerRender("Vanilla.DisinfectStations", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const stations = snapshot.header.getOrDefault("Vanilla.Map.DisinfectStations", () => new Map());
            const models = renderer.getOrDefault("DisinfectStations", () => new Map());
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