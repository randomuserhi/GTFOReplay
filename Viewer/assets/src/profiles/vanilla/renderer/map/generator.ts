import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../library/factory.js";
import { Generator, GeneratorState } from "../../parser/map/generator.js";
import { EnvironmentModel } from "./environment.js";

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


class GeneratorModel extends EnvironmentModel {
    constructor(value: Generator) { super("generator", value); }
    update(state?: GeneratorState) {
        const powered = state?.powered === true;
        this.setOpacity(powered ? 1 : 0.5);
        this.setEmissionStrength(powered ? 1 : 0);
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
                const visible = generator.dimension === renderer.get("Dimension") && model.inView(renderer.get("Camera")!);
                model.setVisible(visible);

                if (visible) {
                    const state = states.get(id);
                    model.update(state);
                }
            }
        } 
    }]);
});
