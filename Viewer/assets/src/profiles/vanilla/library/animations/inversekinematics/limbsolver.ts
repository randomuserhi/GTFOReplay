import { Object3D, Quaternion, Vector3 } from "@esm/three";
import { Bone, IKSolver, lookRotation, rotationToLocalSpace, vectorSlerp } from "./rootmotion.js";

// TODO(randomuserhi): Calculate worldPosition and worldRotation once, and reuse

const _initiate_rotation = new Quaternion();
const _initiate_temp = new Vector3();
export class TrigonometricBone extends Bone {
    private targetToLocalSpace: Quaternion;
    private defaultLocalBendNormal: Vector3;

    constructor(transform: Object3D, weight: number) {
        super(transform, weight);

        this.targetToLocalSpace = new Quaternion();
        this.defaultLocalBendNormal = new Vector3();
    }

    public initiate(childPosition: Vector3, bendNormal: Vector3) {
        lookRotation(_initiate_rotation, _initiate_temp.copy(childPosition).sub(this.worldPosition()), bendNormal);
        rotationToLocalSpace(this.targetToLocalSpace, this.worldRotation(), _initiate_rotation);
        this.defaultLocalBendNormal.copy(bendNormal).applyQuaternion(this.worldRotation().invert());
    }

    public getRotation(quaternion: Quaternion, direction: Vector3, bendNormal: Vector3): Quaternion {
        return lookRotation(quaternion, direction, bendNormal).multiply(this.targetToLocalSpace);
    }

    public getBendNormalFromCurrentRotation(normal: Vector3): Vector3 {
        return normal.copy(this.defaultLocalBendNormal).applyQuaternion(this.worldRotation());
    }
}

class AxisDirection {
    direction: Vector3;
    axis: Vector3;

    dot: number;
    
    constructor() {
        this.direction = new Vector3();
        this.axis = new Vector3();
        this.dot = 0;
    }
}

const _onInitiate_vector = new Vector3();
const _onInitiate_temp0 = new Vector3();
const _onUpdate_vector = new Vector3();
const _onUpdate_vector2 = new Vector3();
const _onUpdate_temp0 = new Vector3();
const _onUpdate_temp1 = new Vector3();
const _onUpdate_bendDirection = new Vector3();
const _getBendDirection_vector = new Vector3();
const _getBendDirection_temp0 = new Vector3();
const _getBendDirection_upwards = new Vector3();
const _getBendDirection_lookrot = new Quaternion();
const _parentWorldRotation = new Quaternion();
const _updateBendNormal_normal = new Vector3();
export class IKSolverArm extends IKSolver {
    target: Object3D;

    bendNormal: Vector3;

    IKRotation: Quaternion;
    IKRotationWeight: number;

    bone1: TrigonometricBone;
    bone2: TrigonometricBone;
    bone3: TrigonometricBone;

    invParentDefaultRotation: Quaternion;
    defaultRootRotation: Quaternion;
    bone3defaultRotation: Quaternion;

    rightArm: boolean; 
    axisDirectionLeft: AxisDirection[];
    axisDirectionRight: AxisDirection[];
    
    weightIKPosition: Vector3;

    constructor() {
        super();

        this.bendNormal = new Vector3();

        this.IKRotation = new Quaternion();
        this.IKRotationWeight = 1;

        this.defaultRootRotation = new Quaternion();
        this.bone3defaultRotation = new Quaternion();
    
        this.axisDirectionLeft = new Array(4);
        this.axisDirectionRight = new Array(4);
        for (let i = 0; i < 4; ++i) {
            this.axisDirectionLeft[i] = new AxisDirection();
            this.axisDirectionRight[i] = new AxisDirection();
        }

        this.weightIKPosition = new Vector3();
        this.invParentDefaultRotation = new Quaternion();

        this.rightArm = true;
    }

    private storeAxisDirection(axisDirections: AxisDirection[]) {
        axisDirections[0].direction.set(0, 0, 0);
        axisDirections[0].axis.set(-1, 0, 0);

        axisDirections[1].direction.set(0.5, 0, -0.2);
        axisDirections[1].axis.set(0.5, -1, 1);
        
        axisDirections[2].direction.set(-0.5, -1, -0.2);
        axisDirections[2].axis.set(0, 0.5, -1);

        axisDirections[3].direction.set(-0.5, -0.5, 1);
        axisDirections[3].axis.set(-1, -1, -1);
    }
    
    protected onInitiate(): void {
        if (this.bendNormal.x === 0 && this.bendNormal.y === 0 && this.bendNormal.z === 0) {
            this.bendNormal.set(1, 0, 0);
        }

        this.defaultRootRotation.copy(this.rootWorldRotation());
        this.invParentDefaultRotation.copy(this.defaultRootRotation).invert().multiply(this.bone1.transform.parent!.getWorldQuaternion(_parentWorldRotation)).invert();
        this.bone3defaultRotation.copy(this.bone3.worldRotation());
        _onInitiate_vector.copy(this.bone2.worldPosition()).sub(this.bone1.worldPosition()).cross(_onInitiate_temp0.copy(this.bone3.worldPosition()).sub(this.bone2.worldPosition()));
        if (_onInitiate_vector.x !== 0 || _onInitiate_vector.y !== 0 || _onInitiate_vector.z !== 0) {
            this.bendNormal.copy(_onInitiate_vector);
        }

        this.storeAxisDirection(this.axisDirectionLeft);
        this.storeAxisDirection(this.axisDirectionRight);
        
        this.IKPosition.copy(this.bone3.worldPosition());
        this.IKRotation.copy(this.bone3.worldRotation());
        this.initiateBones();
    }

