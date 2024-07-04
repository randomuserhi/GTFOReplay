import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class HackingTool extends Model {
    constructor() {
        super();
        this.leftHandGrip = { x: 0.1, y: -0.05, z: 0 };
        this.equipOffsetPos = { x: 0.05, y: 0, z: -0.05 };
        this.equipOffsetRot = { x: -0.303235918, y: 0, z: 0, w: 0.952915549 };

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.280664, 0.088803, 0.2921484);
        obj0.position.set(0, 0, 0);

        const obj1 = new Mesh(cylinder, material);
        gun.add(obj1);
        obj1.scale.set(0.05, 0.05, 0.12006);
        obj1.position.set(-0.07, 0, 0.2481);

        const obj2 = new Mesh(cylinder, material);
        gun.add(obj2);
        obj2.scale.set(0.05, 0.05, 0.05);
        obj2.position.set(0.07, 0, 0.1818);

        this.group.add(gun);
        gun.position.set(0, 0, 0);
        gun.scale.set(0.7, 0.7, 0.7);
    }
}