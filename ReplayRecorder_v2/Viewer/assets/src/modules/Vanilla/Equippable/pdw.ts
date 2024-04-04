import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class PDW extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.0497378, 0.1761858, 0.05839702);
        obj0.position.set(0, -0.07160027, 0.0381);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.0497378, 0.1761858, 0.02234212);
        obj1.position.set(0, -0.07050027, 0.141);
        obj1.rotateX(0.1540222);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.0497378, 0.01857586, 0.07089891);
        obj2.position.set(0, -0.1344003, 0.0924);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.0410956, 0.1097029, 0.04153671);
        obj3.position.set(0, -0.05959, -0.14789);
        obj3.rotateX(0.4289075);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.037869, 0.04435147, 0.298402);
        obj4.position.set(0, -0.0001, 0.0193);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.07973589, 0.2130763);
        obj5.position.set(0, 0.01138, -0.0373);

        const obj6 = new Mesh(box, material);
        gun.add(obj6);
        obj6.scale.set(0.055542, 0.05659494, 0.09476041);
        obj6.position.set(0, 0.0275, 0.2605);

        const obj7 = new Mesh(box, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.02219556, 0.2205963);
        obj7.position.set(0, 0.0435, 0.0299);

        const obj8 = new Mesh(box, material);
        gun.add(obj8);
        obj8.scale.set(0.03, 0.04212581, 0.03433824);
        obj8.position.set(0, 0.0813, 0.1287);

        const obj9 = new Mesh(box, material);
        gun.add(obj9);
        obj9.scale.set(0.03, 0.01234494, 0.05881012);
        obj9.position.set(0, 0.06640989, 0.1164654);

        const obj10 = new Mesh(box, material);
        gun.add(obj10);
        obj10.scale.set(0.03, 0.0357471, 0.3092655);
        obj10.position.set(0, -0.0078, -0.22801);

        const obj11 = new Mesh(box, material);
        gun.add(obj11);
        obj11.scale.set(0.03, 0.09625313, 0.0302763);
        obj11.position.set(0, -0.03061, -0.3636);

        const obj12 = new Mesh(cylinder, material);
        gun.add(obj12);
        obj12.scale.set(0.02, 0.02, 0.1693885);
        obj12.position.set(0, 0.0273, 0.05588);

        this.group.add(gun);
        gun.position.set(0, 0, 0);
    }
}