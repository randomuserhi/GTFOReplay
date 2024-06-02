import { BoxGeometry, ColorRepresentation, Mesh, MeshPhongMaterial } from "three";
import { Model } from "./equippable.js";

const geometry = new BoxGeometry(0.3, 0.3, 0.1);

export class Pack extends Model {
    pack: Mesh;

    constructor(color: ColorRepresentation) {
        super();
        this.leftHandGrip = { x: 0.13, y: 0.15, z: -0.1 };
        this.equipOffsetPos = { x: 0.13, y: -0.15, z: 0 };

        const material = new MeshPhongMaterial({
            color
        });
        const pack = this.pack = new Mesh(geometry, material);
        this.group.add(pack);
        pack.position.set(0, 0.15, -0.1);
    }

    public inLevel(): void {
        this.group.scale.set(0.8, 0.8, 0.8);
        this.pack.position.set(0, 0, 0.15);
        this.pack.rotation.set(-90 * Math.deg2rad, 0, 0);
    }
}