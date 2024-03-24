import { BufferGeometry, Color, InstancedMesh, Material, Matrix4, NormalBufferAttributes } from "three";

export interface InstanceTypes {
}

// TODO(randomuserhi): Dynamic Counts to scale buffers

export const _instances = new Map<keyof InstanceTypes, InstancedMesh>(); 

export function createInstance(type: keyof InstanceTypes, geometry: BufferGeometry<NormalBufferAttributes>, material: Material | Material[], maximumCount: number): InstancedMesh {
    if (_instances.has(type)) return _instances.get(type)!;
    const mesh = new InstancedMesh(geometry, material, maximumCount);
    _instances.set(type, mesh);
    return mesh;
}

export function getInstance(type: keyof InstanceTypes) {
    if (!_instances.has(type)) throw new Error(`Instance type '${type}' does not exist.`);
    return _instances.get(type)!;
}

export function consume(type: keyof InstanceTypes, matrix: Matrix4, color: Color): number {
    if (!_instances.has(type)) throw new Error(`Instance type '${type}' does not exist.`);
    const mesh = _instances.get(type)!;
    mesh.setColorAt(mesh.count, color);
    mesh.setMatrixAt(mesh.count, matrix);
    return mesh.count++;
}