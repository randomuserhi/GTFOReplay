import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { ItemDatablock } from "../../datablocks/items/item.js";
import { Factory } from "../../library/factory.js";
import { createItemModel, ItemModel } from "../models/items.js";
import { isCulled } from "../../library/models/lib.js";

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
        name, pass: (renderer, snapshot, dt) => {
            const mines = renderer.getOrDefault("Mine", Factory("Map"));
            const models = renderer.getOrDefault("Items", Factory("Map"));
            const collection = snapshot.getOrDefault("Vanilla.Map.Items", Factory("Map"));
            for (const [id, item] of collection) {
                // Finder-only entries already have their own terminal/device rendering.
                if (item.itemID.type === "Internal_Finder_Item") continue;
                if (!models.has(id)) {
                    const factory = ItemDatablock.get(item.itemID)?.model;
                    const model = createItemModel(factory, item.itemID.hash);
                    model.inLevel();
                    model.addToScene(renderer.scene);
                    models.set(id, model);
                }
                const model = models.get(id)!;
                model.root.position.copy(item.position);
                model.root.quaternion.copy(item.rotation);
                if (!mines.has(id)) { // Special check to see if the item exists as a deployed mine, if so it does not need to be rendered
                    model.setVisible(item.onGround && item.dimension === renderer.get("Dimension") && !isCulled(item.position, model.cullingRadius, renderer.get("Camera")!));
                } else {
                    model.setVisible(false);
                }
                if (model.isVisible()) model.render(dt, snapshot.time());
            }

            for (const [id, model] of [...models.entries()]) {
                if (!collection.has(id)) {
                    models.delete(id);
                    model.removeFromScene(renderer.scene);
                    model.dispose();
                }
            }
        } 
    }]);
});

ModuleLoader.registerDispose(renderer => {
    for (const model of renderer.get("Items")?.values() ?? []) model.dispose();
});
