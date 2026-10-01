import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { getPlayerColor } from "../../datablocks/player/player.js";
import { Factory } from "../../library/factory.js";
import { IdentifierData } from "../../parser/identifier.js";
import { PlayerModel } from "./model.js";
import { FirstPersonModel } from "./first-person.js";
import { isCulled } from "../../library/models/lib.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Players": void;
        }

        interface RenderData {
            "Players": Map<number, PlayerModel>;
            "FirstPerson": FirstPersonModel;
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
            const boosters = snapshot.getOrDefault("Vanilla.Player.Boosters", Factory("Map"));
            let firstPerson = renderer.get("FirstPerson");
            firstPerson?.release();
            for (const [id, player] of players) {
                if (!models.has(id)) {
                    const model = new PlayerModel();
                    model.applySettings({ color: getPlayerColor(player.slot) });
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.firstPerson = id === renderer.get("Controls")?.firstPersonPlayer;
                // The eye-view owner still supplies equipment to the separate
                // hands scene. Other players need neither posing nor drawing
                // outside the current camera's bounds.
                model.setVisible(player.dimension === renderer.get("Dimension") &&
                    (model.firstPerson || !isCulled(player.position, model.cullingRadius, camera)));
                
                const anim = anims.get(id);
                if (anim !== undefined) {
                    model.render(dt, time, camera, database, player, anim, stats.get(id), backpacks.get(id), sentries, ragdolls.get(id), boosters.get(id));
                    // The separate FPS scene borrows the equipment below. Its
                    // world body, backpack and driver hierarchy need no traversal.
                    if (model.firstPerson) model.setVisible(false);
                }
            }

            for (const [id, model] of [...models.entries()]) {
                if (!players.has(id)) {
                    model.removeFromScene(renderer.scene);
                    model.dispose();
                    models.delete(id);
                }
            }
            const followed = renderer.get("Controls")?.firstPersonPlayer;
            const playerModel = followed === undefined ? undefined : models.get(followed);
            const animation = followed === undefined ? undefined : anims.get(followed);
            if (playerModel && animation) {
                if (!firstPerson) {
                    firstPerson = new FirstPersonModel(); renderer.set("FirstPerson",firstPerson);
                }
                const item = playerModel.firstPersonItem;
                firstPerson.render(time,camera.root.aspect,animation,item.model,item.name,item.melee,camera.root.fov);
            }
        } 
    }]);
});

ModuleLoader.registerDispose((renderer) => {
    const firstPerson = renderer.get("FirstPerson");
    firstPerson?.dispose();
    const models = renderer.getOrDefault("Players", Factory("Map"));
    for (const model of models.values()) {
        model.dispose();
    }
});
