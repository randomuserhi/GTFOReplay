import { Color, CylinderGeometry, Group, Mesh, MeshPhongMaterial, Scene, SphereGeometry } from "three";
import * as BitHelper from "../../replay/bithelper.js";
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

export class SkeletonModel {
    readonly group: Group;
    
    head: Mesh;

    body: Mesh;

    LUArm: Mesh;
    LLArm: Mesh;

    RUArm: Mesh;
    RLArm: Mesh;

    LULeg: Mesh;
    LLLeg: Mesh;
    //LFoot: Mesh;

    RULeg: Mesh;
    RLLeg: Mesh;
    //RFoot: Mesh;

    readonly material: MeshPhongMaterial;

    constructor(color: Color) {
        this.group = new Group;

        this.material = new MeshPhongMaterial({ color });
        this.material.transparent = true;
        this.material.opacity = 0.8;

        const geometry = new CylinderGeometry(1, 1, 1, 10, 10).translate(0, 0.5, 0).rotateX(Math.PI * 0.5);
        
        this.head = new Mesh(new SphereGeometry(0.25, 10, 10), this.material);

        this.body = new Mesh(geometry, this.material);
        this.body.scale.set(0.1, 0.1, 0.1);

        this.LUArm = new Mesh(geometry, this.material);
        this.LUArm.scale.set(0.1, 0.1, 0.1);
        this.LLArm = new Mesh(geometry, this.material);
        this.LLArm.scale.set(0.1, 0.1, 0.1);

        this.RUArm = new Mesh(geometry, this.material);
        this.RUArm.scale.set(0.1, 0.1, 0.1);
        this.RLArm = new Mesh(geometry, this.material);
        this.RLArm.scale.set(0.1, 0.1, 0.1);

        this.LULeg = new Mesh(geometry, this.material);
        this.LULeg.scale.set(0.1, 0.1, 0.1);
        this.LLLeg = new Mesh(geometry, this.material);
        this.LLLeg.scale.set(0.1, 0.1, 0.1);
        //this.LFoot = new Mesh(geometry, this.material);

        this.RULeg = new Mesh(geometry, this.material);
        this.RULeg.scale.set(0.1, 0.1, 0.1);
        this.RLLeg = new Mesh(geometry, this.material);
        this.RLLeg.scale.set(0.1, 0.1, 0.1);
        //this.RFoot = new Mesh(geometry, this.material);

        this.group.add(
            this.head,
            this.body,
            this.LUArm, this.LLArm,
            this.RUArm, this.RLArm,
            this.LULeg, this.LLLeg, 
            this.RULeg, this.RLLeg, 
            //this.LFoot, this.RFoot,
        );
    }

    public update(skeleton: Skeleton) {
        this.head.position.set(skeleton.head.x, skeleton.head.y, skeleton.head.z);
        
        const bodyTop = Pod.Vec.mid(skeleton.LUArm, skeleton.RUArm);
        const bodyBottom = Pod.Vec.mid(skeleton.LULeg, skeleton.RULeg);
        this.body.position.set(bodyTop.x, bodyTop.y, bodyTop.z);
        this.body.lookAt(this.group.position.x + bodyBottom.x, this.group.position.y + bodyBottom.y, this.group.position.z + bodyBottom.z);
        this.body.scale.z = Pod.Vec.dist(bodyTop, bodyBottom);

        this.LUArm.position.set(skeleton.LUArm.x, skeleton.LUArm.y, skeleton.LUArm.z);
        this.LUArm.lookAt(this.group.position.x + skeleton.LLArm.x, this.group.position.y + skeleton.LLArm.y, this.group.position.z + skeleton.LLArm.z);
        this.LUArm.scale.z = Pod.Vec.dist(skeleton.LUArm, skeleton.LLArm);

        this.LLArm.position.set(skeleton.LLArm.x, skeleton.LLArm.y, skeleton.LLArm.z);
        this.LLArm.lookAt(this.group.position.x + skeleton.LHand.x, this.group.position.y + skeleton.LHand.y, this.group.position.z + skeleton.LHand.z);
        this.LLArm.scale.z = Pod.Vec.dist(skeleton.LLArm, skeleton.LHand);

        this.RUArm.position.set(skeleton.RUArm.x, skeleton.RUArm.y, skeleton.RUArm.z);
        this.RUArm.lookAt(this.group.position.x + skeleton.RLArm.x, this.group.position.y + skeleton.RLArm.y, this.group.position.z + skeleton.RLArm.z);
        this.RUArm.scale.z = Pod.Vec.dist(skeleton.RUArm, skeleton.RLArm);

        this.RLArm.position.set(skeleton.RLArm.x, skeleton.RLArm.y, skeleton.RLArm.z);
        this.RLArm.lookAt(this.group.position.x + skeleton.RHand.x, this.group.position.y + skeleton.RHand.y, this.group.position.z + skeleton.RHand.z);
        this.RLArm.scale.z = Pod.Vec.dist(skeleton.RLArm, skeleton.RHand);

        this.LULeg.position.set(skeleton.LULeg.x, skeleton.LULeg.y, skeleton.LULeg.z);
        this.LULeg.lookAt(this.group.position.x + skeleton.LLLeg.x, this.group.position.y + skeleton.LLLeg.y, this.group.position.z + skeleton.LLLeg.z);
        this.LULeg.scale.z = Pod.Vec.dist(skeleton.LULeg, skeleton.LLLeg);

        this.LLLeg.position.set(skeleton.LLLeg.x, skeleton.LLLeg.y, skeleton.LLLeg.z);
        this.LLLeg.lookAt(this.group.position.x + skeleton.LFoot.x, this.group.position.y + skeleton.LFoot.y, this.group.position.z + skeleton.LFoot.z);
        this.LLLeg.scale.z = Pod.Vec.dist(skeleton.LLLeg, skeleton.LFoot);

        this.RULeg.position.set(skeleton.RULeg.x, skeleton.RULeg.y, skeleton.RULeg.z);
        this.RULeg.lookAt(this.group.position.x + skeleton.RLLeg.x, this.group.position.y + skeleton.RLLeg.y, this.group.position.z + skeleton.RLLeg.z);
        this.RULeg.scale.z = Pod.Vec.dist(skeleton.RULeg, skeleton.RLLeg);

        this.RLLeg.position.set(skeleton.RLLeg.x, skeleton.RLLeg.y, skeleton.RLLeg.z);
        this.RLLeg.lookAt(this.group.position.x + skeleton.RFoot.x, this.group.position.y + skeleton.RFoot.y, this.group.position.z + skeleton.RFoot.z);
        this.RLLeg.scale.z = Pod.Vec.dist(skeleton.RLLeg, skeleton.RFoot);
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
}