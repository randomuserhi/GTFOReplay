import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class BurstCannon extends Model {
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
        obj0.scale.set(0.0497378, 0.126667, 0.06514188);
        obj0.position.set(0, -0.05009985, -0.03310013);
        obj0.rotateX(6.095742);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.1049198, 0.04734144);
        obj1.position.set(0, -0.0586, -0.1487);
        obj1.rotateX(0.4289075);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.037869, 0.04435147, 0.2120743);
        obj2.position.set(0, -0.0157, -0.0239);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.037869, 0.06242469, 0.2120743);
        obj3.position.set(0, -0.042, 0.133);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.07973589, 0.2130763);
        obj4.position.set(0, 0.01138, -0.0373);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.02219556, 0.2205963);
        obj5.position.set(0, 0.047, 0.008);

        const obj6 = new Mesh(box, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.012303, 0.06619476);
        obj6.position.set(0, 0.0441, 0.257);

        const obj7 = new Mesh(box, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.02765657, 0.03147923);
        obj7.position.set(0, 0.0853, -0.0498);
        obj7.rotateX(0.2704109);

        const obj8 = new Mesh(box, material);
        gun.add(obj8);
        obj8.scale.set(0.03, 0.01234494, 0.05881012);
        obj8.position.set(0, 0.0708, -0.041);

        const obj9 = new Mesh(box, material);
        gun.add(obj9);
        obj9.scale.set(0.03, 0.0496663, 0.3707019);
        obj9.position.set(0, -0.00084, -0.2587287);

        const obj10 = new Mesh(box, material);
        gun.add(obj10);
        obj10.scale.set(0.03, 0.09972017, 0.0302763);
        obj10.position.set(0, -0.03234, -0.4145956);

        const obj11 = new Mesh(box, material);
        gun.add(obj11);
        obj11.scale.set(0.0186483, 0.06727422, 0.1939193);
        obj11.position.set(0, -0.0256, -0.3223);

        const obj12 = new Mesh(cylinder, material);
        gun.add(obj12);
        obj12.scale.set(0.02, 0.02, 0.189407);
        obj12.position.set(0, -0.013, 0.0836);

        const obj13 = new Mesh(cylinder, material);
        gun.add(obj13);
        obj13.scale.set(0.03, 0.03, 0.1907139);
        obj13.position.set(0, 0.018, 0.1228);

        const obj14 = new Mesh(cylinder, material);
        gun.add(obj14);
        obj14.scale.set(0.12, 0.12, 0.03488424);
        obj14.position.set(0, -0.1136, -0.016);
        obj14.rotateX(-0.2208038);

        this.group.add(gun);
        gun.position.set(0, 0, 0);
    }
}