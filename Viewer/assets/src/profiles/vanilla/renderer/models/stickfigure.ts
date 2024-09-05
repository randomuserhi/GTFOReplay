import { DynamicInstanceManager } from "@esm/@root/replay/instancing.js";
import * as Pod from "@esm/@root/replay/pod.js";
import { Color, ColorRepresentation, DynamicDrawUsage, Group, InstancedMesh, Matrix4, MeshPhongMaterial, Object3D, Quaternion, QuaternionLike, Vector3, Vector3Like } from "@esm/three";
import { StickModelDatablock, StickModelType } from "../../datablocks/stickfigure.js";
import { AvatarSkeleton, AvatarStructure, createAvatarStruct } from "../../library/animations/lib.js";
import { upV, zeroQ, zeroV } from "../../library/constants.js";
import { loadGLTFGeometry } from "../../library/modelloader.js";
import { Model } from "../../library/models/lib.js";
import { defaultHumanPose, defaultHumanStructure, HumanJoints, HumanSkeleton } from "../animations/human.js";

const transparentMaskedParts = new Map<StickModelType, DynamicInstanceManager>();
const transparentParts = new Map<StickModelType, DynamicInstanceManager>();
export const parts = new Map<StickModelType, DynamicInstanceManager>(); 

module.destructor = () => {
    for (const instance of transparentMaskedParts.values()) {
        instance.mesh.dispose();
    }
    for (const instance of transparentParts.values()) {
        instance.mesh.dispose();
    }
    for (const instance of parts.values()) {
        instance.mesh.dispose();
    }
};

export function getInstanceOrDefault(instancing: Map<StickModelType, DynamicInstanceManager>, type: StickModelType | undefined, defaultType: StickModelType) {
    let result: DynamicInstanceManager | undefined = undefined;
    if (type === undefined) result = instancing.get(defaultType);
    else result = instancing.get(type);
    if (result === undefined) throw new Error(`Stickfigure part ${type}/${defaultType} does not exist.`);
    return result;
}

const instancedMeshInit = (mesh: InstancedMesh, renderOrder?: number) => {
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage( DynamicDrawUsage );
    mesh.receiveShadow = true;
    if (renderOrder !== undefined) {
        mesh.renderOrder = renderOrder;
    }
};
(() => {
    const material = new MeshPhongMaterial();
    material.transparent = true;
    material.opacity = 0.5;
    material.colorWrite = false;

    const order = 1;
    for (const [key, datablock] of StickModelDatablock.entries()) {
        if (datablock.geometry !== undefined && datablock.path !== undefined) {
            console.error(`Unable to load datablock '${key}' as both geometry and path were provided.`);
        }
        
        if (datablock.geometry !== undefined) {
            transparentMaskedParts.set(key, new DynamicInstanceManager(datablock.geometry, material, 100, (mesh) => instancedMeshInit(mesh, order)));
        } else if (datablock.path !== undefined) {
            loadGLTFGeometry(datablock.path).then((geometry) => transparentMaskedParts.set(key, new DynamicInstanceManager(geometry, material, 100, (mesh) => instancedMeshInit(mesh, order))));
        } else {
            console.error(`Unable to load datablock '${key}' as no geometry or path was provided.`);
        }
    }
})();

(() => {
    const material = new MeshPhongMaterial();
    material.transparent = true;
    material.opacity = 0.5;
    material.colorWrite = true;

    const order = 2;
    for (const [key, datablock] of StickModelDatablock.entries()) {
        if (datablock.geometry !== undefined && datablock.path !== undefined) {
            console.error(`Unable to load datablock '${key}' as both geometry and path were provided.`);
        }
        
        if (datablock.geometry !== undefined) {
            transparentParts.set(key, new DynamicInstanceManager(datablock.geometry, material, 100, (mesh) => instancedMeshInit(mesh, order)));
        } else if (datablock.path !== undefined) {
            loadGLTFGeometry(datablock.path).then((geometry) => transparentParts.set(key, new DynamicInstanceManager(geometry, material, 100, (mesh) => instancedMeshInit(mesh, order))));
        } else {
            console.error(`Unable to load datablock '${key}' as no geometry or path was provided.`);
        }
    }
})();

