import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class Hammer extends Model {
    constructor() {
        super();
        this.archetype = "hammer";

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });
        
        const gun = new Group();

        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.0334233, 0.0334233, 0.1212325);
        obj0.position.set(0, 0, -0.46);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.08793337, 0.07546005, 0.1212325);
        obj1.position.set(0, 0.0779, 0.357);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.08793337, 0.07546005, 0.1212325);
        obj2.position.set(0, -0.0779, 0.357);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.0334233, 0.0334233, 0.04840572);
        obj3.position.set(0, 0, 0.348);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.0334233, 0.1351984, 0.01398314);
        obj4.position.set(0, 0, 0.3385);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.0334233, 0.1351984, 0.01398314);
        obj5.position.set(0, 0, 0.3777);

        const obj6 = new Mesh(cylinder, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.03, 0.3740935);
        obj6.position.set(0, 0, -0.0424);

        this.group.add(gun);
        gun.position.set(0, 0, -0.1);
        gun.rotateX(-Math.PI/2);
    }
}