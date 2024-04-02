import { BoxGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "../equippable.js";

const box = new BoxGeometry(1, 1, 1);
//const cylinder = new CylinderGeometry(1, 1, 1, 10, 10).translate(0, 0.5, 0).rotateX(Math.PI * 0.5);

export class Dmr extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const box0 = new Mesh(box, material);
        gun.add(box0);
        box0.scale.set(0.07, 0.1, 0.6);
        box0.position.set(0, 0, 0.2);

        const box1 = new Mesh(box, material);
        gun.add(box1);
        box1.scale.set(0.07, 0.2, 0.1);
        box1.position.set(0, -0.1, -0.2);
        box1.rotateX(45);

        this.group.add(gun);
    }
}