import { Box3, BufferGeometry, Material, Mesh, Object3D, Vector3 } from "three";

export const isTentacle = (name: string) => /^(IRF_.*Tentacle|infested_tentacle)/i.test(name);

export function cloneModelMaterials(root: Object3D) {
    const originals = new Set<Material>(), materials = new Set<Material>(), shared = new Map<Material, Material>();
    root.traverse(object => {
        const mesh = object as Mesh;
        if (!mesh.isMesh) return;
        const copy = (source: Material) => {
            originals.add(source);
            // A tentacle's bend axes are local to its mesh; uniforms cannot be
            // shared with a different appendage or another replay instance.
            let material = isTentacle(mesh.name) ? undefined : shared.get(source);
            if (!material) {
                material = source.clone();
                if (!isTentacle(mesh.name)) shared.set(source, material);
            }
            materials.add(material);
            return material;
        };
        mesh.material = Array.isArray(mesh.material) ? mesh.material.map(copy) : copy(mesh.material);
    });
    return {originals, materials};
}

interface Shape { origin: Vector3; axis: Vector3; side: Vector3; up: Vector3; length: number }
const shapes = new WeakMap<BufferGeometry, Shape>();
function shapeOf(mesh: Mesh, bodyCenter: Vector3): Shape {
    const cached = shapes.get(mesh.geometry);
    if (cached) return cached;
    const points = mesh.geometry.getAttribute("position"), center = new Vector3(), point = new Vector3();
    for (let i = 0; i < points.count; i++) center.add(point.fromBufferAttribute(points, i));
    center.divideScalar(points.count);
    const covariance = Array<number>(9).fill(0);
    for (let i = 0; i < points.count; i++) {
        point.fromBufferAttribute(points, i).sub(center);
        const p = point.toArray();
        for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) covariance[a * 3 + b] += p[a] * p[b];
    }
    const principal = [0, 1, 2].sort((a, b) => covariance[b * 4] - covariance[a * 4])[0];
    const axis = new Vector3().setComponent(principal, 1);
    for (let i = 0; i < 16; i++) axis.set(
        covariance[0] * axis.x + covariance[1] * axis.y + covariance[2] * axis.z,
        covariance[3] * axis.x + covariance[4] * axis.y + covariance[5] * axis.z,
        covariance[6] * axis.x + covariance[7] * axis.y + covariance[8] * axis.z
    ).normalize();
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < points.count; i++) {
        const s = point.fromBufferAttribute(points, i).sub(center).dot(axis);
        min = Math.min(min, s); max = Math.max(max, s);
    }
    const start = center.clone().addScaledVector(axis, min), end = center.clone().addScaledVector(axis, max);
    const body = mesh.worldToLocal(bodyCenter.clone());
    const origin = start.distanceToSquared(body) < end.distanceToSquared(body) ? start : end;
    if (origin === end) axis.negate();
    const up = new Vector3(0, 1, 0);
    if (Math.abs(up.dot(axis)) > .9) up.set(1, 0, 0);
    up.addScaledVector(axis, -up.dot(axis)).normalize();
    const shape = {origin, axis, up, side: new Vector3().crossVectors(axis, up).normalize(), length: Math.max(max - min, .0001)};
    shapes.set(mesh.geometry, shape);
    return shape;
}

const declarations = /* glsl */`
uniform float tentacleTime;
uniform float tentaclePhase;
uniform float tentacleLength;
uniform vec3 tentacleOrigin;
uniform vec3 tentacleAxis;
uniform vec3 tentacleSide;
uniform vec3 tentacleUp;
vec3 tentacleOffset(vec3 p) {
    float t = clamp(dot(p - tentacleOrigin, tentacleAxis) / tentacleLength, 0.0, 1.0);
    float wave = sin(tentacleTime * 1.4 - t * 4.0 + tentaclePhase);
    float lift = sin(tentacleTime * .95 - t * 3.0 + tentaclePhase * .7);
    return tentacleLength * t * t * (tentacleSide * wave * .075 + tentacleUp * (lift * .05 - .04));
}
`;

/** Visual secondary motion, evaluated from replay time so pause/seek are exact. */
export class SoftTentacles {
    readonly time = {value: 0};
    readonly count: number;
    constructor(root: Object3D) {
        root.updateMatrixWorld(true);
        const body = new Box3();
        root.traverse(object => {
            const mesh = object as Mesh;
            if (mesh.isMesh && !isTentacle(mesh.name)) {
                mesh.geometry.computeBoundingBox();
                body.union(mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrixWorld));
            }
        });
        const center = body.getCenter(new Vector3());
        let count = 0;
        root.traverse(object => {
            const mesh = object as Mesh;
            if (!mesh.isMesh || !isTentacle(mesh.name)) return;
            const shape = shapeOf(mesh, center), phase = ++count * 2.399963;
            mesh.frustumCulled = false;
            for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
                material.onBeforeCompile = shader => {
                    Object.assign(shader.uniforms, {
                        tentacleTime: this.time, tentaclePhase: {value: phase}, tentacleLength: {value: shape.length},
                        tentacleOrigin: {value: shape.origin}, tentacleAxis: {value: shape.axis},
                        tentacleSide: {value: shape.side}, tentacleUp: {value: shape.up}
                    });
                    shader.vertexShader = declarations + shader.vertexShader
                        .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += tentacleOffset(position);')
                        .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
                            float stepLength = tentacleLength * .001;
                            vec3 gradient = (tentacleOffset(position + tentacleAxis * stepLength) - tentacleOffset(position - tentacleAxis * stepLength)) / (2.0 * stepLength);
                            objectNormal -= tentacleAxis * dot(gradient, objectNormal);
                        `);
                };
                material.customProgramCacheKey = () => 'gtfo-soft-tentacle-v1';
                material.needsUpdate = true;
            }
        });
        this.count = count;
    }
    update(seconds: number) { this.time.value = seconds; }
}
