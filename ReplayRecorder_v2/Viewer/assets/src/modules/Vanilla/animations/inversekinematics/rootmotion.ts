import { Object3D, Quaternion, Vector3 } from "three";

const _Point_ones = new Vector3(1, 1, 1);
export class Point {
    transform: Object3D;
    private _worldPosition: Vector3;
    private _worldRotation: Quaternion;

    weight: number;

    solverPosition: Vector3;
    solverRotation: Quaternion;

    constructor() {
        this.weight = 1.0;
        this.solverPosition = new Vector3();
        this.solverRotation = new Quaternion();

        this._worldPosition = new Vector3();
        this._worldRotation = new Quaternion();
    }

    public worldPosition(): Vector3 {
        return this.transform.getWorldPosition(this._worldPosition);
    }

    public worldRotation(): Quaternion {
        return this.transform.getWorldQuaternion(this._worldRotation);
    }

    // NOTE(randomuserhi): Remove whilst maintaining world position and rotation
    public detach(): Object3D | undefined | null {
        const parent = this.transform.parent;
        this.transform.updateWorldMatrix(true, false);
        this.worldPosition(); this.worldRotation();
        this.transform.removeFromParent();
        this.transform.position.copy(this._worldPosition);
        this.transform.quaternion.copy(this._worldRotation);
        this.transform.scale.copy(_Point_ones);
        return parent;
    }

    // NOTE(randomuserhi): Attach whilst maintaining world position -> As per three.js does not support non-uniformly scaled nodes
    public attach(parent?: Object3D | null) {
        parent?.attach(this.transform);
    }
}

export class Bone extends Point {
    length: number;
    sqrMag: number;
    axis: Vector3;

    constructor(transform: Object3D, weight: number) {
        super();

        this.transform = transform;
        this.weight = weight;

        this.length = 0;
        this.sqrMag = 0;

        this.axis = new Vector3(-1, 0 ,0);
    }
}

export class IKSolver {
    IKPosition: Vector3;
    IKPositionWeight: number;
    
    protected initiated: boolean; 
    protected firstInitiation: boolean;

    root: Object3D;

    constructor() {
        this.IKPosition = new Vector3();
        this.IKPositionWeight = 1;

        this.initiated = false;
        this.firstInitiation = true;
    }

    public initiate(root: Object3D) {
        this.root = root;
        this.initiated = false;
        this.onInitiate();
        this.storeDefaultLocalState();
        this.initiated = true;
        this.firstInitiation = false;
    }

    protected onInitiate() {

    }

    public update() {
        if (this.firstInitiation) {
            this.initiate(this.root);
        }

        if (this.initiated) {
            this.onUpdate();
        }
    }
    
    protected onUpdate() {

    }

    protected storeDefaultLocalState() {
        
    }
}


export class IKSolverHeuristic extends IKSolver {
    target: Object3D;

    tolerance: number;
    maxIterations: number;

    bones: Bone[];

    protected chainLength: number;

    constructor() {
        super();

        this.tolerance = 0;
        this.maxIterations = 4;

        this.bones = [];

        this.chainLength = 0;
    }
}

// https://stackoverflow.com/a/60384894/9642458
const _vectorSlerp_a = new Vector3();
const _vectorSlerp_b = new Vector3();
export function vectorSlerp(result: Vector3, a: Vector3, b: Vector3, lerp: number) {
    const dot = Math.clamp(_vectorSlerp_a.copy(a).normalize().dot(_vectorSlerp_b.copy(b).normalize()), -1.0, 1.0);
    const omega = Math.acos(dot);
    const sinOmega = Math.sin(omega);
    _vectorSlerp_a.copy(a).multiplyScalar(Math.sin(omega * (1.0 - lerp)) / sinOmega);
    _vectorSlerp_b.copy(b).multiplyScalar(Math.sin(omega * (      lerp)) / sinOmega);

    result.x = _vectorSlerp_a.x + _vectorSlerp_b.x;
    result.y = _vectorSlerp_a.y + _vectorSlerp_b.y;
    result.z = _vectorSlerp_a.z + _vectorSlerp_b.z;

    return result;
}