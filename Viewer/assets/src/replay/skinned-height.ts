import { Matrix4, Mesh, SkinnedMesh, Vector3 } from "three";

/** Exact support after the pose owner has updated world matrices and skin binds. */
export class SkinnedHeight {
    private readonly rows: Float64Array;
    private readonly world = new Matrix4();
    private readonly bone = new Matrix4();
    private readonly point = new Vector3();
    private readonly bones: number[];

    constructor(private readonly mesh: SkinnedMesh, private readonly vertices: number[]) {
        this.rows = new Float64Array(mesh.skeleton.bones.length * 4);
        const indices = mesh.geometry.getAttribute("skinIndex"), weights = mesh.geometry.getAttribute("skinWeight");
        const bones = new Set<number>();
        for (const vertex of vertices) for (let j = 0; j < 4; j++)
            if (weights.getComponent(vertex, j) !== 0) bones.add(indices.getComponent(vertex, j));
        this.bones = [...bones];
    }

    minimum() {
        const {mesh, rows, point} = this;
        const {skeleton, geometry} = mesh;
        // ActorRig already owns these world matrices and bind inverses. Calling
        // updateMatrixWorld here would walk the garment's bone hierarchy again.
        this.world.multiplyMatrices(mesh.matrixWorld, mesh.bindMatrixInverse);
        const translation = this.world.elements[13];
        // Compose each bone once; the former per-vertex skin query recomputed
        // these products for every influence of every shoe vertex.
        for (const i of this.bones) {
            this.bone.multiplyMatrices(skeleton.bones[i].matrixWorld, skeleton.boneInverses[i]);
            this.bone.premultiply(this.world).multiply(mesh.bindMatrix);
            const e = this.bone.elements, offset = i * 4;
            rows[offset] = e[1]; rows[offset + 1] = e[5];
            rows[offset + 2] = e[9]; rows[offset + 3] = e[13];
        }
        const indices = geometry.getAttribute("skinIndex"), weights = geometry.getAttribute("skinWeight");
        let minimum = Infinity;
        for (const vertex of this.vertices) {
            // Keep morph targets, but leave bone deformation to the height rows.
            Mesh.prototype.getVertexPosition.call(mesh, vertex, point);
            let height = 0, total = 0;
            for (let j = 0; j < 4; j++) {
                const weight = weights.getComponent(vertex, j);
                if (weight === 0) continue;
                const offset = indices.getComponent(vertex, j) * 4;
                height += weight * (rows[offset] * point.x + rows[offset + 1] * point.y + rows[offset + 2] * point.z + rows[offset + 3]);
                total += weight;
            }
            // Three applies the final affine translation after weighting, even
            // for source weights whose floating-point sum is not exactly one.
            minimum = Math.min(minimum, height + (1 - total) * translation);
        }
        return minimum;
    }
}
