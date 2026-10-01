import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Color, Matrix4, Quaternion, Vector3 } from "@esm/three";
import { upV, zeroV } from "../../library/constants.js";
import { Factory } from "../../library/factory.js";
import { getInstanceOrDefault, parts } from "../models/stickfigure.js";
import { isCulled } from "../../library/models/lib.js";

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
const center = new Vector3();
const color = new Color();

ModuleLoader.registerRender("Enemy.Tendril", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const tendrils = snapshot.getOrDefault("Vanilla.Enemy.Tendril", Factory("Map"));
            const enemies = snapshot.getOrDefault("Vanilla.Enemy", Factory("Map"));
            const anims = snapshot.getOrDefault("Vanilla.Enemy.Animation", Factory("Map"));
            const camera = renderer.get("Camera")!;
            for (const [_, tendril] of tendrils) {
                const owner = enemies.get(tendril.owner);
                const anim = anims.get(tendril.owner);
                if (anim === undefined || owner === undefined || owner.dimension !== renderer.get("Dimension")) continue;
                if (anim.state !== "StuckInGlue" && anim.state !== "ScoutDetection" && anim.state !== "ScoutScream") continue;
                // A feeler can cross the view while its owner is behind the
                // camera. Its recorded endpoints are its own culling bounds.
                scale.z = Pod.Vec.dist(tendril.sourcePos, tendril.relPos);
                center.copy(tendril.sourcePos).add(tendril.relPos).multiplyScalar(.5).add(owner.position);
                if (isCulled(center, scale.z * .5 + .02, camera)) continue;

                pM.lookAt(temp.copy(tendril.relPos).sub(tendril.sourcePos), zeroV, upV);
                pM.compose(temp.copy(owner.position).add(tendril.sourcePos), rot.setFromRotationMatrix(pM), scale);
                
                getInstanceOrDefault(parts, "Tendril", "Tendril").consume(pM, tendril.detect ? color.set(0xff0000) : color.set(0xffffff));
            }
        } 
    }]);
});

