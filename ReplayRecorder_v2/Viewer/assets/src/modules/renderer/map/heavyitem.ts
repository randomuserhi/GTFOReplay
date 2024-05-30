import { ModuleLoader } from "../../../replay/moduleloader.js";
import { Model } from "../Equippable/equippable.js";
import { specification } from "../specification.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.HeavyItems": void;
        }

        interface RenderData {
            "HeavyItems": Map<number, Model>;
        }
    }
}

ModuleLoader.registerRender("Vanilla.HeavyItems", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("HeavyItems", () => new Map());
            const collection = snapshot.getOrDefault("Vanilla.Map.HeavyItem", () => new Map());
            for (const [id, heavyItem] of collection) {
                if (!models.has(id)) {
                    const model = specification.equippable.get(heavyItem.itemID)?.model();
                    if (model === undefined) continue;
                    renderer.scene.add(model.group);
                    models.set(id, model);
                }
                const model = models.get(id)!;
                model.group.position.copy(heavyItem.position);
                model.group.quaternion.copy(heavyItem.rotation);
                model.group.visible = heavyItem.onGround && heavyItem.dimension === renderer.get("Dimension");
            }

            for (const [id, model] of [...models.entries()]) {
                if (!collection.has(id)) {
                    models.delete(id);
                }
            }
        } 
    }]);
});