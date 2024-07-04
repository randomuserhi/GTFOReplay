import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class Rifle extends Model {
    constructor() {
        super();
        this.leftHandGrip = { x: 0.05, y: -0.05, z: 0.12 };
        this.equipOffsetPos = { x: 0, y: 0.05, z: 0.1 };

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.0497378, 0.1889599, 0.06406517);
        obj0.position.set(0, -0.099, -0.043);
        obj0.rotateX(0.447746);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.1315114, 0.03521642);
        obj1.position.set(0, -0.0682, -0.1552987);
        obj1.rotateX(0.4289075);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.037869, 0.04435147, 0.298402);
        obj2.position.set(0, -0.02341, 0.0194);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.03, 0.1172466, 0.2130763);
        obj3.position.set(0, -0.00738, -0.0373);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.02219556, 0.2205963);
        obj4.position.set(0, 0.0505, 0.0066);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.0342297, 0.03796183);
        obj5.position.set(0, 0.0871, 0.01643);

        const obj6 = new Mesh(box, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.01234494, 0.05881012);
        obj6.position.set(0, 0.07616, 0.00601);

        const obj7 = new Mesh(box, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.0357471, 0.3707019);
        obj7.position.set(0, -0.0078, -0.2587287);

        const obj8 = new Mesh(box, material);
        gun.add(obj8);
        obj8.scale.set(0.03, 0.09625313, 0.0302763);
        obj8.position.set(0, -0.03061, -0.4145956);

        const obj9 = new Mesh(cylinder, material);
        gun.add(obj9);
        obj9.scale.set(0.03, 0.03, 0.189407);
        obj9.position.set(0, 0.009, 0.0914);

        const obj10 = new Mesh(box, material);
        gun.add(obj10);
        obj10.scale.set(0.03, 0.01014, 0.106124);
        obj10.position.set(0, -0.0421, -0.3612);
        obj10.rotateX(5.62754);

        this.group.add(gun);
        gun.position.set(0, 0, 0);
    }
}