import { EnemyDatablock } from "./enemy.js";
import { Identifier } from "../../parser/identifier.js";
import { actorCatalog } from "../../library/actorCatalog.js";
import { HumanoidEnemyModel } from "../../renderer/enemy/models/humanoid.js";
import { FlyerModel } from "../../renderer/enemy/models/flyer.js";

EnemyDatablock.clear();
const health: Record<number, number> = {
  "0": Infinity,
  "11": 30,
  "13": 20,
  "16": 120,
  "18": 150,
  "20": 42,
  "21": 20,
  "24": 20,
  "26": 30,
  "28": 120,
  "29": 1000,
  "30": 30,
  "31": 20,
  "32": 20,
  "33": 150,
  "35": 120,
  "36": 1000,
  "37": 2500,
  "38": 5,
  "39": 120,
  "40": 42,
  "41": 60,
  "42": 16.2,
  "43": 6000,
  "44": 6000,
  "45": 150,
  "46": 225,
  "47": Infinity,
  "48": 5,
  "49": 20,
  "50": 120,
  "51": 30,
  "52": 18,
  "53": 37,
  "54": 42,
  "55": 5000,
  "56": 161,
  "62": 640,
  "63": 5
};
EnemyDatablock.set(Identifier.create("Enemy", 0), { name: "Unknown", maxHealth: Infinity });
for (const actor of actorCatalog.filter(actor => actor.group === "enemies")) {
    for (const id of actor.enemyIds!) {
        EnemyDatablock.set(Identifier.create("Enemy", id), {
            name: actor.name, maxHealth: health[id],
            model: (wrapper, enemy) => {
                if (["flyer", "big-flyer", "squid"].includes(actor.id)) {
                    const model = new FlyerModel(actor.id);
                    model.applySettings({ scale: enemy.scale });
                    return model;
                }
                const model = new HumanoidEnemyModel(wrapper);
                model.applySettings({ scale: enemy.scale, transparent: actor.id.includes("shadow") });
                model.useActor(actor.id);
                return model;
            }
        });
    }
}
