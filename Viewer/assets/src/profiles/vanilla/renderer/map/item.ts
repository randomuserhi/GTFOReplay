import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { ItemDatablock } from "../../datablocks/items/item.js";
import { Factory } from "../../library/factory.js";
import { ItemModel } from "../models/items.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.Items": void;
        }

        interface RenderData {
            "Items": Map<number, ItemModel>;
        }
    }
}

ModuleLoader.registerRender("Vanilla.Items", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Items", Factory("Map"));
            const collection = snapshot.getOrDefault("Vanilla.Map.Items", Factory("Map"));
            for (const [id, item] of collection) {
                if (!models.has(id)) {
                    const factory = ItemDatablock.get(item.itemID)?.model;
                    if (factory === undefined) continue;
                    const model = factory();
                    if (model === undefined) continue;
                    model.inLevel();
                    model.addToScene(renderer.scene);
                    models.set(id, model);
                }
                const model = models.get(id)!;
                model.root.position.copy(item.position);
                model.root.quaternion.copy(item.rotation);
                model.setVisible(item.onGround && item.dimension === renderer.get("Dimension"));
            }

            for (const [id, model] of [...models.entries()]) {
                if (!collection.has(id)) {
                    models.delete(id);
                    model.removeFromScene(renderer.scene);
                }
            }
        } 
    }]);
});