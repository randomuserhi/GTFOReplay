import { Bone, Matrix4, Object3D, SkinnedMesh, Vector3 } from "three";

export const actorBoneNames = {
    Hip: "hip", Hips: "hip", Spine: "spine0", Chest: "spine2",
    Spine1: "spine0", Spine2: "spine1", Spine3: "spine2", Neck: "neck", Head: "head",
    LeftShoulder: "leftShoulder", LeftUpperArm: "leftUpperArm", LeftLowerArm: "leftLowerArm", LeftHand: "leftHand",
    RightShoulder: "rightShoulder", RightUpperArm: "rightUpperArm", RightLowerArm: "rightLowerArm", RightHand: "rightHand",
    LeftUpperLeg: "leftUpperLeg", LeftLowerLeg: "leftLowerLeg", LeftFoot: "leftFoot",
    RightUpperLeg: "rightUpperLeg", RightLowerLeg: "rightLowerLeg", RightFoot: "rightFoot",
    LeftThumb1: "leftThumb1", LeftThumb2: "leftThumb2", LeftThumb3: "leftThumb3",
    LeftIndex1: "leftIndex1", LeftIndex2: "leftIndex2", LeftIndex3: "leftIndex3",
    LeftMiddle1: "leftMiddle1", LeftMiddle2: "leftMiddle2", LeftMiddle3: "leftMiddle3",
    LeftRing1: "leftRing1", LeftRing2: "leftRing2", LeftRing3: "leftRing3",
    LeftPinky1: "leftPinky1", LeftPinky2: "leftPinky2", LeftPinky3: "leftPinky3",
    RightThumb1: "rightThumb1", RightThumb2: "rightThumb2", RightThumb3: "rightThumb3",
    RightIndex1: "rightIndex1", RightIndex2: "rightIndex2", RightIndex3: "rightIndex3",
    RightMiddle1: "rightMiddle1", RightMiddle2: "rightMiddle2", RightMiddle3: "rightMiddle3",
    RightRing1: "rightRing1", RightRing2: "rightRing2", RightRing3: "rightRing3",
    RightPinky1: "rightPinky1", RightPinky2: "rightPinky2", RightPinky3: "rightPinky3"
} as const;
export type ActorJoint = typeof actorBoneNames[keyof typeof actorBoneNames];

export function actorJoint(name: string): ActorJoint | undefined {
    // Blender and GLTFLoader both suffix duplicate names. Clothing pieces have
    // independent skeletons, including partial rigs rooted at the forearm.
    const canonical = name.replace(/(?:[._]\d+)+$/, "").replace(/_Roll\d*$/, "");
    return actorBoneNames[canonical as keyof typeof actorBoneNames];
}

export class ActorRig {
    readonly bones: { bone: Bone; joint: ActorJoint; rest: Matrix4 }[] = [];
    private joints = new Map<ActorJoint, {
        rest: Matrix4; inverseRest: Matrix4; world: Matrix4; delta: Matrix4;
        parent?: ActorJoint; offset: Vector3; depth: number;
    }>();
    private inverse = new Matrix4();
    private desired = new Matrix4();
    private position = new Vector3();
    private hidden = new Vector3(.0001, .0001, .0001);
    private readonly hierarchy: {object: Object3D; driven?: ActorRig["bones"][number]}[] = [];

