import { BoxGeometry, ColorRepresentation, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "./equippable.js";

const frontGeom = new BoxGeometry(0.2, 0.05, 0.1);
const backGeom = new BoxGeometry(0.1, 0.05, 0.1);

const base = new MeshPhongMaterial({
    color: 0xffffff
});

export class Keycard extends Model {
    model: Group;

    constructor(color: ColorRepresentation) {
        super();

        const material = new MeshPhongMaterial({
            color
        });
        this.model = new Group();

        const front = new Mesh(frontGeom, material);
        const back = new Mesh(backGeom, base);

        front.position.set(0.1, 0, 0);
        back.position.set(-0.05, 0, 0);

        this.model.add(front, back);
        this.group.add(this.model);
    }

    public inLevel(): void {
        this.model.position.set(-0.05, 0.025, 0);
    }
}