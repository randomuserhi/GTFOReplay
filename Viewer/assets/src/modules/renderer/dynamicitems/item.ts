import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { ItemModelDatablock } from "../../datablocks/items/models.js";
import { Factory } from "../../library/factory.js";
import { ItemModel } from "../models/items.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "DynamicItem": void;
        }

        interface RenderData {
            "DynamicItem": Map<number, ItemModel>;
        }
    }
}

ModuleLoader.registerRender("DynamicItem", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("DynamicItem", Factory("Map"));
            const collection = snapshot.getOrDefault("Vanilla.DynamicItem", Factory("Map"));
            for (const [id, item] of collection) {
                if (!models.has(id)) {
                    const model = ItemModelDatablock.get(item.type)?.model();
                    if (model === undefined) continue;
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.root.position.copy(item.position);
                model.root.quaternion.copy(item.rotation);
                model.setVisible(item.dimension === renderer.get("Dimension"));
            }

            for (const [id, model] of [...models.entries()]) {
                if (!collection.has(id)) {
                    model.removeFromScene(renderer.scene);
                    models.delete(id);
                }
            }
        } 
    }]);
});