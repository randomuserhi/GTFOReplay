import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { ItemDatablock } from "../../datablocks/items/item.js";
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
            const mines = renderer.getOrDefault("Mine", Factory("Map"));
            const models = renderer.getOrDefault("DynamicItem", Factory("Map"));
            const collection = snapshot.getOrDefault("Vanilla.DynamicItem", Factory("Map"));
            for (const [id, item] of collection) {
                if (!models.has(id)) {
                    const factory = ItemDatablock.get(item.type)?.model;
                    if (factory === undefined) continue;
                    const model = factory();
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.root.position.copy(item.position);
                model.root.quaternion.copy(item.rotation);
                if (mines.has(item.id))
                    // Special case to not display dynamic items for placed mines
                    model.setVisible(false);
                else
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