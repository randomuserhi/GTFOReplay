import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { getPlayerColor } from "../../datablocks/player/player.js";
import { Factory } from "../../library/factory.js";
import { IdentifierData } from "../../parser/identifier.js";
import { PlayerModel } from "./model.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Players": void;
        }

        interface RenderData {
            "Players": Map<number, PlayerModel>;
        }
    }
}

ModuleLoader.registerRender("Players", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot, dt) => {
            const time = snapshot.time();
            const database = IdentifierData(snapshot);
            const camera = renderer.get("Camera")!;
            const models = renderer.getOrDefault("Players", Factory("Map"));
            const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
            const sentries = snapshot.getOrDefault("Vanilla.Sentry", Factory("Map"));
            const anims = snapshot.getOrDefault("Vanilla.Player.Animation", Factory("Map"));
            const backpacks = snapshot.getOrDefault("Vanilla.Player.Backpack", Factory("Map"));
            const stats = snapshot.getOrDefault("Vanilla.Player.Stats", Factory("Map"));
            const ragdolls = snapshot.getOrDefault("RagdollMode.Ragdoll", Factory("Map")); // NOTE(randomuserhi): Integrated into vanilla for ease of implementation
            for (const [id, player] of players) {
                if (!models.has(id)) {
                    const model = new PlayerModel();
                    model.applySettings({ color: getPlayerColor(player.slot) });
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.setVisible(player.dimension === renderer.get("Dimension"));
                
                const anim = anims.get(id);
                if (anim !== undefined) {
                    model.render(dt, time, camera, database, player, anim, stats.get(id), backpacks.get(id), sentries, ragdolls.get(id));
                }
            }

            for (const [id, model] of [...models.entries()]) {
                if (!players.has(id)) {
                    model.removeFromScene(renderer.scene);
                    model.dispose();
                    models.delete(id);
                }
            }
        } 
    }]);
});

ModuleLoader.registerDispose((renderer) => {
    const models = renderer.getOrDefault("Players", Factory("Map"));
    for (const model of models.values()) {
        model.dispose();
    }
});