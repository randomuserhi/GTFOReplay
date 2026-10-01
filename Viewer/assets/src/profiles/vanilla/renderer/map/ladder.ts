import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Group, Vector3 } from "@esm/three";
import { Factory } from "../../library/factory.js";
import { Ladder } from "../../parser/map/ladder.js";
import { ModelGroup, ObjectWrapper } from "../objectwrapper.js";
import { EnvironmentModel } from "./environment.js";
import { isCulled } from "../../library/models/lib.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.Ladders": void;
        }

        interface RenderData {
            "Ladders": LadderModel[];
        }
    }
}

// LG_Ladder starts the body 0.4 m above its base and chooses whole authored
// segments. The recorded climbing top includes 0.6 m above the floor; the
// top platform sits 0.16 m above that floor. Do not stretch rungs or textures.
export function ladderParts(height: number): { asset: string; y: number }[] {
    if (!Number.isFinite(height) || height <= 0) throw new Error("Invalid recorded ladder height.");
    const parts = [{ asset: "ladder-bottom", y: -height }];
    let remaining = height - 0.4;
    while (remaining > 1) {
        const length = remaining > 4 ? 4 : remaining > 2 ? 2 : 1;
        parts.push({ asset: length === 4 ? "ladder" : `ladder-${length}m`, y: -remaining });
        remaining -= length;
    }
    if (height > 3) parts.push({ asset: "ladder-top", y: -0.44 });
    return parts;
}

export class LadderModel extends ObjectWrapper<Group> {
    readonly root = new ModelGroup();
    readonly parts: EnvironmentModel[];
    readonly ready: Promise<void>;
    readonly center: Vector3;
    readonly radius: number;

    constructor(ladder: Ladder) {
        super();
        this.root.position.copy(ladder.top);
        this.root.quaternion.copy(ladder.rotation);
        this.parts = ladderParts(ladder.height).map(({ asset, y }) => {
            const part = new EnvironmentModel(asset);
            part.root.position.y = y;
            this.root.add(part.root);
            return part;
        });
        this.ready = Promise.all(this.parts.map(part => part.ready)).then(() => {});
        this.center = new Vector3(0, -ladder.height / 2, 0).applyQuaternion(this.root.quaternion).add(this.root.position);
        this.radius = Math.hypot(ladder.height / 2 + 1.1, 2);
    }

    dispose() { for (const part of this.parts) part.dispose(); this.root.removeFromParent(); }
}

ModuleLoader.registerRender("Vanilla.Ladders", (name, api) => {
    const initPasses = api.getInitPasses();
    api.setInitPasses([{ 
        name, pass: (renderer, header) => {
            const ladders = header.getOrDefault("Vanilla.Map.Ladders", Factory("Array"));
            const models = renderer.getOrDefault("Ladders", Factory("Array"));
            for (const ladder of ladders) {
                const model = new LadderModel(ladder);
                model.addToScene(renderer.scene);
                models.push(model);
            }
        } 
    }, ...initPasses]);

    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const ladders = snapshot.header.getOrDefault("Vanilla.Map.Ladders", Factory("Array"));
            const models = renderer.getOrDefault("Ladders", Factory("Array"));
            for (let i = 0; i < ladders.length; ++i) {
                models[i].setVisible(ladders[i].dimension === renderer.get("Dimension") && !isCulled(models[i].center, models[i].radius, renderer.get("Camera")!));
            }
        } 
    }]);
});

ModuleLoader.registerDispose(renderer => {
    for (const model of renderer.get("Ladders") ?? []) model.dispose();
});