    private initiateBones(): void {
        this.bone1.initiate(this.bone2.worldPosition(), this.bendNormal);
        this.bone2.initiate(this.bone3.worldPosition(), this.bendNormal);
        this.setBendPlaneToCurrent();
    }

    private setBendPlaneToCurrent() {
        if (this.initiated) {
            _onInitiate_vector.copy(this.bone2.worldPosition()).sub(this.bone1.worldPosition()).cross(_onInitiate_temp0.copy(this.bone3.worldPosition()).sub(this.bone2.worldPosition()));
            if (_onInitiate_vector.x !== 0 || _onInitiate_vector.y !== 0 || _onInitiate_vector.z !== 0) {
                this.bendNormal.copy(_onInitiate_vector);
            }
        }
    }

    protected onUpdate(): void {
        if (this.target === undefined) return;

        this.IKPositionWeight = Math.clamp01(this.IKPositionWeight);
        this.IKRotationWeight = Math.clamp01(this.IKRotationWeight);

        this.target.getWorldPosition(this.IKPosition);
        this.target.getWorldQuaternion(this.IKRotation);

        this.updateBendNormal();

        if (this.IKPositionWeight > 0) {
            this.bone1.sqrMag = this.bone2.worldPosition().sub(this.bone1.worldPosition()).lengthSq();
            this.bone2.sqrMag = this.bone3.worldPosition().sub(this.bone2.worldPosition()).lengthSq();

            this.weightIKPosition.lerpVectors(this.bone3.worldPosition(), this.IKPosition, this.IKPositionWeight);
            this.bone1.getBendNormalFromCurrentRotation(_onUpdate_vector).lerp(this.bendNormal, this.IKPositionWeight);
            this.getBendDirection(_onUpdate_bendDirection, this.weightIKPosition, _onUpdate_vector);
            _onUpdate_vector2.lerpVectors(this.bone2.worldPosition().sub(this.bone1.worldPosition()), _onUpdate_bendDirection, this.IKPositionWeight);
            if (_onUpdate_vector2.x === 0 && _onUpdate_vector2.y === 0 && _onUpdate_vector2.z === 0) {
                _onUpdate_vector2.copy(this.bone2.worldPosition()).sub(this.bone1.worldPosition());
            }

            let parent = this.bone1.detach();
            this.bone1.getRotation(this.bone1.transform.quaternion, _onUpdate_vector2, _onUpdate_vector);
            this.bone1.attach(parent);
            
            parent = this.bone2.detach();
            this.bone2.getRotation(this.bone2.transform.quaternion, _onUpdate_temp0.copy(this.weightIKPosition).sub(this.bone2.worldPosition()), this.bone2.getBendNormalFromCurrentRotation(_onUpdate_temp1));
            this.bone2.attach(parent);
        }

        if (this.IKRotationWeight > 0) {
            const parent = this.bone3.detach();
            this.bone3.transform.quaternion.slerp(this.IKRotation, this.IKRotationWeight);
            this.bone3.attach(parent);
        }
    }

    private getBendDirection(result: Vector3, IKPosition: Vector3, bendNormal: Vector3): Vector3 {
        _getBendDirection_vector.copy(IKPosition).sub(this.bone1.worldPosition());
        if (_getBendDirection_vector.x === 0 && _getBendDirection_vector.y === 0 && _getBendDirection_vector.z === 0) {
            return result.set(0, 0, 0);
        }

        const sqrMagnitude = _getBendDirection_vector.lengthSq();
        const num = Math.sqrt(sqrMagnitude);
        const num2 = (sqrMagnitude + this.bone1.sqrMag - this.bone2.sqrMag) / 2 / num;
        const y = Math.sqrt(Math.clamp(this.bone1.sqrMag - num2 * num2, 0, Infinity));
        _getBendDirection_upwards.crossVectors(_getBendDirection_temp0.copy(_getBendDirection_vector).divideScalar(num), bendNormal);
        return result.set(0, y, num2).applyQuaternion(lookRotation(_getBendDirection_lookrot, _getBendDirection_vector, _getBendDirection_upwards));
    }

    private updateBendNormal() {
        const axisDirections = this.rightArm ? this.axisDirectionLeft : this.axisDirectionRight;

        _updateBendNormal_normal.copy(this.IKPosition).sub(this.bone1.worldPosition()).normalize();
        _updateBendNormal_normal.applyQuaternion(this.bone1.transform.parent!.getWorldQuaternion(_parentWorldRotation).multiply(this.invParentDefaultRotation).invert());
        if (this.rightArm) {
            _updateBendNormal_normal.x = 0 - _updateBendNormal_normal.x;
        }
        
        for (let i = 1; i < axisDirections.length; i++) {
            axisDirections[i].dot = interpInOutQuintic(Math.clamp01(axisDirections[i].direction.dot(_updateBendNormal_normal)), 0, 1);
        }
        
        this.bendNormal.copy(axisDirections[0].axis);
        for (let j = 1; j < axisDirections.length; j++) {
            vectorSlerp(this.bendNormal, this.bendNormal, axisDirections[j].axis, Math.clamp01(axisDirections[j].dot));
        }
        this.bendNormal.normalize();
        
        if (this.rightArm) {
            this.bendNormal.x = 0 - this.bendNormal.x;
            this.bendNormal.multiplyScalar(-1);
        }
        
        this.bendNormal.applyQuaternion(this.bone1.transform.parent!.getWorldQuaternion(_parentWorldRotation).multiply(this.invParentDefaultRotation));
    }
}

function interpInOutQuintic(t: number, b: number, c: number) {
    const num = t * t;
    const num2 = num * t;
    return b + c * (6.0 * num2 * num + -15.0 * num * num + 10.0 * num2);
}