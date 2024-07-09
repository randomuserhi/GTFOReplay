import { WeakCollection } from "@/rhu/weak.js";
import { BufferGeometry, Color, InstancedMesh, Material, Matrix4, NormalBufferAttributes } from "three";

export interface InstanceTypes {
}

export class DynamicInstanceManager {
    static all: WeakCollection<DynamicInstanceManager>;

    mesh: InstancedMesh;
    capacity: number;
    material: Material | Material[];
    init?: (mesh: InstancedMesh) => void;

    constructor(geometry: BufferGeometry<NormalBufferAttributes>, material: Material | Material[], capacity: number, init?: (mesh: InstancedMesh) => void) {
        DynamicInstanceManager.all.add(this);
        
        this.init = init;
        this.material = material;
        
        this.mesh = new InstancedMesh(geometry, material, capacity);
        if (this.init !== undefined) {
            this.init(this.mesh);
        }
        this.mesh.frustumCulled = false;

        this.capacity = capacity;
    }

    private static FUNC_consume = {
        mat: new Matrix4(),
        temp: new Color()
    } as const;
    public consume(matrix: Matrix4, color: Color): number {
        const { mat, temp } = DynamicInstanceManager.FUNC_consume;

        if (this.mesh.count >= this.capacity) {
            const newCapacity = this.capacity * 2;
            
            const instance = new InstancedMesh(this.mesh.geometry, this.mesh.material, newCapacity);
            if (this.init !== undefined) {
                this.init(instance);
            }
            instance.frustumCulled = false;
            
            for (let i = 0; i < this.capacity; ++i) {
                this.mesh.getMatrixAt(i, mat);
                instance.setMatrixAt(i, mat);

                this.mesh.getColorAt(i, temp);
                instance.setColorAt(i, temp);
            }
            instance.count = this.mesh.count;
            this.mesh.count = 0;
            this.mesh.dispose();

            this.mesh = instance;
            this.capacity = newCapacity;
        }

        this.mesh.setColorAt(this.mesh.count, color);
        this.mesh.setMatrixAt(this.mesh.count, matrix);

        return this.mesh.count++;
    }
}

const _instances = new Map<keyof InstanceTypes, DynamicInstanceManager>;

export function createInstance(type: keyof InstanceTypes, geometry: BufferGeometry<NormalBufferAttributes>, material: Material | Material[], maximumCount: number, init?: (mesh: InstancedMesh) => void): DynamicInstanceManager {
    if (_instances.has(type)) return _instances.get(type)!;
    const manager = new DynamicInstanceManager(geometry, material, maximumCount, init);
    _instances.set(type, manager);
    return manager;
}

export function getInstance(type: keyof InstanceTypes) {
    if (!_instances.has(type)) return undefined;
    return _instances.get(type)!.mesh;
}

export function consume(type: keyof InstanceTypes, matrix: Matrix4, color: Color): number {
    if (!_instances.has(type)) return -1;
    const manager = _instances.get(type)!;
    return manager.consume(matrix, color);
}