import { ModuleLoader } from "../../../replay/moduleloader.js";
import { Model } from "../Equippable/equippable.js";
import { specification } from "../specification.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.Items": void;
        }

        interface RenderData {
            "Items": Map<number, Model>;
        }
    }
}

ModuleLoader.registerRender("Vanilla.Items", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Items", () => new Map());
            const collection = snapshot.getOrDefault("Vanilla.Map.Items", () => new Map());
            for (const [id, item] of collection) {
                if (!models.has(id)) {
                    const model = specification.equippable.get(item.itemID)?.model();
                    if (model === undefined) continue;
                    model.inLevel();
                    renderer.scene.add(model.group);
                    models.set(id, model);
                }
                const model = models.get(id)!;
                model.group.position.copy(item.position);
                model.group.quaternion.copy(item.rotation);
                model.group.visible = item.onGround && item.dimension === renderer.get("Dimension");
            }

            for (const [id, model] of [...models.entries()]) {
                if (!collection.has(id)) {
                    models.delete(id);
                }
            }
        } 
    }]);
});