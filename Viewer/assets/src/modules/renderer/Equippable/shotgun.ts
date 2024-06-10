import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class Shotgun extends Model {
    constructor() {
        super();
        this.leftHandGrip = { x: 0.05, y: -0.07, z: 0.3 };
        this.equipOffsetPos = { x: 0, y: 0.05, z: 0.05 };

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.0410956, 0.09767745, 0.04927183);
        obj0.position.set(0, -0.05191, -0.15026);
        obj0.rotateX(0.4289075);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.037869, 0.04435147, 0.298402);
        obj1.position.set(0, -0.0157, 0.0193);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.037869, 0.04435147, 0.1756096);
        obj2.position.set(0, -0.0157, 0.42);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.03, 0.07973589, 0.2130763);
        obj3.position.set(0, 0.01138, -0.0373);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.02219556, 0.2205963);
        obj4.position.set(0, 0.0505, 0.0066);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.02219556, 0.2205963);
        obj5.position.set(0, 0.0505, 0.456);

        const obj6 = new Mesh(box, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.0342297, 0.01637931);
        obj6.position.set(0, 0.0852, 0.002);

        const obj7 = new Mesh(box, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.01234494, 0.05881012);
        obj7.position.set(0, 0.0742598, -0.01921278);

        const obj8 = new Mesh(box, material);
        gun.add(obj8);
        obj8.scale.set(0.03, 0.0357471, 0.4382623);
        obj8.position.set(0, -0.0078, -0.29251);

        const obj9 = new Mesh(box, material);
        gun.add(obj9);
        obj9.scale.set(0.03, 0.0357471, 0.4382623);
        obj9.position.set(0, -0.0093, -0.2957);
        obj9.rotateX(6.122275);

        const obj10 = new Mesh(box, material);
        gun.add(obj10);
        obj10.scale.set(0.03, 0.09625313, 0.0302763);
        obj10.position.set(0, -0.0328, -0.5038);

        const obj11 = new Mesh(cylinder, material);
        gun.add(obj11);
        obj11.scale.set(0.03, 0.03, 0.2687742);
        obj11.position.set(0, 0.0365, 0.28917);

        const obj12 = new Mesh(cylinder, material);
        gun.add(obj12);
        obj12.scale.set(0.03, 0.03, 0.2687742);
        obj12.position.set(0, 0.0033, 0.28917);

        this.group.add(gun);
        gun.position.set(0, -0.05, 0);
    }
}