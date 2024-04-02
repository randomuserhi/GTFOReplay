import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "../equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class CombatShotgun extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.0497378, 0.1761858, 0.05839702);
        obj0.position.set(0, -0.0643, -0.0075);
        obj0.rotateX(6.032452);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.1031773, 0.04501398);
        obj1.position.set(0, -0.0414, -0.1489);
        obj1.rotateX(0.4289075);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.037869, 0.04435147, 0.4136925);
        obj2.position.set(0, -0.0288, 0.0728);
        obj2.rotateX(0.09973836);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.03, 0.07973589, 0.2130763);
        obj3.position.set(0, 0.01138, -0.0373);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.04103448, 0.2289519);
        obj4.position.set(0, -0.02195, 0.1651);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.02219556, 0.3818896);
        obj5.position.set(0, 0.0505, 0.08725);

        const obj6 = new Mesh(box, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.0342297, 0.01637931);
        obj6.position.set(0, 0.08294007, -0.02700745);

        const obj7 = new Mesh(box, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.01234494, 0.05881012);
        obj7.position.set(0, 0.072, -0.036);

        const obj8 = new Mesh(box, material);
        gun.add(obj8);
        obj8.scale.set(0.03, 0.02856015, 0.1839756);
        obj8.position.set(0, 0.0162, -0.1643);
        obj8.rotateX(6.131701);

        const obj9 = new Mesh(box, material);
        gun.add(obj9);
        obj9.scale.set(0.03, 0.02856015, 0.1839756);
        obj9.position.set(0, 0.0028, -0.3348);

        const obj10 = new Mesh(box, material);
        gun.add(obj10);
        obj10.scale.set(0.03, 0.09625313, 0.0302763);
        obj10.position.set(0, -0.023, -0.4145956);

        const obj11 = new Mesh(cylinder, material);
        gun.add(obj11);
        obj11.scale.set(0.03, 0.03, 0.189407);
        obj11.position.set(0, 0.031, 0.098);

        const obj12 = new Mesh(cylinder, material);
        gun.add(obj12);
        obj12.scale.set(0.03, 0.03, 0.189407);
        obj12.position.set(0, -0.0015, 0.098);

        this.group.add(gun);
        gun.position.set(0, -0.05, 0);
    }
}