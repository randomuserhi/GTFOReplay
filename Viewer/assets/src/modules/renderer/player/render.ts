import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Color } from "@esm/three";
import { playerColors } from "../../datablocks/player/player";
import { IdentifierData } from "../../parser/identifier";
import { PlayerModel } from "./model";

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
            const models = renderer.getOrDefault("Players", () => new Map());
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
            const anims = snapshot.getOrDefault("Vanilla.Player.Animation", () => new Map());
            const backpacks = snapshot.getOrDefault("Vanilla.Player.Backpack", () => new Map());
            const stats = snapshot.getOrDefault("Vanilla.Player.Stats", () => new Map());
            for (const [id, player] of players) {
                if (!models.has(id)) {
                    const model = new PlayerModel(new Color(playerColors[player.slot]));
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.setVisible(player.dimension === renderer.get("Dimension"));
                
                const anim = anims.get(id);
                if (anim !== undefined) {
                    model.render(dt, time, camera, database, player, anim, stats.get(id), backpacks.get(id));
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
    const models = renderer.getOrDefault("Players", () => new Map());
    for (const model of models.values()) {
        model.dispose();
    }
});