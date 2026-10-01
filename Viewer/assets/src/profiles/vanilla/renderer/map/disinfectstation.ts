import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Factory } from "../../library/factory.js";
import { EnvironmentModel } from "./environment.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.DisinfectStations": void;
        }

        interface RenderData {
            "DisinfectStations": Map<number, EnvironmentModel>;
        }
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
                    const model = new EnvironmentModel("disinfect-station", generator);
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                const visible = generator.dimension === renderer.get("Dimension") && model.inView(renderer.get("Camera")!);
                model.setVisible(visible);
            }
        } 
    }]);
});
