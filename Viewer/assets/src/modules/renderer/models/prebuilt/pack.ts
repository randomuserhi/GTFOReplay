import { BoxGeometry, ColorRepresentation, Mesh, MeshPhongMaterial } from "@esm/three";
import { ItemModel } from "../items.js";

const geometry = new BoxGeometry(0.25, 0.3, 0.1);

export class Pack extends ItemModel {
    pack: Mesh;

    constructor(color: ColorRepresentation) {
        super();
        this.leftHandGrip = { x: 0.13, y: 0.15, z: -0.1 };
        this.equipOffsetPos = { x: 0.13, y: -0.15, z: 0 };

        const material = new MeshPhongMaterial({
            color
        });
        const pack = this.pack = new Mesh(geometry, material);
        this.root.add(pack);
        pack.position.set(0, 0.15, -0.1);
    }

    public inLevel(): void {
        this.root.scale.set(0.8, 0.8, 0.8);
        this.pack.position.set(0, 0, 0.15);
        this.pack.rotation.set(-90 * Math.deg2rad, 0, 0);
    }
}