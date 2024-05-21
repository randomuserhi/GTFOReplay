import { BufferGeometry, Color, InstancedMesh, Material, Matrix4, NormalBufferAttributes } from "three";

export interface InstanceTypes {
}

const mat = new Matrix4();
const temp = new Color();

class DynamicInstanceManager {
    mesh: InstancedMesh;
    capacity: number;

    constructor(geometry: BufferGeometry<NormalBufferAttributes>, material: Material | Material[], capacity: number) {
        this.mesh = new InstancedMesh(geometry, material, capacity);
        this.mesh.frustumCulled = false;
        this.capacity = capacity;
    }

    public consume(matrix: Matrix4, color: Color): number {
        if (this.mesh.count >= this.capacity) {
            const newCapacity = this.capacity * 2;
            const instance = new InstancedMesh(this.mesh.geometry, this.mesh.material, newCapacity);
            instance.frustumCulled = false;
            
            for (let i = 0; i < this.capacity; ++i) {
                this.mesh.getMatrixAt(i, mat);
                instance.setMatrixAt(i, mat);

                this.mesh.getColorAt(i, temp);
                instance.setColorAt(i, temp);
            }
            instance.count = this.mesh.count;
            this.mesh.count = 0;

            this.mesh = instance;
            this.capacity = newCapacity;
        }

        this.mesh.setColorAt(this.mesh.count, color);
        this.mesh.setMatrixAt(this.mesh.count, matrix);

        return this.mesh.count++;
    }
}

export const _instances = new Map<keyof InstanceTypes, DynamicInstanceManager>(); 

export function createInstance(type: keyof InstanceTypes, geometry: BufferGeometry<NormalBufferAttributes>, material: Material | Material[], maximumCount: number): InstancedMesh {
    if (_instances.has(type)) return _instances.get(type)!.mesh;
    const manager = new DynamicInstanceManager(geometry, material, maximumCount);
    _instances.set(type, manager);
    return manager.mesh;
}

export function getInstance(type: keyof InstanceTypes) {
    if (!_instances.has(type)) throw new Error(`Instance type '${type}' does not exist.`);
    return _instances.get(type)!.mesh;
}

export function consume(type: keyof InstanceTypes, matrix: Matrix4, color: Color): number {
    if (!_instances.has(type)) throw new Error(`Instance type '${type}' does not exist.`);
    const manager = _instances.get(type)!;
    return manager.consume(matrix, color);
}