import { Group, Mesh, MeshPhongMaterial, Scene } from "three";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import { Generator, GeneratorState } from "../../parser/map/generator.js";
import { loadGLTF } from "../modeloader.js";

declare module "../../../replay/moduleloader.js" {
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

class GeneratorModel {
    group: Group;
    model: Group;
    mesh: Mesh;

    constructor(generator: Generator) {
        this.group = new Group();

        this.model = new Group();
        this.group.add(this.model);

        this.group.position.copy(generator.position);
        this.group.quaternion.copy(generator.rotation);
    
        loadGLTF("../js3party/models/generator.glb").then((geometry) => {
            this.mesh = new Mesh(geometry, inactive);
            this.model.add(this.mesh);
        });

        this.model.scale.set(0.43, 0.43, 0.43);
        this.model.position.set(0.016, 0.83, 0.12);
    }

    public addToScene(scene: Scene) {
        scene.add(this.group);
    }

    public setVisible(visible: boolean) {
        this.group.visible = visible;
    }

    public update(time: number, generator: GeneratorState) {
        if (this.mesh === undefined) return;

        this.mesh.material = active;

        // TODO(randomuserhi): inputting cell
    }
}

ModuleLoader.registerRender("Vanilla.Generators", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const time = snapshot.time();
            const generators = snapshot.header.getOrDefault("Vanilla.Map.Generators", () => new Map());
            const states = snapshot.getOrDefault("Vanilla.Map.Generators.State", () => new Map());
            const models = renderer.getOrDefault("Generators", () => new Map());
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

                    model.update(time, state);
                }
            }
        } 
    }]);
});