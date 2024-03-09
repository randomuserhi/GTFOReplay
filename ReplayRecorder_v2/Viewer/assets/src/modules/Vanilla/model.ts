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

    points: Mesh[];

    readonly material: MeshPhongMaterial;

    constructor(color: Color) {
        this.group = new Group;
        this.group.castShadow = true;
        this.group.receiveShadow = true;

        this.material = new MeshPhongMaterial({ color });
        //this.material.transparent = true;
        //this.material.opacity = 0.8;

        const geometry = new CylinderGeometry(1, 1, 1, 10, 10).translate(0, 0.5, 0).rotateX(Math.PI * 0.5);

        const radius = 0.05;

        this.head = new Mesh(new SphereGeometry(0.15, 10, 10), this.material);
        this.head.castShadow = true;
        this.head.receiveShadow = true;

        this.body = new Mesh(geometry, this.material);
        this.body.scale.set(radius, radius, radius);
        this.body.castShadow = true;
        this.body.receiveShadow = true;

        this.LUArm = new Mesh(geometry, this.material);
        this.LUArm.scale.set(radius, radius, radius);
        this.LUArm.castShadow = true;
        this.LUArm.receiveShadow = true;

        this.LLArm = new Mesh(geometry, this.material);
        this.LLArm.scale.set(radius, radius, radius);
        this.LLArm.castShadow = true;
        this.LLArm.receiveShadow = true;

        this.RUArm = new Mesh(geometry, this.material);
        this.RUArm.scale.set(radius, radius, radius);
        this.RUArm.castShadow = true;
        this.RUArm.receiveShadow = true;

        this.RLArm = new Mesh(geometry, this.material);
        this.RLArm.scale.set(radius, radius, radius);
        this.RLArm.castShadow = true;
        this.RLArm.receiveShadow = true;

        this.LULeg = new Mesh(geometry, this.material);
        this.LULeg.scale.set(radius, radius, radius);
        this.LULeg.castShadow = true;
        this.LULeg.receiveShadow = true;

        this.LLLeg = new Mesh(geometry, this.material);
        this.LLLeg.scale.set(radius, radius, radius);
        this.LLLeg.castShadow = true;
        this.LLLeg.receiveShadow = true;

        //this.LFoot = new Mesh(geometry, this.material);

        this.RULeg = new Mesh(geometry, this.material);
        this.RULeg.scale.set(radius, radius, radius);
        this.RULeg.castShadow = true;
        this.RULeg.receiveShadow = true;

        this.RLLeg = new Mesh(geometry, this.material);
        this.RLLeg.scale.set(radius, radius, radius);
        this.RLLeg.castShadow = true;
        this.RLLeg.receiveShadow = true;
        
        //this.RFoot = new Mesh(geometry, this.material);
        
        const sphere = new SphereGeometry(radius, 10, 10);
        this.points = new Array(14);
        for (let i = 0; i < this.points.length; ++i) {
            this.points[i] = new Mesh(sphere, this.material);
        }

        this.group.add(
            this.head,
            this.body,
            this.LUArm, this.LLArm,
            this.RUArm, this.RLArm,
            this.LULeg, this.LLLeg, 
            this.RULeg, this.RLLeg, 
            //this.LFoot, this.RFoot,
            ...this.points
        );
    }

    public update(skeleton: Skeleton) {
        this.head.position.set(skeleton.head.x, skeleton.head.y, skeleton.head.z);
        
        const x = this.group.position.x;
        const y = this.group.position.y;
        const z = this.group.position.z;

        let i = 0;

        const bodyTop = Pod.Vec.mid(skeleton.LUArm, skeleton.RUArm);
        const bodyBottom = Pod.Vec.mid(skeleton.LULeg, skeleton.RULeg);
        this.body.position.set(bodyTop.x, bodyTop.y, bodyTop.z);
        this.body.lookAt(x + bodyBottom.x, y + bodyBottom.y, z + bodyBottom.z);
        this.body.scale.z = Pod.Vec.dist(bodyTop, bodyBottom);
        this.points[i++].position.set(bodyTop.x, bodyTop.y, bodyTop.z);
        this.points[i++].position.set(bodyBottom.x, bodyBottom.y, bodyBottom.z);

        this.LUArm.position.set(skeleton.LUArm.x, skeleton.LUArm.y, skeleton.LUArm.z);
        this.LUArm.lookAt(x + skeleton.LLArm.x, y + skeleton.LLArm.y, z + skeleton.LLArm.z);
        this.LUArm.scale.z = Pod.Vec.dist(skeleton.LUArm, skeleton.LLArm);

        this.LLArm.position.set(skeleton.LLArm.x, skeleton.LLArm.y, skeleton.LLArm.z);
        this.LLArm.lookAt(x + skeleton.LHand.x, y + skeleton.LHand.y, z + skeleton.LHand.z);
        this.LLArm.scale.z = Pod.Vec.dist(skeleton.LLArm, skeleton.LHand);

        this.points[i++].position.set(skeleton.LUArm.x, skeleton.LUArm.y, skeleton.LUArm.z);
        this.points[i++].position.set(skeleton.LLArm.x, skeleton.LLArm.y, skeleton.LLArm.z);
        this.points[i++].position.set(skeleton.LHand.x, skeleton.LHand.y, skeleton.LHand.z);

        this.RUArm.position.set(skeleton.RUArm.x, skeleton.RUArm.y, skeleton.RUArm.z);
        this.RUArm.lookAt(x + skeleton.RLArm.x, y + skeleton.RLArm.y, z + skeleton.RLArm.z);
        this.RUArm.scale.z = Pod.Vec.dist(skeleton.RUArm, skeleton.RLArm);

        this.RLArm.position.set(skeleton.RLArm.x, skeleton.RLArm.y, skeleton.RLArm.z);
        this.RLArm.lookAt(x + skeleton.RHand.x, y + skeleton.RHand.y, z + skeleton.RHand.z);
        this.RLArm.scale.z = Pod.Vec.dist(skeleton.RLArm, skeleton.RHand);

        this.points[i++].position.set(skeleton.RUArm.x, skeleton.RUArm.y, skeleton.RUArm.z);
        this.points[i++].position.set(skeleton.RLArm.x, skeleton.RLArm.y, skeleton.RLArm.z);
        this.points[i++].position.set(skeleton.RHand.x, skeleton.RHand.y, skeleton.RHand.z);

        this.LULeg.position.set(skeleton.LULeg.x, skeleton.LULeg.y, skeleton.LULeg.z);
        this.LULeg.lookAt(x + skeleton.LLLeg.x, y + skeleton.LLLeg.y, z + skeleton.LLLeg.z);
        this.LULeg.scale.z = Pod.Vec.dist(skeleton.LULeg, skeleton.LLLeg);

        this.LLLeg.position.set(skeleton.LLLeg.x, skeleton.LLLeg.y, skeleton.LLLeg.z);
        this.LLLeg.lookAt(x + skeleton.LFoot.x, y + skeleton.LFoot.y, z + skeleton.LFoot.z);
        this.LLLeg.scale.z = Pod.Vec.dist(skeleton.LLLeg, skeleton.LFoot);

        this.points[i++].position.set(skeleton.LULeg.x, skeleton.LULeg.y, skeleton.LULeg.z);
        this.points[i++].position.set(skeleton.LLLeg.x, skeleton.LLLeg.y, skeleton.LLLeg.z);
        this.points[i++].position.set(skeleton.LFoot.x, skeleton.LFoot.y, skeleton.LFoot.z);

        this.RULeg.position.set(skeleton.RULeg.x, skeleton.RULeg.y, skeleton.RULeg.z);
        this.RULeg.lookAt(x + skeleton.RLLeg.x, y + skeleton.RLLeg.y, z + skeleton.RLLeg.z);
        this.RULeg.scale.z = Pod.Vec.dist(skeleton.RULeg, skeleton.RLLeg);

        this.RLLeg.position.set(skeleton.RLLeg.x, skeleton.RLLeg.y, skeleton.RLLeg.z);
        this.RLLeg.lookAt(x + skeleton.RFoot.x, y + skeleton.RFoot.y, z + skeleton.RFoot.z);
        this.RLLeg.scale.z = Pod.Vec.dist(skeleton.RLLeg, skeleton.RFoot);

        this.points[i++].position.set(skeleton.RULeg.x, skeleton.RULeg.y, skeleton.RULeg.z);
        this.points[i++].position.set(skeleton.RLLeg.x, skeleton.RLLeg.y, skeleton.RLLeg.z);
        this.points[i++].position.set(skeleton.RFoot.x, skeleton.RFoot.y, skeleton.RFoot.z);
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