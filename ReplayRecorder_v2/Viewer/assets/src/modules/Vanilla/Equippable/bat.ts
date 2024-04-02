import { BoxGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "../equippable.js";

const box = new BoxGeometry(1, 1, 1);
//const cylinder = new CylinderGeometry(1, 1, 1, 10, 10).translate(0, 0.5, 0).rotateX(Math.PI * 0.5);

export class Bat extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });
        const head = new Mesh(box, material);
        head.scale.set(0.07, 0.5, 0.07);

        //const handle = new Mesh(box, material);
        //handle.scale.set(0.02, 0.02, 0.8);

        const bat = new Group();
        bat.add(head);
        head.position.set(0, 0.2, 0);
        //bat.add(handle);

        this.group.add(bat);
        //bat.position.set(0, 0.1, -0.5);
    }
}