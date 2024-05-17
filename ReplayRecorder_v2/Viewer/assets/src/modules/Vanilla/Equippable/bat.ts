import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class Bat extends Model {
    constructor() {
        super();
        this.archetype = "bat";

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });
        
        const gun = new Group();

        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.05, 0.05, 0.3533964);
        obj0.position.set(0, 0, 0.18198);

        const obj1 = new Mesh(cylinder, material);
        gun.add(obj1);
        obj1.scale.set(0.03, 0.03, 0.0504137);
        obj1.position.set(0, 0, -0.0424);

        const obj2 = new Mesh(cylinder, material);
        gun.add(obj2);
        obj2.scale.set(0.04, 0.04, 0.01010042);
        obj2.position.set(0, 0, -0.10162);

        this.group.add(gun);
        gun.position.set(0, 0, -0.1);
        gun.rotateX(-Math.PI/2);
    }
}