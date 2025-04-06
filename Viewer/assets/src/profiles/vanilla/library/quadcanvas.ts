import { html } from "@esm/@/rhu/html.js";
import { BufferAttribute, BufferGeometry, Group, Material, Mesh, MeshBasicMaterial, Object3D, SRGBColorSpace, Texture } from "@esm/three";

export const quadGeometry = new BufferGeometry();
const vertices = new Float32Array([
    -1.0, -1.0, 0.0,
    1.0, -1.0, 0.0,
    1.0,  1.0, 0.0,

    -1.0, -1.0, 0.0,
    1.0,  1.0, 0.0,
    -1.0,  1.0, 0.0
]);
const uvs = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,

    0.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
]);
quadGeometry.setAttribute('position', new BufferAttribute(vertices, 3));
quadGeometry.setAttribute('uv', new BufferAttribute(uvs, 2));

export class QuadCanvas {
    private readonly texture: Texture;

    readonly ctx: CanvasRenderingContext2D;
    readonly material: Material;

    readonly root: Object3D;

    constructor(width: number, height: number, material?: Material) {
        const wrapper = html<{ canvas: HTMLCanvasElement }>`<canvas m-id="canvas" style="display: none;" width="${width.toString()}" height="${height.toString()}"></canvas>`;
        this.ctx = wrapper.canvas.getContext("2d")!;
        this.texture = new Texture(wrapper.canvas);
        this.texture.colorSpace = SRGBColorSpace;

        this.material = material === undefined ? new MeshBasicMaterial({ map: this.texture, transparent: true }) : material;
        const mesh = new Mesh(quadGeometry, this.material);
        mesh.scale.set(1, height / width, 1);
        
        this.root = new Group();
        this.root.add(mesh);
    }

    public update() {
        this.texture.needsUpdate = true;
    }
}