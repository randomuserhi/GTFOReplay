import { Color, Group, Matrix4, Quaternion, Scene, Vector3 } from "three";
import * as BitHelper from "../../replay/bithelper.js";
import { consume } from "../../replay/instancing.js";
import * as Pod from "../../replay/pod.js";
import { ByteStream } from "../../replay/stream.js";

export interface Skeleton {
    head: Pod.Vector;

    LUArm: Pod.Vector;
    LLArm: Pod.Vector;
    LHand: Pod.Vector;

    RUArm: Pod.Vector;
    RLArm: Pod.Vector;
    RHand: Pod.Vector;

    LULeg: Pod.Vector;
    LLLeg: Pod.Vector;
    LFoot: Pod.Vector;

    RULeg: Pod.Vector;
    RLLeg: Pod.Vector;
    RFoot: Pod.Vector;
}

export const zeroQ = new Quaternion();
export const zeroS = new Vector3(1, 1, 1);
export const zeroV = new Vector3(0, 0, 0);
export const upV = new Vector3(0, 1, 0);

export class SkeletonModel {
    readonly group: Group;
    
    color: Color;

    showHead: boolean = true;

    head: number;
    parts: number[];
    points: number[];

    constructor(color: Color) {
        this.group = new Group();

        this.color = color;

        this.parts = new Array(9);
        this.points = new Array(14);
    }

