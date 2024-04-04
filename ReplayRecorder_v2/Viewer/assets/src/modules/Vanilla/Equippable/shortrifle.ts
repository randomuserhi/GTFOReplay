import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class ShortRifle extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.0497378, 0.2467497, 0.04745115);
        obj0.position.set(0, -0.1132, 0.0128);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.0497378, 0.1100046, 0.0370476);
        obj1.position.set(0, -0.0584, 0.1197);
        obj1.rotateX(0.447746);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.0410956, 0.1185181, 0.05987848);
        obj2.position.set(0, -0.0674, -0.1414);
        obj2.rotateX(0.4289075);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.037869, 0.04435147, 0.298402);
        obj3.position.set(0, -0.0157, 0.0193);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.07973589, 0.2130763);
        obj4.position.set(0, 0.01138, -0.0373);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.01698183, 0.2372733);
        obj5.position.set(0, 0.0479, -0.0017);

        const obj6 = new Mesh(box, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.08901065, 0.02226257);
        obj6.position.set(0, 0.08391, 0.10577);

        const obj7 = new Mesh(box, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.0342297, 0.01637931);
        obj7.position.set(0, 0.1343403, -0.0414);

        const obj8 = new Mesh(box, material);
        gun.add(obj8);
        obj8.scale.set(0.03, 0.01234494, 0.1652272);
        obj8.position.set(0, 0.122, 0.026);

        const obj9 = new Mesh(box, material);
        gun.add(obj9);
        obj9.scale.set(0.03, 0.01234494, 0.1099873);
        obj9.position.set(0, 0.0852, -0.0915);
        obj9.rotateX(5.514773);

        const obj10 = new Mesh(box, material);
        gun.add(obj10);
        obj10.scale.set(0.03, 0.0357471, 0.3316299);
        obj10.position.set(0, -0.0078, -0.2392);

        const obj11 = new Mesh(box, material);
        gun.add(obj11);
        obj11.scale.set(0.03, 0.02097604, 0.2578471);
        obj11.position.set(0, -0.0495, -0.2785);

        const obj12 = new Mesh(box, material);
        gun.add(obj12);
        obj12.scale.set(0.03, 0.1125113, 0.0302763);
        obj12.position.set(0, -0.03874, -0.379);

        const obj13 = new Mesh(box, material);
        gun.add(obj13);
        obj13.scale.set(0.03, 0.0905243, 0.06791853);
        obj13.position.set(0, -0.0267, -0.2880051);

        const obj14 = new Mesh(cylinder, material);
        gun.add(obj14);
        obj14.scale.set(0.02, 0.02, 0.1658637);
        obj14.position.set(0, 0.0157, 0.0524);

        this.group.add(gun);
        gun.position.set(0, 0, 0);
    }
}