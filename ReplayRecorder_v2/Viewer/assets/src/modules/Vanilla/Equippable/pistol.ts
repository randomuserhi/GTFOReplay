import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial, Object3D } from "three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class Pistol extends Model {
    constructor() {
        super();
        this.leftHand = new Object3D();
        this.group.add(this.leftHand);
        this.leftHand.position.set(0.1, -0.1, -0.2);
        this.equipOffsetPos = { x: 0, y: 0.11, z: 0.1 };

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.0410956, 0.1315114, 0.06383834);
        obj0.position.set(0, -0.06857, -0.15395);
        obj0.rotateX(0.2668107);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.02867174, 0.2475313);
        obj1.position.set(0, 0.0244, -0.04311);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.06, 0.08393136, 0.1171156);
        obj2.position.set(0, -0.0314, 0.00592);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.02, 0.06669018, 0.1192949);
        obj3.position.set(0, -0.0178, -0.1082);

        const obj4 = new Mesh(cylinder, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.03, 0.02846787);
        obj4.position.set(0, 0.0064, 0.064);

        this.group.add(gun);
        gun.position.set(0, -0.05, 0);
    }
}