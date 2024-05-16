import { exists } from "@/rhu/rhu.js";
import { Object3D, Quaternion, Vector3 } from "three";
import { Bone, IKSolverHeuristic, vectorSlerp } from "./rootmotion.js";

// TODO(randomuserhi): Calculate worldPosition and worldRotation once, and reuse

const _transformAxis = new Vector3();
const _getAngle_Vec = new Vector3();
const _getClampedIKPosition = new Vector3();
const _getClampedIKPosition_temp = new Vector3();
const _onUpdate_b = new Vector3();
const _rotateToTarget_vector2 = new Vector3();
const _rotateToTarget_temp = new Quaternion();
const _rotateToTarget_identity = new Quaternion();

export class IKSolverAim extends IKSolverHeuristic {
    transform: Object3D;
    _worldPosition: Vector3;
    _worldRotation: Quaternion;

    axis: Vector3;
    poleAxis: Vector3;

    public clampWeight: number;
    public clampSmoothing: number;
    private clampedIKPosition: Vector3;

    private step: number;

    constructor() {
        super();

        this.axis = new Vector3(0, 0, 1);
        this.poleAxis = new Vector3(0, 1, 0);
    
        this.clampWeight = 0.1;
        this.clampSmoothing = 2;
        this.clampedIKPosition = new Vector3();
        this.step = 0;

        this._worldPosition = new Vector3();
        this._worldRotation = new Quaternion();
    }

    public transformAxis(): Vector3 {
        return _transformAxis.copy(this.axis).applyQuaternion(this.worldRotation());
    }

    public worldPosition(): Vector3 {
        return this.transform.getWorldPosition(this._worldPosition);
    }

    public worldRotation(): Quaternion {
        return this.transform.getWorldQuaternion(this._worldRotation);
    }

    public getAngle(): number {
        return this.transformAxis().angleTo(_getAngle_Vec.copy(this.IKPosition).sub(this.worldPosition())) * Math.rad2deg; 
    }

    protected onInitiate() {
        this.step = 1.0 / this.bones.length;
        this.axis.normalize();
    }

    protected onUpdate(): void {
        if (!exists(this.target) || !exists(this.transform)) return;

        if (this.axis.x === 0 && this.axis.y === 0 && this.axis.z === 0) {
            return;
        }
        
        this.target.getWorldPosition(this.IKPosition);
        
        if (this.IKPositionWeight <= 0) {
            return;
        }
        
        this.IKPositionWeight = Math.clamp01(this.IKPositionWeight);
        
        this.clampWeight = Math.clamp01(this.clampWeight);
        const b = _onUpdate_b.copy(this.getClampedIKPosition()).sub(this.worldPosition());
        vectorSlerp(b, this.transformAxis().multiplyScalar(b.length()), b, this.IKPositionWeight);
        this.clampedIKPosition.copy(this.worldPosition()).add(b);
        for (let i = 0; i < this.maxIterations && (i < 1 || !(this.tolerance > 0) || !(this.getAngle() < this.tolerance)); i++) {
            this.solve();
        }
    }

    private solve() {
        for (let i = 0; i < this.bones.length - 1; i++) {
            this.rotateToTarget(this.clampedIKPosition, this.bones[i], this.step * (i + 1) * this.IKPositionWeight * this.bones[i].weight);
        }
        
        this.rotateToTarget(this.clampedIKPosition, this.bones[this.bones.length - 1], this.IKPositionWeight * this.bones[this.bones.length - 1].weight);
    }

    private rotateToTarget(targetPosition: Vector3, bone: Bone, weight: number) {
        if (weight >= 0) {
            const quaternion = _rotateToTarget_temp.setFromUnitVectors(this.transformAxis().normalize(), _rotateToTarget_vector2.copy(targetPosition).sub(this.worldPosition()).normalize());
            // Detach to work in world space
            const parent = bone.detach();
            if (weight >= 1) {
                bone.transform.quaternion.copy(quaternion.multiply(bone.transform.quaternion));
            } else {
                _rotateToTarget_identity.set(0, 0, 0, 1);
                bone.transform.quaternion.copy(_rotateToTarget_identity.slerp(quaternion, weight).multiply(bone.transform.quaternion));
            }
            // Reattach -> maintaining world transform
            bone.attach(parent);
        }
    }

    private getClampedIKPosition(): Vector3 {
        if (this.clampWeight <= 0) {
            return _getClampedIKPosition.copy(this.IKPosition);
        }
    
        if (this.clampWeight >= 1) {
            return _getClampedIKPosition.copy(this.worldPosition()).add(this.transformAxis().multiplyScalar(_getClampedIKPosition_temp.copy(this.IKPosition).sub(this.worldPosition()).length()));
        }
    
        const num = this.transformAxis().angleTo(_getClampedIKPosition_temp.copy(this.IKPosition).sub(this.worldPosition())) * Math.rad2deg;
        const num2 = 1.0 - num / 180.0;
        const num3 = ((this.clampWeight > 0) ? Math.clamp01(1.0 - (this.clampWeight - num2) / (1.0 - num2)) : 1.0);
        let num4 = ((this.clampWeight > 0) ? Math.clamp01(num2 / this.clampWeight) : 1.0);
        for (let i = 0; i < this.clampSmoothing; i++) {
            num4 = Math.sin(num4 * Math.PI * 0.5);
        }
    
        const temp = this.transformAxis().multiplyScalar(10);
        return _getClampedIKPosition.copy(this.worldPosition()).add(vectorSlerp(temp, temp, _getClampedIKPosition_temp.copy(this.IKPosition).sub(this.worldPosition()), num4 * num3));
    }
}