import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Group, Mesh, MeshPhongMaterial, Scene } from "@esm/three";
import { Factory } from "../../library/factory.js";
import { loadGLTFGeometry } from "../../library/modelloader.js";
import { Generator } from "../../parser/map/generator.js";
import { ObjectWrapper } from "../objectwrapper.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.Generators": void;
        }

        interface RenderData {
            "Generators": Map<number, GeneratorModel>;
        }
    }
}

const inactive = new MeshPhongMaterial({
    color: 0xc57000
});
inactive.transparent = true;
inactive.opacity = 0.5;
inactive.depthWrite = false;

const active = new MeshPhongMaterial({
    color: 0xc57000
});

class GeneratorModel extends ObjectWrapper<Group> {
    model: Group;
    mesh: Mesh;

    constructor(generator: Generator) {
        super();
        this.root = new Group();

        this.model = new Group();
        this.root.add(this.model);

        this.root.position.copy(generator.position);
        this.root.quaternion.copy(generator.rotation);
    
        loadGLTFGeometry("../js3party/models/generator.glb").then((geometry) => {
            this.mesh = new Mesh(geometry, inactive);
            this.model.add(this.mesh);
        });

        this.model.scale.set(0.43, 0.43, 0.43);
        this.model.position.set(0.016, 0.83, 0.12);
    }

    public addToScene(scene: Scene) {
        scene.add(this.root);
    }

    public setVisible(visible: boolean) {
        this.root.visible = visible;
    }

    public update() {
        if (this.mesh === undefined) return;

        this.mesh.material = active;
    }
}

ModuleLoader.registerRender("Vanilla.Generators", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const generators = snapshot.header.getOrDefault("Vanilla.Map.Generators", Factory("Map"));
            const states = snapshot.getOrDefault("Vanilla.Map.Generators.State", Factory("Map"));
            const models = renderer.getOrDefault("Generators", Factory("Map"));
            for (const [id, generator] of generators.entries()) {
                if (!models.has(id)) {
                    const model = new GeneratorModel(generator);
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                const visible = generator.dimension === renderer.get("Dimension");
                model.setVisible(visible);

                if (visible) {
                    const state = states.get(id);
                    if (state === undefined) continue;

                    model.update();
                }
            }
        } 
    }]);
});