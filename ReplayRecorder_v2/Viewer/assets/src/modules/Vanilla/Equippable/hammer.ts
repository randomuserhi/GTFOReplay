import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "../equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(1, 1, 1, 10, 10).rotateX(Math.PI * 0.5);

export class Hammer extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });
        const head = new Mesh(box, material);
        head.scale.set(0.1, 0.1, 0.3);

        const handle = new Mesh(cylinder, material);
        handle.scale.set(0.02, 0.02, 0.9);
        handle.rotateX(Math.PI / 2);
        
        const hammer = new Group();
        hammer.add(head);
        hammer.add(handle);
        head.position.set(0, 0.5, 0);
        
        this.group.add(hammer);
        hammer.position.set(0, 0, -0.1);
    }
}