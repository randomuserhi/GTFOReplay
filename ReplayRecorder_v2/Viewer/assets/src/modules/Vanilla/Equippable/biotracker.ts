import { BoxGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);

export class Biotracker extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });
        
        const gun = new Group();

        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.045, 0.1443797, 0.04541446);
        obj0.position.set(0, -0.07920027, -0.6484528);
        obj0.rotateX(6.063982);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.1522427, 0.046295, 0.1532009);
        obj1.position.set(0, -0.01815033, -0.2219124);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.045, 0.03095198, 0.3403148);
        obj2.position.set(0, -0.04277992, -0.461998);
        obj2.rotateX(6.122219);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.045, 0.03261864, 0.07868382);
        obj3.position.set(0, -0.1060505, 0.0831604);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.1479713, 0.03271648, 0.1020215);
        obj4.position.set(0, 0.07964993, 0.03675079);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.1479713, 0.1582975, 0.04312347);
        obj5.position.set(0, -0.05122519, 0.1386642);

        const obj6 = new Mesh(box, material);
        gun.add(obj6);
        obj6.scale.set(0.1945276, 0.1899304, 0.2166208);
        obj6.position.set(0, -0.03541517, -0.05397034);

        const obj7 = new Mesh(box, material);
        gun.add(obj7);
        obj7.scale.set(0.2336167, 0.02300992, 0.1438849);
        obj7.position.set(0, 0.09420013, -0.1688995);
        obj7.rotateX(5.401288);

        const obj8 = new Mesh(box, material);
        gun.add(obj8);
        obj8.scale.set(0.1261532, 0.060327, 0.1337591);
        obj8.position.set(0, -0.06674957, -0.1741486);
        obj8.rotateX(0.7671522);

        const obj9 = new Mesh(box, material);
        gun.add(obj9);
        obj9.scale.set(0.0616434, 0.1750842, 0.04855077);
        obj9.position.set(0, -0.137445, -0.2608643);
        obj9.rotateX(0.7671522);

        this.group.add(gun);
        gun.position.set(0, 0, 0);

        this.offsetPos = { x: 0, y: -0.15, z: 0.3 };
    }
}