import { loadGLTF } from "../../../library/modelloader.js";
import { GearModel } from "../gear.js";

export class HackingTool extends GearModel {
    readonly ready: Promise<void>;

    constructor() {
        super();
        this.ready = loadGLTF("../gear/HackingTool.glb").then(factory => {
            const source = factory();
            this.root.add(source);
            const left = source.getObjectByName("LeftHand"), right = source.getObjectByName("RightHand");
            if (!left || !right) throw new Error("Hacking Tool is missing its native wrist targets.");
            this.leftHandGrip = left.position.clone();
            this.leftHandGripRotation = left.quaternion.clone();
            this.rightHandGrip = { pos: right.position.clone(), rot: right.quaternion.clone() };
        });
    }
}
