import { BoxGeometry, ColorRepresentation, Mesh, MeshPhongMaterial } from "three";
import { Model } from "../equippable.js";

export class Pack extends Model {
    constructor(color: ColorRepresentation) {
        super();

        const geometry = new BoxGeometry(0.3, 0.3, 0.1);
        const material = new MeshPhongMaterial({
            color
        });
        const pack = new Mesh(geometry, material);
        this.group.add(pack);
        pack.position.set(0, 0.15, -0.1);
    }
}