(() => {
    const material = new MeshPhongMaterial();

    for (const [key, datablock] of StickModelDatablock.entries()) {
        if (datablock.geometry !== undefined && datablock.path !== undefined) {
            console.error(`Unable to load datablock '${key}' as both geometry and path were provided.`);
        }
        
        if (datablock.geometry !== undefined) {
            parts.set(key, new DynamicInstanceManager(datablock.geometry, material, 100, instancedMeshInit));
        } else if (datablock.path !== undefined) {
            loadGLTFGeometry(datablock.path).then((geometry) => parts.set(key, new DynamicInstanceManager(geometry, material, 100, instancedMeshInit)));
        } else {
            console.error(`Unable to load datablock '${key}' as no geometry or path was provided.`);
        }
    }
})();

export interface StickFigureSettings {
    posOffset?: Vector3Like;
    rotOffset?: Vector3Like;

    transparent?: boolean;

    structure?: Partial<AvatarStructure<HumanJoints, Vector3>>;

    points?: StickModelType;
    parts?: Partial<{
        head: { type?: StickModelType };
        body: { scale?: number, type?: StickModelType };
        leftUpperLeg: { scale?: number, type?: StickModelType };
        leftLowerLeg: { scale?: number, type?: StickModelType };
        rightUpperLeg: { scale?: number, type?: StickModelType };
        rightLowerLeg: { scale?: number, type?: StickModelType };
        leftUpperArm: { scale?: number, type?: StickModelType };
        leftLowerArm: { scale?: number, type?: StickModelType };
        rightUpperArm: { scale?: number, type?: StickModelType };
        rightLowerArm: { scale?: number, type?: StickModelType };
    }>;

    defaultPose?: Partial<AvatarStructure<HumanJoints, QuaternionLike>>;

    headScale?: Vector3Like;
    neckScale?: Vector3Like;
    chestScale?: Vector3Like;
    armScale?: Vector3Like;
    legScale?: Vector3Like;

    scale?: number;

    color?: ColorRepresentation;
}

function getWorldPos(worldPos: AvatarStructure<HumanJoints, Vector3>, skeleton: HumanSkeleton): AvatarStructure<HumanJoints, Vector3> {  
    for (const key of skeleton.keys) {
        skeleton.joints[key].getWorldPosition(worldPos[key]);
    }

    return worldPos;
}

function valueOrUndefined(obj: any, value: any): boolean {
    return (obj === undefined || obj === value);
}

export class StickFigure<T extends any[] = []> extends Model<T> {
    private worldPos: AvatarStructure<HumanJoints, Vector3> = createAvatarStruct(HumanJoints, () => new Vector3());

    public skeleton: HumanSkeleton = new AvatarSkeleton(HumanJoints, "hip");
    public visual: HumanSkeleton = new AvatarSkeleton(HumanJoints, "hip");
    private inverseMatrix: AvatarStructure<HumanJoints, Matrix4> = createAvatarStruct(HumanJoints, () => new Matrix4());

    public anchor: Group = new Group();
    protected offset: Group = new Group();

    public color: Color = new Color();

