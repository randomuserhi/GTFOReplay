import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../library/factory.js";
import { EnvironmentModel, environmentAssetForPrefab } from "./environment.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.Terminals": void;
        }

        interface RenderData {
            "Terminals": Map<number, EnvironmentModel>;
        }
    }
}

ModuleLoader.registerRender("Vanilla.Terminals", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const terminals = snapshot.header.getOrDefault("Vanilla.Map.Terminals", Factory("Map"));
            const models = renderer.getOrDefault("Terminals", Factory("Map"));
            for (const [id, terminal] of terminals.entries()) {
                if (!models.has(id)) {
                    const model = new EnvironmentModel(environmentAssetForPrefab(terminal.modelName) ?? `unregistered-terminal:${terminal.modelName}`, terminal, [.8, 1.6, .6]);
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.setVisible(terminal.dimension === renderer.get("Dimension") && model.inView(renderer.get("Camera")!));
            }
        } 
    }]);
});
