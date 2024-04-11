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

// TODO(randomuserhi): move elsewhere
export const zeroQ = new Quaternion();
export const zeroS = new Vector3(1, 1, 1);
export const zeroV = new Vector3(0, 0, 0);
export const upV = new Vector3(0, 1, 0);

const bodyTop = Pod.Vec.zero();
const bodyBottom = Pod.Vec.zero();
const temp = new Vector3();

const head = new Vector3();
const headScale = new Vector3(0.15, 0.15, 0.15);

const rot = new Quaternion();

const radius = 0.05;
const sM = new Vector3(radius, radius, radius);
const scale = new Vector3(radius, radius, radius);

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
        if (this.showHead) this.head = consume("Sphere.MeshPhong", pM.compose(head.copy(skeleton.head).add(this.group.position), zeroQ, headScale), this.color);
        else this.head = -1;

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

        Pod.Vec.mid(bodyTop, skeleton.LUArm, skeleton.RUArm);
        bodyTop.x += x;
        bodyTop.y += y;
        bodyTop.z += z;

        Pod.Vec.mid(bodyBottom, skeleton.LULeg, skeleton.RULeg);
        bodyBottom.x += x;
        bodyBottom.y += y;
        bodyBottom.z += z;

        pM.lookAt(temp.copy(bodyBottom).sub(bodyTop), zeroV, upV);
        scale.z = Pod.Vec.dist(bodyTop, bodyBottom);
        pM.compose(temp.copy(bodyTop), rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(bodyTop, zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(bodyBottom, zeroQ, sM), this.color);

        pM.lookAt(temp.copy(skeleton.LLArm).sub(skeleton.LUArm), zeroV, upV);
        scale.z = Pod.Vec.dist(skeleton.LUArm, skeleton.LLArm);
        pM.compose(temp.copy(skeleton.LUArm).add(this.group.position), rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        pM.lookAt(temp.copy(skeleton.LHand).sub(skeleton.LLArm), zeroV, upV);
        scale.z = Pod.Vec.dist(skeleton.LLArm, skeleton.LHand);
        pM.compose(temp.copy(skeleton.LLArm).add(this.group.position), rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(temp.copy(skeleton.LUArm).add(this.group.position), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(temp.copy(skeleton.LLArm).add(this.group.position), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(temp.copy(skeleton.LHand).add(this.group.position), zeroQ, sM), this.color);

        pM.lookAt(temp.copy(skeleton.RLArm).sub(skeleton.RUArm), zeroV, upV);
        scale.z = Pod.Vec.dist(skeleton.RUArm, skeleton.RLArm);
        pM.compose(temp.copy(skeleton.RUArm).add(this.group.position), rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        pM.lookAt(temp.copy(skeleton.RHand).sub(skeleton.RLArm), zeroV, upV);
        scale.z = Pod.Vec.dist(skeleton.RLArm, skeleton.RHand);
        pM.compose(temp.copy(skeleton.RLArm).add(this.group.position), rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(temp.copy(skeleton.RUArm).add(this.group.position), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(temp.copy(skeleton.RLArm).add(this.group.position), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(temp.copy(skeleton.RHand).add(this.group.position), zeroQ, sM), this.color);

        pM.lookAt(temp.copy(skeleton.LLLeg).sub(skeleton.LULeg), zeroV, upV);
        scale.z = Pod.Vec.dist(skeleton.LULeg, skeleton.LLLeg);
        pM.compose(temp.copy(skeleton.LULeg).add(this.group.position), rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        pM.lookAt(temp.copy(skeleton.LFoot).sub(skeleton.LLLeg), zeroV, upV);
        scale.z = Pod.Vec.dist(skeleton.LLLeg, skeleton.LFoot);
        pM.compose(temp.copy(skeleton.LLLeg).add(this.group.position), rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(temp.copy(skeleton.LULeg).add(this.group.position), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(temp.copy(skeleton.LLLeg).add(this.group.position), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(temp.copy(skeleton.LFoot).add(this.group.position), zeroQ, sM), this.color);

        pM.lookAt(temp.copy(skeleton.RLLeg).sub(skeleton.RULeg), zeroV, upV);
        scale.z = Pod.Vec.dist(skeleton.RULeg, skeleton.RLLeg);
        pM.compose(temp.copy(skeleton.RULeg).add(this.group.position), rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        pM.lookAt(temp.copy(skeleton.RFoot).sub(skeleton.RLLeg), zeroV, upV);
        scale.z = Pod.Vec.dist(skeleton.RLLeg, skeleton.RFoot);
        pM.compose(temp.copy(skeleton.RLLeg).add(this.group.position), rot.setFromRotationMatrix(pM), scale);
        this.parts[i++] = consume("Cylinder.MeshPhong", pM, this.color);

        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(temp.copy(skeleton.RULeg).add(this.group.position), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(temp.copy(skeleton.RLLeg).add(this.group.position), zeroQ, sM), this.color);
        this.points[j++] = consume("Sphere.MeshPhong", pM.compose(temp.copy(skeleton.RFoot).add(this.group.position), zeroQ, sM), this.color);
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
        Pod.Vec.lerp(skeleton.head, skeleton.head, target.head, lerp);
        
        Pod.Vec.lerp(skeleton.LUArm, skeleton.LUArm, target.LUArm, lerp);
        Pod.Vec.lerp(skeleton.LLArm, skeleton.LLArm, target.LLArm, lerp);
        Pod.Vec.lerp(skeleton.LHand, skeleton.LHand, target.LHand, lerp);

        Pod.Vec.lerp(skeleton.RUArm, skeleton.RUArm, target.RUArm, lerp);
        Pod.Vec.lerp(skeleton.RLArm, skeleton.RLArm, target.RLArm, lerp);
        Pod.Vec.lerp(skeleton.RHand, skeleton.RHand, target.RHand, lerp);

        Pod.Vec.lerp(skeleton.LULeg, skeleton.LULeg, target.LULeg, lerp);
        Pod.Vec.lerp(skeleton.LLLeg, skeleton.LLLeg, target.LLLeg, lerp);
        Pod.Vec.lerp(skeleton.LFoot, skeleton.LFoot, target.LFoot, lerp);

        Pod.Vec.lerp(skeleton.RULeg, skeleton.RULeg, target.RULeg, lerp);
        Pod.Vec.lerp(skeleton.RLLeg, skeleton.RLLeg, target.RLLeg, lerp);
        Pod.Vec.lerp(skeleton.RFoot, skeleton.RFoot, target.RFoot, lerp);
    }
}