    public settings: StickFigureSettings = {};
    public applySettings(settings?: StickFigureSettings) {
        if (settings !== undefined && this.settings !== settings) {
            for (const key in settings) {
                (this.settings as any)[key] = (settings as any)[key];
            }
        }

        if (this.settings.neckScale !== undefined) {
            this.skeleton.joints.neck.scale.copy(this.settings.neckScale);

            this.visual.joints.neck.scale.copy(this.settings.neckScale);
        }
        if (this.settings.armScale !== undefined) {
            this.skeleton.joints.leftUpperArm.scale.copy(this.settings.armScale);
            this.skeleton.joints.rightUpperArm.scale.copy(this.settings.armScale);

            this.visual.joints.leftUpperArm.scale.copy(this.settings.armScale);
            this.visual.joints.rightUpperArm.scale.copy(this.settings.armScale);
        }
        if (this.settings.legScale !== undefined) {
            this.skeleton.joints.leftUpperLeg.scale.copy(this.settings.legScale);
            this.skeleton.joints.rightUpperLeg.scale.copy(this.settings.legScale);

            this.visual.joints.leftUpperLeg.scale.copy(this.settings.legScale);
            this.visual.joints.rightUpperLeg.scale.copy(this.settings.legScale);
        }
        if (this.settings.chestScale !== undefined) {
            this.skeleton.joints.spine2.scale.copy(this.settings.chestScale);

            this.visual.joints.spine2.scale.copy(this.settings.chestScale);
        }

        if (this.settings.scale !== undefined) this.anchor.scale.set(this.settings.scale, this.settings.scale, this.settings.scale);
        if (this.settings.rotOffset !== undefined) {
            this.anchor.rotateX(Math.deg2rad * this.settings.rotOffset.x);
            this.anchor.rotateY(Math.deg2rad * this.settings.rotOffset.y);
            this.anchor.rotateZ(Math.deg2rad * this.settings.rotOffset.z);
        }

        if (this.settings.structure !== undefined) {
            for (const joint of HumanJoints) {
                const position = this.settings.structure[joint];
                if (position !== undefined) {
                    this.skeleton.joints[joint].position.copy(position);
                    this.visual.joints[joint].position.copy(position);
                }
            }
        }

        if (this.settings.color !== undefined) {
            this.color.set(this.settings.color);
        }

        // Setup default pose before grabbing inverse matrices for tumour attachments
        for (const joint of HumanJoints) {
            const quaternion = this.settings.defaultPose === undefined ? undefined : this.settings.defaultPose[joint];
            if (quaternion !== undefined) {
                this.visual.joints[joint].quaternion.copy(quaternion);
            } else {
                this.visual.joints[joint].quaternion.set(0, 0, 0, 1);   
            }
        }
        for (const joint of HumanJoints) {
            this.visual.joints[joint].updateWorldMatrix(true, true);
            this.inverseMatrix[joint].copy(this.visual.joints[joint].matrixWorld).invert();
        }
    }

    public static construct(skeleton: HumanSkeleton) {
        skeleton.joints.hip.add(
            skeleton.joints.spine0,
            skeleton.joints.leftUpperLeg,
            skeleton.joints.rightUpperLeg
        );
        skeleton.joints.leftUpperLeg.add(skeleton.joints.leftLowerLeg);
        skeleton.joints.leftLowerLeg.add(skeleton.joints.leftFoot!);
        skeleton.joints.rightUpperLeg.add(skeleton.joints.rightLowerLeg);
        skeleton.joints.rightLowerLeg.add(skeleton.joints.rightFoot!);
        skeleton.joints.spine0.add(skeleton.joints.spine1);
        skeleton.joints.spine1.add(skeleton.joints.spine2);
        skeleton.joints.spine2.add(
            skeleton.joints.neck,
            skeleton.joints.leftShoulder,
            skeleton.joints.rightShoulder
        );
        skeleton.joints.leftShoulder.add(skeleton.joints.leftUpperArm);
        skeleton.joints.leftUpperArm.add(skeleton.joints.leftLowerArm);
        skeleton.joints.leftLowerArm.add(skeleton.joints.leftHand!);
        skeleton.joints.rightShoulder.add(skeleton.joints.rightUpperArm);
        skeleton.joints.rightUpperArm.add(skeleton.joints.rightLowerArm);
        skeleton.joints.rightLowerArm.add(skeleton.joints.rightHand!);
        skeleton.joints.neck.add(skeleton.joints.head);
        
        skeleton.setPos(defaultHumanStructure);
        skeleton.setRot(defaultHumanPose);
    }

    // NOTE(randomuserhi): object is positioned at offset from base position if skeleton was in T-pose
    public addToLimb(obj: Object3D, limb: HumanJoints) {
        this.visual.joints[limb].add(obj);
        obj.applyMatrix4(this.inverseMatrix[limb]);
    }

