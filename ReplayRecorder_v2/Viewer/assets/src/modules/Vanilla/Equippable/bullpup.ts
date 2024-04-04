import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class Bullpup extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.0410956, 0.1315114, 0.03521642);
        obj0.position.set(0, -0.0682, -0.1552987);
        obj0.rotateX(0.4289075);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.2186074, 0.05012001);
        obj1.position.set(0, -0.11175, -0.1916);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.0410956, 0.09767817, 0.03457178);
        obj2.position.set(0, -0.0751, 0.0946);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.037869, 0.05583414, 0.3546807);
        obj3.position.set(0, -0.0214, 0.04744);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.07335622, 0.4535162);
        obj4.position.set(0, 0.00819, -0.0255);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.02219556, 0.330034);
        obj5.position.set(0, 0.0505, -0.0481);

        const obj6 = new Mesh(box, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.0342297, 0.01637931);
        obj6.position.set(0, 0.079, -0.0369);

        const obj7 = new Mesh(box, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.01234494, 0.05881012);
        obj7.position.set(0, 0.06805997, -0.05811125);

        const obj8 = new Mesh(box, material);
        gun.add(obj8);
        obj8.scale.set(0.03, 0.0357471, 0.449385);
        obj8.position.set(0, -0.0078, -0.29807);

        const obj9 = new Mesh(box, material);
        gun.add(obj9);
        obj9.scale.set(0.03, 0.06331901, 0.302325);
        obj9.position.set(0, -0.052, -0.30321);

        const obj10 = new Mesh(box, material);
        gun.add(obj10);
        obj10.scale.set(0.03, 0.1320574, 0.03405267);
        obj10.position.set(0, -0.04851, -0.4959);

        const obj11 = new Mesh(cylinder, material);
        gun.add(obj11);
        obj11.scale.set(0.02, 0.02, 0.189407);
        obj11.position.set(0, 0.0157, 0.0759);

        this.group.add(gun);
        gun.position.set(0, -0.05, 0);
    }
}