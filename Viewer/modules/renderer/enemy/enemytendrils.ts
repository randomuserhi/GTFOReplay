import { consume } from "@esm/@root/replay/instancing.js";
import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Color, Matrix4, Quaternion, Vector3 } from "@esm/three";
import { upV, zeroV } from "../constants.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Enemy.Tendril": void;
        }
    }
}

const pM = new Matrix4();
const scale = new Vector3(0.02, 0.02, 0.02);
const rot = new Quaternion();
const temp = new Vector3();
const color = new Color();

ModuleLoader.registerRender("Enemy.Tendril", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const tendrils = snapshot.getOrDefault("Vanilla.Enemy.Tendril", () => new Map());
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", () => new Map());
            const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", () => new Map());
            const enemyModels = renderer.getOrDefault("Enemies", () => new Map());
            for (const [_, tendril] of tendrils) {
                const owner = enemies.get(tendril.owner);
                const anim = anims.get(tendril.owner);
                if (anim === undefined || owner === undefined || owner.dimension !== renderer.get("Dimension")) continue;
                if (anim.state !== "StuckInGlue" && anim.state !== "ScoutDetection" && anim.state !== "ScoutScream") continue;
                const enemyModel = enemyModels.get(owner.id);
                if (enemyModel !== undefined && !enemyModel.isVisible()) continue;

                pM.lookAt(temp.copy(tendril.relPos).sub(tendril.sourcePos), zeroV, upV);
                scale.z = Pod.Vec.dist(tendril.sourcePos, tendril.relPos);
                pM.compose(temp.copy(owner.position).add(tendril.sourcePos), rot.setFromRotationMatrix(pM), scale);
                consume("Cylinder.MeshPhong", pM, tendril.detect ? color.set(0xff0000) : color.set(0xffffff));
            }
        } 
    }]);
});