    public update(skeleton: Skeleton) {
        if (!this.group.visible) return;

        const x = this.group.position.x;
        const y = this.group.position.y;
        const z = this.group.position.z;

        const pM = new Matrix4();
        if (this.showHead) this.head = consume("Sphere.MeshPhong", pM.compose(new Vector3(skeleton.head.x, skeleton.head.y, skeleton.head.z).add(this.group.position), zeroQ, new Vector3(0.15, 0.15, 0.15)), this.color);
        else this.head = -1;

        const radius = 0.05;
        const sM = new Vector3(radius, radius, radius);

        let i = 0;
        let j = 0;

        /*this.body = new Matrix4();
        this.LUArm = new Matrix4();
        this.LLArm = new Matrix4();
        this.RUArm = new Matrix4();
        this.RLArm = new Matrix4();
        this.LULeg = new Matrix4();
        this.LLLeg = new Matrix4();
        this.RULeg = new Matrix4();
        this.RLLeg = new Matrix4();*/

        const bodyTop = Pod.Vec.mid(skeleton.LUArm, skeleton.RUArm);
        bodyTop.x += x;
        bodyTop.y += y;
        bodyTop.z += z;

        const bodyBottom = Pod.Vec.mid(skeleton.LULeg, skeleton.RULeg);
        bodyBottom.x += x;
        bodyBottom.y += y;
        bodyBottom.z += z;

        pM.lookAt(new Vector3(bodyBottom.x, bodyBottom.y, bodyBottom.z).sub(bodyTop), zeroV, upV);
        pM.compose(new Vector3(bodyTop.x, bodyTop.y, bodyTop.z), new Quaternion().setFromRotationMatrix(pM), new Vector3(radius, radius, Pod.Vec.dist(bodyTop, bodyBottom)));
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(new Vector3(bodyTop.x, bodyTop.y, bodyTop.z), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(new Vector3(bodyBottom.x, bodyBottom.y, bodyBottom.z), zeroQ, sM), this.color);

        pM.lookAt(new Vector3(skeleton.LLArm.x, skeleton.LLArm.y, skeleton.LLArm.z).sub(skeleton.LUArm), zeroV, upV);
        pM.compose(new Vector3(skeleton.LUArm.x, skeleton.LUArm.y, skeleton.LUArm.z).add(this.group.position), new Quaternion().setFromRotationMatrix(pM), new Vector3(radius, radius, Pod.Vec.dist(skeleton.LUArm, skeleton.LLArm)));
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        pM.lookAt(new Vector3(skeleton.LHand.x, skeleton.LHand.y, skeleton.LHand.z).sub(skeleton.LLArm), zeroV, upV);
        pM.compose(new Vector3(skeleton.LLArm.x, skeleton.LLArm.y, skeleton.LLArm.z).add(this.group.position), new Quaternion().setFromRotationMatrix(pM), new Vector3(radius, radius, Pod.Vec.dist(skeleton.LLArm, skeleton.LHand)));
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(new Vector3(skeleton.LUArm.x, skeleton.LUArm.y, skeleton.LUArm.z).add(this.group.position), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(new Vector3(skeleton.LLArm.x, skeleton.LLArm.y, skeleton.LLArm.z).add(this.group.position), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(new Vector3(skeleton.LHand.x, skeleton.LHand.y, skeleton.LHand.z).add(this.group.position), zeroQ, sM), this.color);

        pM.lookAt(new Vector3(skeleton.RLArm.x, skeleton.RLArm.y, skeleton.RLArm.z).sub(skeleton.RUArm), zeroV, upV);
        pM.compose(new Vector3(skeleton.RUArm.x, skeleton.RUArm.y, skeleton.RUArm.z).add(this.group.position), new Quaternion().setFromRotationMatrix(pM), new Vector3(radius, radius, Pod.Vec.dist(skeleton.RUArm, skeleton.RLArm)));
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        pM.lookAt(new Vector3(skeleton.RHand.x, skeleton.RHand.y, skeleton.RHand.z).sub(skeleton.RLArm), zeroV, upV);
        pM.compose(new Vector3(skeleton.RLArm.x, skeleton.RLArm.y, skeleton.RLArm.z).add(this.group.position), new Quaternion().setFromRotationMatrix(pM), new Vector3(radius, radius, Pod.Vec.dist(skeleton.RLArm, skeleton.RHand)));
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(new Vector3(skeleton.RUArm.x, skeleton.RUArm.y, skeleton.RUArm.z).add(this.group.position), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(new Vector3(skeleton.RLArm.x, skeleton.RLArm.y, skeleton.RLArm.z).add(this.group.position), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(new Vector3(skeleton.RHand.x, skeleton.RHand.y, skeleton.RHand.z).add(this.group.position), zeroQ, sM), this.color);

        pM.lookAt(new Vector3(skeleton.LLLeg.x, skeleton.LLLeg.y, skeleton.LLLeg.z).sub(skeleton.LULeg), zeroV, upV);
        pM.compose(new Vector3(skeleton.LULeg.x, skeleton.LULeg.y, skeleton.LULeg.z).add(this.group.position), new Quaternion().setFromRotationMatrix(pM), new Vector3(radius, radius, Pod.Vec.dist(skeleton.LULeg, skeleton.LLLeg)));
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        pM.lookAt(new Vector3(skeleton.LFoot.x, skeleton.LFoot.y, skeleton.LFoot.z).sub(skeleton.LLLeg), zeroV, upV);
        pM.compose(new Vector3(skeleton.LLLeg.x, skeleton.LLLeg.y, skeleton.LLLeg.z).add(this.group.position), new Quaternion().setFromRotationMatrix(pM), new Vector3(radius, radius, Pod.Vec.dist(skeleton.LLLeg, skeleton.LFoot)));
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(new Vector3(skeleton.LULeg.x, skeleton.LULeg.y, skeleton.LULeg.z).add(this.group.position), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(new Vector3(skeleton.LLLeg.x, skeleton.LLLeg.y, skeleton.LLLeg.z).add(this.group.position), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(new Vector3(skeleton.LFoot.x, skeleton.LFoot.y, skeleton.LFoot.z).add(this.group.position), zeroQ, sM), this.color);

        pM.lookAt(new Vector3(skeleton.RLLeg.x, skeleton.RLLeg.y, skeleton.RLLeg.z).sub(skeleton.RULeg), zeroV, upV);
        pM.compose(new Vector3(skeleton.RULeg.x, skeleton.RULeg.y, skeleton.RULeg.z).add(this.group.position), new Quaternion().setFromRotationMatrix(pM), new Vector3(radius, radius, Pod.Vec.dist(skeleton.RULeg, skeleton.RLLeg)));
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        pM.lookAt(new Vector3(skeleton.RFoot.x, skeleton.RFoot.y, skeleton.RFoot.z).sub(skeleton.RLLeg), zeroV, upV);
        pM.compose(new Vector3(skeleton.RLLeg.x, skeleton.RLLeg.y, skeleton.RLLeg.z).add(this.group.position), new Quaternion().setFromRotationMatrix(pM), new Vector3(radius, radius, Pod.Vec.dist(skeleton.RLLeg, skeleton.RFoot)));
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(new Vector3(skeleton.RULeg.x, skeleton.RULeg.y, skeleton.RULeg.z).add(this.group.position), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(new Vector3(skeleton.RLLeg.x, skeleton.RLLeg.y, skeleton.RLLeg.z).add(this.group.position), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(new Vector3(skeleton.RFoot.x, skeleton.RFoot.y, skeleton.RFoot.z).add(this.group.position), zeroQ, sM), this.color);
    }

    public addToScene(scene: Scene) {
        scene.add(this.group);
    }

    public removeFromScene(scene: Scene) {
        scene.remove(this.group);
    }

    public setVisible(visible: boolean) {
        this.group.visible = visible;
    }
}

export namespace Skeleton {
    export async function parse(data: ByteStream): Promise<Skeleton> {
        return {
            head: await BitHelper.readHalfVector(data),

            LUArm: await BitHelper.readHalfVector(data),
            LLArm: await BitHelper.readHalfVector(data),
            LHand: await BitHelper.readHalfVector(data),

            RUArm: await BitHelper.readHalfVector(data),
            RLArm: await BitHelper.readHalfVector(data),
            RHand: await BitHelper.readHalfVector(data),

            LULeg: await BitHelper.readHalfVector(data),
            LLLeg: await BitHelper.readHalfVector(data),
            LFoot: await BitHelper.readHalfVector(data),

            RULeg: await BitHelper.readHalfVector(data),
            RLLeg: await BitHelper.readHalfVector(data),
            RFoot: await BitHelper.readHalfVector(data)
        };
    }
    export function lerp(skeleton: Skeleton, target: Skeleton, lerp: number) {
        skeleton.head = Pod.Vec.lerp(skeleton.head, target.head, lerp);
        
        skeleton.LUArm = Pod.Vec.lerp(skeleton.LUArm, target.LUArm, lerp);
        skeleton.LLArm = Pod.Vec.lerp(skeleton.LLArm, target.LLArm, lerp);
        skeleton.LHand = Pod.Vec.lerp(skeleton.LHand, target.LHand, lerp);

        skeleton.RUArm = Pod.Vec.lerp(skeleton.RUArm, target.RUArm, lerp);
        skeleton.RLArm = Pod.Vec.lerp(skeleton.RLArm, target.RLArm, lerp);
        skeleton.RHand = Pod.Vec.lerp(skeleton.RHand, target.RHand, lerp);

        skeleton.LULeg = Pod.Vec.lerp(skeleton.LULeg, target.LULeg, lerp);
        skeleton.LLLeg = Pod.Vec.lerp(skeleton.LLLeg, target.LLLeg, lerp);
        skeleton.LFoot= Pod.Vec.lerp(skeleton.LFoot, target.LFoot, lerp);

        skeleton.RULeg = Pod.Vec.lerp(skeleton.RULeg, target.RULeg, lerp);
        skeleton.RLLeg= Pod.Vec.lerp(skeleton.RLLeg, target.RLLeg, lerp);
        skeleton.RFoot = Pod.Vec.lerp(skeleton.RFoot, target.RFoot, lerp);
    }
}