    constructor() {
        super();

        StickFigure.construct(this.skeleton);
        StickFigure.construct(this.visual);
        this.offset.add(this.visual.joints.hip, this.skeleton.joints.hip);
        this.anchor.add(this.offset);
        this.root.add(this.anchor);

        this.applySettings();
    }

    protected smoothFactor = 50;
    protected updateSkeleton(dt: number, position: Vector3Like, rotation: QuaternionLike) {
        this.root.position.copy(position);
        this.anchor.quaternion.copy(rotation);
        if (this.settings.rotOffset !== undefined) {
            this.anchor.rotateY(this.settings.rotOffset.y);
            this.anchor.rotateX(this.settings.rotOffset.x);
            this.anchor.rotateZ(this.settings.rotOffset.z);
        }
        if (this.settings.posOffset !== undefined) {
            this.anchor.position.copy(this.settings.posOffset);
        }

        const blendFactor = Math.clamp01(dt * this.smoothFactor);
        for (const key of HumanJoints) {
            this.visual.joints[key].quaternion.slerp(this.skeleton.joints[key].quaternion, blendFactor);
        }
        this.visual.root.position.lerp(this.skeleton.root.position, blendFactor);
    }

    // NOTE(randomuserhi): requires updateSkeleton to be called prior
    protected draw() {
        this.computeMatrices();

        if (this.settings.transparent) {
            this.drawCall(transparentMaskedParts);
            this.drawCall(transparentParts);
        } else {
            this.drawCall(parts);
        }
    }
    private drawCall(instancing: Map<StickModelType, DynamicInstanceManager>) {
        const { parts, points } = this;

        getInstanceOrDefault(instancing, this.settings.parts?.head?.type, "Sphere").consume(this.head, this.color);

        const point = getInstanceOrDefault(instancing, this.settings.points, "Sphere");

        if (valueOrUndefined(this.settings.parts?.body?.type, "Cylinder")) {
            point.consume(points[0], this.color);
            point.consume(points[1], this.color);
        }

        if (valueOrUndefined(this.settings.parts?.leftUpperArm?.type, "Cylinder")) {
            point.consume(points[2], this.color);
        }
        if (valueOrUndefined(this.settings.parts?.leftUpperArm?.type, "Cylinder") || valueOrUndefined(this.settings.parts?.leftLowerArm?.type , "Cylinder")) {
            point.consume(points[3], this.color);
        }
        if (valueOrUndefined(this.settings.parts?.leftLowerArm?.type, "Cylinder")) {
            point.consume(points[4], this.color);
        }

        if (valueOrUndefined(this.settings.parts?.rightUpperArm?.type, "Cylinder")) {
            point.consume(points[5], this.color);
        }
        if (valueOrUndefined(this.settings.parts?.rightUpperArm?.type , "Cylinder") || valueOrUndefined(this.settings.parts?.rightLowerArm?.type , "Cylinder")) {
            point.consume(points[6], this.color);
        }
        if (valueOrUndefined(this.settings.parts?.rightLowerArm?.type , "Cylinder")) {
            point.consume(points[7], this.color);
        }

        if (valueOrUndefined(this.settings.parts?.leftUpperLeg?.type , "Cylinder")) {
            point.consume(points[8], this.color);
        }
        if (valueOrUndefined(this.settings.parts?.leftUpperLeg?.type , "Cylinder") || valueOrUndefined(this.settings.parts?.leftLowerLeg?.type , "Cylinder")) {
            point.consume(points[9], this.color);
        }
        if (valueOrUndefined(this.settings.parts?.leftLowerLeg?.type , "Cylinder")) {
            point.consume(points[10], this.color);
        }

        if (valueOrUndefined(this.settings.parts?.rightUpperLeg?.type , "Cylinder")) {
            point.consume(points[11], this.color);
        }
        if (valueOrUndefined(this.settings.parts?.rightUpperLeg?.type , "Cylinder") || valueOrUndefined(this.settings.parts?.rightLowerLeg?.type , "Cylinder")) {
            point.consume(points[12], this.color);
        }
        if (valueOrUndefined(this.settings.parts?.rightLowerLeg?.type , "Cylinder")) {
            point.consume(points[13], this.color);
        }
        
        let i = 0;
        getInstanceOrDefault(instancing, this.settings.parts?.body?.type, "Cylinder").consume(parts[i++], this.color);
        getInstanceOrDefault(instancing, this.settings.parts?.leftUpperArm?.type, "Cylinder").consume(parts[i++], this.color);
        getInstanceOrDefault(instancing, this.settings.parts?.leftLowerArm?.type, "Cylinder").consume(parts[i++], this.color);
        getInstanceOrDefault(instancing, this.settings.parts?.rightUpperArm?.type, "Cylinder").consume(parts[i++], this.color);
        getInstanceOrDefault(instancing, this.settings.parts?.rightLowerArm?.type, "Cylinder").consume(parts[i++], this.color);
        getInstanceOrDefault(instancing, this.settings.parts?.leftUpperLeg?.type, "Cylinder").consume(parts[i++], this.color);
        getInstanceOrDefault(instancing, this.settings.parts?.leftLowerLeg?.type, "Cylinder").consume(parts[i++], this.color);
        getInstanceOrDefault(instancing, this.settings.parts?.rightUpperLeg?.type, "Cylinder").consume(parts[i++], this.color);
        getInstanceOrDefault(instancing, this.settings.parts?.rightLowerLeg?.type, "Cylinder").consume(parts[i++], this.color);
    }