    constructor(private root: Object3D) {
        root.updateMatrixWorld(true);
        root.traverse(object => {
            const joint = actorJoint(object.name);
            if (!(object as Bone).isBone || !joint) return;
            this.bones.push({ bone: object as Bone, joint, rest: object.matrixWorld.clone() });
            object.matrixAutoUpdate = false;
        });

        // A garment may omit shoulders, the spine, or even everything above a
        // forearm. Recover the most complete hierarchy present across the skins;
        // do not treat each garment's first bone as a separate animated root.
        const sources = new Map<ActorJoint, { rest: Matrix4; parent?: ActorJoint }[]>();
        for (const {bone, joint, rest} of this.bones) {
            if (/_Roll\d*(?:[._]\d+)*$/.test(bone.name)) continue;
            let parent: ActorJoint | undefined;
            for (let ancestor = bone.parent; ancestor; ancestor = ancestor.parent) {
                const candidate = (ancestor as Bone).isBone ? actorJoint(ancestor.name) : undefined;
                if (candidate && candidate !== joint) { parent = candidate; break; }
            }
            if (!sources.has(joint)) sources.set(joint, []);
            sources.get(joint)!.push({ rest, parent });
        }
        const addJoint = (joint: ActorJoint): number => {
            const existing = this.joints.get(joint);
            if (existing) return existing.depth;
            const candidates = sources.get(joint)!;
            let chosen = candidates[0], depth = -1, support = -1;
            for (const source of candidates) {
                const parentDepth = source.parent ? addJoint(source.parent) : -1;
                // Parts can have an authoring offset (Hackett's backpack does).
                // Select an existing bind shared by the most parts, rather than
                // letting asset traversal order move the entire body skeleton.
                const p = source.rest.elements;
                const matches = candidates.filter(other => {
                    const q = other.rest.elements;
                    return (p[12]-q[12])**2 + (p[13]-q[13])**2 + (p[14]-q[14])**2 < 1e-8;
                }).length;
                if (parentDepth > depth || parentDepth === depth && matches > support) {
                    chosen = source; depth = parentDepth; support = matches;
                }
            }
            const offset = new Vector3().setFromMatrixPosition(chosen.rest);
            if (chosen.parent) offset.applyMatrix4(this.joints.get(chosen.parent)!.inverseRest);
            this.joints.set(joint, {
                rest: chosen.rest, inverseRest: chosen.rest.clone().invert(),
                world: chosen.rest.clone(), delta: new Matrix4(),
                parent: chosen.parent, offset, depth: depth + 1
            });
            return depth + 1;
        };
        for (const joint of sources.keys()) addJoint(joint);
        const driven = new Map(this.bones.map(entry => [entry.bone as Object3D, entry]));
        root.traverse(object => {
            if (object === root) return;
            this.hierarchy.push({object, driven: driven.get(object)});
            // This rig owns these world matrices. Three's later scene traversal
            // must not recompute the same garment hierarchy before drawing.
            object.matrixWorldAutoUpdate = false;
        });
    }

    apply(delta: (joint: ActorJoint) => Matrix4 | undefined, head = true) {
        for (const [joint, target] of this.joints) {
            const transform = delta(joint);
            if (!transform) continue;
            target.world.multiplyMatrices(transform, target.rest);
            if (target.parent) {
                // Reference translations stretch differently proportioned actors.
                // Only the root takes motion; every child keeps its source offset
                // and takes the reference rotation in its own rest basis.
                this.position.copy(target.offset).applyMatrix4(this.joints.get(target.parent)!.world);
                target.world.setPosition(this.position);
            }
            target.delta.multiplyMatrices(target.world, target.inverseRest);
        }
        // GLTF traversal is parent-first. Update each node once, including
        // undriven intermediate bones, instead of climbing all ancestors for
        // every bone in every garment.
        this.root.updateWorldMatrix(true, false);
        for (const {object, driven} of this.hierarchy) {
            if (driven) {
                const {bone, joint, rest} = driven;
                const target = this.joints.get(joint);
                if (target && delta(joint)) {
                    this.desired.multiplyMatrices(target.delta, rest);
                    this.inverse.copy(bone.parent!.matrixWorld).invert();
                    bone.matrix.multiplyMatrices(this.inverse, this.desired);
                    if (joint === "head" && !head) bone.matrix.scale(this.hidden);
                }
            }
            if (object.matrixAutoUpdate) object.updateMatrix();
            object.matrixWorld.multiplyMatrices(object.parent!.matrixWorld, object.matrix);
            object.matrixWorldNeedsUpdate = false;
            const skin = object as SkinnedMesh;
            if (skin.isSkinnedMesh) {
                // Own the attached skin bind update too; no second scene walk
                // is needed merely to refresh SkinnedMesh's inverse matrix.
                skin.bindMatrixInverse.copy(skin.bindMode === "attached" ? skin.matrixWorld : skin.bindMatrix).invert();
            }
        }
    }
}
