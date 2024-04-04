import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class HelRifle extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.0497378, 0.1161867, 0.1137586);
        obj0.position.set(0, -0.081, -0.02);
        obj0.rotateX(6.180453);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.1315114, 0.03521642);
        obj1.position.set(0, -0.0682, -0.1552987);
        obj1.rotateX(0.4289075);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.04664325, 0.04435147, 0.6777142);
        obj2.position.set(0, -0.0157, 0.209);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.03, 0.07973589, 0.2130763);
        obj3.position.set(0, 0.01138, -0.0373);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.02219556, 0.4022352);
        obj4.position.set(0, 0.0505, 0.0974);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.02219556, 0.1039229);
        obj5.position.set(0, 0.069, 0.2463);

        const obj6 = new Mesh(box, material);
        gun.add(obj6);
        obj6.scale.set(0.069084, 0.04705215, 0.6877394);
        obj6.position.set(0, -0.0529, 0.20316);

        const obj7 = new Mesh(box, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.01234494, 0.127831);
        obj7.position.set(0, 0.07616, -0.0047);

        const obj8 = new Mesh(box, material);
        gun.add(obj8);
        obj8.scale.set(0.03, 0.0357471, 0.3707019);
        obj8.position.set(0, -0.0078, -0.2587287);

        const obj9 = new Mesh(box, material);
        gun.add(obj9);
        obj9.scale.set(0.03, 0.01310524, 0.1939345);
        obj9.position.set(0, -0.0913, -0.2765);
        obj9.rotateX(0.2439756);

        const obj10 = new Mesh(box, material);
        gun.add(obj10);
        obj10.scale.set(0.03, 0.09625313, 0.08155952);
        obj10.position.set(0, -0.03061, -0.38896);

        const obj11 = new Mesh(box, material);
        gun.add(obj11);
        obj11.scale.set(0.03, 0.09625313, 0.01511706);
        obj11.position.set(0, -0.03061, -0.4523);

        const obj12 = new Mesh(cylinder, material);
        gun.add(obj12);
        obj12.scale.set(0.03, 0.03, 0.3316431);
        obj12.position.set(0, 0.015, 0.2181);

        const obj13 = new Mesh(cylinder, material);
        gun.add(obj13);
        obj13.scale.set(0.03, 0.03, 0.02649803);
        obj13.position.set(0, 0.1032748, -0.00799942);

        this.group.add(gun);
        gun.position.set(0, 0, 0);
    }
}