    public head: Matrix4 = new Matrix4();
    public neck: Matrix4 = new Matrix4();

    private parts: Matrix4[] = new Array(9).fill(undefined).map(() => new Matrix4());
    private points: Matrix4[] = new Array(14).fill(undefined).map(() => new Matrix4());

    private static FUNC_computeMatrices = {
        headRot: new Quaternion(),
        temp: new Vector3(),
        bodyTop: Pod.Vec.zero(),
        bodyBottom: Pod.Vec.zero(),
        scale: new Vector3(0.05, 0.05, 0.05),
        pscale: new Vector3(),
        rot: new Quaternion(),
    } as const;
    private computeMatrices(): void {
        const { bodyTop, bodyBottom, temp, scale, pscale, rot, headRot } = StickFigure.FUNC_computeMatrices;
        const { parts, points } = this;

        const defaultRadius = 0.05;
        const defaultHeadRadius = 0.15;
        const worldPos = getWorldPos(this.worldPos, this.visual);

        scale.set(defaultHeadRadius, defaultHeadRadius, defaultHeadRadius);
        if (this.settings.headScale !== undefined) scale.multiply(this.settings.headScale);
        this.head.compose(worldPos.head, this.visual.joints.head.getWorldQuaternion(headRot), scale);

        let i = 0;
        let j = 0;
        
        Pod.Vec.copy(bodyTop, worldPos.neck);
        this.neck.setPosition(worldPos.neck);
        
        Pod.Vec.mid(bodyBottom, worldPos.leftUpperLeg, worldPos.rightUpperLeg);
        
        parts[i].lookAt(temp.copy(bodyBottom).sub(bodyTop), zeroV, upV);
        scale.set(defaultRadius, defaultRadius, Pod.Vec.dist(bodyTop, bodyBottom));
        pscale.set(defaultRadius, defaultRadius, defaultRadius);
        if (this.settings.parts?.body?.scale !== undefined) {
            scale.x *= this.settings.parts.body.scale;
            scale.y *= this.settings.parts.body.scale;
            pscale.multiplyScalar(this.settings.parts.body.scale);
        }
        parts[i].compose(temp.copy(bodyTop), rot.setFromRotationMatrix(parts[i]), scale);
        ++i;
        points[j++].compose(bodyTop, zeroQ, pscale);
        points[j++].compose(bodyBottom, zeroQ, pscale);

        parts[i].lookAt(temp.copy(worldPos.leftLowerArm).sub(worldPos.leftUpperArm), zeroV, upV);
        scale.set(defaultRadius, defaultRadius, Pod.Vec.dist(worldPos.leftUpperArm, worldPos.leftLowerArm));
        pscale.set(defaultRadius, defaultRadius, defaultRadius);
        if (this.settings.parts?.leftUpperArm?.scale !== undefined) {
            scale.x *= this.settings.parts.leftUpperArm.scale;
            scale.y *= this.settings.parts.leftUpperArm.scale;
            pscale.multiplyScalar(this.settings.parts.leftUpperArm.scale);
        }
        let maxScale = pscale.x;
        parts[i].compose(worldPos.leftUpperArm, rot.setFromRotationMatrix(parts[i]), scale);
        ++i;

        points[j++].compose(worldPos.leftUpperArm, zeroQ, pscale);

        parts[i].lookAt(temp.copy(worldPos.leftHand!).sub(worldPos.leftLowerArm), zeroV, upV);
        scale.set(defaultRadius, defaultRadius, Pod.Vec.dist(worldPos.leftLowerArm, worldPos.leftHand));
        pscale.set(defaultRadius, defaultRadius, defaultRadius);
        if (this.settings.parts?.leftLowerArm?.scale !== undefined) {
            scale.x *= this.settings.parts.leftLowerArm.scale;
            scale.y *= this.settings.parts.leftLowerArm.scale;
            pscale.multiplyScalar(this.settings.parts.leftLowerArm.scale);
        }
        maxScale = Math.max(pscale.x, maxScale);
        parts[i].compose(worldPos.leftLowerArm, rot.setFromRotationMatrix(parts[i]), scale);
        ++i;

        points[j++].compose(worldPos.leftHand, zeroQ, pscale);

        pscale.set(maxScale, maxScale, maxScale);
        points[j++].compose(worldPos.leftLowerArm, zeroQ, pscale);

        parts[i].lookAt(temp.copy(worldPos.rightLowerArm).sub(worldPos.rightUpperArm), zeroV, upV);
        scale.set(defaultRadius, defaultRadius, Pod.Vec.dist(worldPos.rightUpperArm, worldPos.rightLowerArm));
        pscale.set(defaultRadius, defaultRadius, defaultRadius);
        if (this.settings.parts?.rightUpperArm?.scale !== undefined) {
            scale.x *= this.settings.parts.rightUpperArm.scale;
            scale.y *= this.settings.parts.rightUpperArm.scale;
            pscale.multiplyScalar(this.settings.parts.rightUpperArm.scale);
        }
        maxScale = pscale.x;
        parts[i].compose(worldPos.rightUpperArm, rot.setFromRotationMatrix(parts[i]), scale);
        ++i;

        points[j++].compose(worldPos.rightUpperArm, zeroQ, pscale);

        parts[i].lookAt(temp.copy(worldPos.rightHand!).sub(worldPos.rightLowerArm), zeroV, upV);
        scale.set(defaultRadius, defaultRadius, Pod.Vec.dist(worldPos.rightLowerArm, worldPos.rightHand));
        pscale.set(defaultRadius, defaultRadius, defaultRadius);
        if (this.settings.parts?.rightLowerArm?.scale !== undefined) {
            scale.x *= this.settings.parts.rightLowerArm.scale;
            scale.y *= this.settings.parts.rightLowerArm.scale;
            pscale.multiplyScalar(this.settings.parts.rightLowerArm.scale);
        }
        maxScale = Math.max(pscale.x, maxScale);
        parts[i].compose(worldPos.rightLowerArm, rot.setFromRotationMatrix(parts[i]), scale);
        ++i;

        points[j++].compose(worldPos.rightHand, zeroQ, pscale);

        pscale.set(maxScale, maxScale, maxScale);
        points[j++].compose(worldPos.rightLowerArm, zeroQ, pscale);

        parts[i].lookAt(temp.copy(worldPos.leftLowerLeg).sub(worldPos.leftUpperLeg), zeroV, upV);
        scale.set(defaultRadius, defaultRadius, Pod.Vec.dist(worldPos.leftUpperLeg, worldPos.leftLowerLeg));
        pscale.set(defaultRadius, defaultRadius, defaultRadius);
        if (this.settings.parts?.leftUpperLeg?.scale !== undefined) {
            scale.x *= this.settings.parts.leftUpperLeg.scale;
            scale.y *= this.settings.parts.leftUpperLeg.scale;
            pscale.multiplyScalar(this.settings.parts.leftUpperLeg.scale);
        }
        maxScale = pscale.x;
        parts[i].compose(worldPos.leftUpperLeg, rot.setFromRotationMatrix(parts[i]), scale);
        ++i;

        points[j++].compose(worldPos.leftUpperLeg, zeroQ, pscale);

        parts[i].lookAt(temp.copy(worldPos.leftFoot!).sub(worldPos.leftLowerLeg), zeroV, upV);
        scale.set(defaultRadius, defaultRadius, Pod.Vec.dist(worldPos.leftLowerLeg, worldPos.leftFoot));
        pscale.set(defaultRadius, defaultRadius, defaultRadius);
        if (this.settings.parts?.leftLowerLeg?.scale !== undefined) {
            scale.x *= this.settings.parts.leftLowerLeg.scale;
            scale.y *= this.settings.parts.leftLowerLeg.scale;
            pscale.multiplyScalar(this.settings.parts.leftLowerLeg.scale);
        }
        maxScale = Math.max(pscale.x, maxScale);
        parts[i].compose(worldPos.leftLowerLeg, rot.setFromRotationMatrix(parts[i]), scale);
        ++i;

        points[j++].compose(worldPos.leftFoot, zeroQ, pscale);

        pscale.set(maxScale, maxScale, maxScale);
        points[j++].compose(worldPos.leftLowerLeg, zeroQ, pscale);

        parts[i].lookAt(temp.copy(worldPos.rightLowerLeg).sub(worldPos.rightUpperLeg), zeroV, upV);
        scale.set(defaultRadius, defaultRadius, Pod.Vec.dist(worldPos.rightUpperLeg, worldPos.rightLowerLeg));
        pscale.set(defaultRadius, defaultRadius, defaultRadius);
        if (this.settings.parts?.rightUpperLeg?.scale !== undefined) {
            scale.x *= this.settings.parts.rightUpperLeg.scale;
            scale.y *= this.settings.parts.rightUpperLeg.scale;
            pscale.multiplyScalar(this.settings.parts.rightUpperLeg.scale);
        }
        maxScale = pscale.x;
        parts[i].compose(worldPos.rightUpperLeg, rot.setFromRotationMatrix(parts[i]), scale);
        ++i;

        points[j++].compose(worldPos.rightUpperLeg, zeroQ, pscale);

        parts[i].lookAt(temp.copy(worldPos.rightFoot!).sub(worldPos.rightLowerLeg), zeroV, upV);
        scale.set(defaultRadius, defaultRadius, Pod.Vec.dist(worldPos.rightLowerLeg, worldPos.rightFoot!));
        pscale.set(defaultRadius, defaultRadius, defaultRadius);
        if (this.settings.parts?.rightLowerArm?.scale !== undefined) {
            scale.x *= this.settings.parts.rightLowerArm.scale;
            scale.y *= this.settings.parts.rightLowerArm.scale;
            pscale.multiplyScalar(this.settings.parts.rightLowerArm.scale);
        }
        maxScale = Math.max(pscale.x, maxScale);
        parts[i].compose(worldPos.rightLowerLeg, rot.setFromRotationMatrix(parts[i]), scale);
        ++i;
        points[j++].compose(worldPos.rightFoot, zeroQ, pscale);

        pscale.set(maxScale, maxScale, maxScale);
        points[j++].compose(worldPos.rightLowerLeg, zeroQ, pscale);
    }
}