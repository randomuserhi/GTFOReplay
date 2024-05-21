import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class AssaultRifle extends Model {
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
        obj0.scale.set(0.0497378, 0.1349424, 0.08918999);
        obj0.position.set(0, -0.03814268, -0.06234741);
        obj0.rotateX(6.19941);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.1315114, 0.03521642);
        obj1.position.set(0, -0.0682, -0.1552987);
        obj1.rotateX(0.4289075);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.037869, 0.04435147, 0.2733487);
        obj2.position.set(0, -0.02341, 0.00682);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.03, 0.1172466, 0.1720161);
        obj3.position.set(0, -0.00738, -0.05786);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.03998753, 0.2205963);
        obj4.position.set(0, 0.0416, 0.0066);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.0342297, 0.01707155);
        obj5.position.set(0, 0.082, 0.072);

        const obj6 = new Mesh(box, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.01234494, 0.05881012);
        obj6.position.set(0, 0.07105975, 0.05113024);

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
        obj9.scale.set(0.02, 0.02, 0.1549122);
        obj9.position.set(0, 0.009, 0.05696);

        const obj10 = new Mesh(cylinder, material);
        gun.add(obj10);
        obj10.scale.set(0.13, 0.13, 0.05477613);
        obj10.position.set(0, -0.1426, -0.053);
        obj10.rotateX(-0.07310271);

        const obj11 = new Mesh(box, material);
        gun.add(obj11);
        obj11.scale.set(0.03, 0.01014, 0.106124);
        obj11.position.set(0, -0.0421, -0.3612);
        obj11.rotateX(5.62754);

        this.group.add(gun);
        gun.scale.set(1.1, 1.1, 1.1);
        gun.position.set(0, 0, 0);
    }
}