import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Group } from "@esm/three";
import { Factory } from "../../library/factory.js";
import { Spitter, SpitterState } from "../../parser/map/spitters.js";
import { isCulled } from "../../library/models/lib.js";
import { ModelGroup, ObjectWrapper } from "../objectwrapper.js";
import { EnvironmentModel } from "./environment.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.Enemy.Spitters": void;
        }

        interface RenderData {
            "Spitters": Map<number, SpitterModel>;
        }
    }
}

export class SpitterModel extends ObjectWrapper<Group> {
    readonly root = new ModelGroup();
    readonly native = new EnvironmentModel("spitter");

    constructor(readonly spitter: Spitter) {
        super();
        this.root.position.copy(spitter.position);
        this.root.quaternion.copy(spitter.rotation);
        this.root.scale.setScalar(spitter.scale);
        this.root.add(this.native.root);
    }

    update(time: number, state: SpitterState) {
        if (state.appearance) {
            // This is the actual Unity transform scale captured by the Recorder.
            this.root.scale.copy(state.appearance.scale);
            // The portable GLB contains the expanded mesh. Native _Blend uses
            // 0.5 for expanded and 1 for retracted in captured game states.
            const expanded = Math.clamp01((1 - state.appearance.blend) * 2);
            this.native.root.scale.setScalar(0.8 + expanded * 0.2);
            return;
        }

        // Appearance capture is optional when Unity does not expose its
        // property block. Preserve size and approximate state in that case.
        this.root.scale.setScalar(this.spitter.scale);
        const elapsed = Math.clamp01((time - state.lastStateTime) / 500);
        const expanded = state.state === "Woke" ? elapsed : 1 - elapsed;
        this.native.root.scale.setScalar(0.8 + expanded * 0.2);
    }

    dispose() {
        this.native.dispose();
        this.root.removeFromParent();
    }
}

ModuleLoader.registerDispose(renderer => {
    for (const model of renderer.get("Spitters")?.values() ?? []) model.dispose();
});
ModuleLoader.registerRender("Vanilla.Enemy.Spitters", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const time = snapshot.time();
            const spitters = snapshot.header.getOrDefault("Vanilla.Enemy.Spitters", Factory("Map"));
            const states = snapshot.getOrDefault("Vanilla.Enemy.Spitters.State", Factory("Map"));
            const models = renderer.getOrDefault("Spitters", Factory("Map"));
            const camera = renderer.get("Camera")!;
            for (const [id, model] of models) {
                if (!spitters.has(id)) { model.dispose(); models.delete(id); }
            }
            for (const [id, spitter] of spitters.entries()) {
                let model = models.get(id);
                const radius = (model?.native.cullingRadius ?? 3) * spitter.scale;
                const visible = spitter.dimension === renderer.get("Dimension") && !isCulled(spitter.position, radius, camera);
                if (!model && visible) {
                    model = new SpitterModel(spitter);
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }
                if (!model) continue;
                model.setVisible(visible);

                if (visible) {
                    const state = states.get(id);
                    if (state === undefined) continue;

                    model.update(time, state);
                }
            }
        } 
    }]);
});
