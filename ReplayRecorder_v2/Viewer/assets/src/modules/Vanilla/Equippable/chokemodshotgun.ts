import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class ChokeModShotgun extends Model {
    constructor() {
        super();
        this.leftHandGrip = { x: 0.05, y: -0.1, z: 0.2 };
        this.equipOffsetPos = { x: 0, y: 0.05, z: 0.07 };

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.0497378, 0.0876063, 0.03809471);
        obj0.position.set(0, -0.0462, 0.281);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.1315114, 0.06032886);
        obj1.position.set(0, -0.046, -0.145);
        obj1.rotateX(0.4289075);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.037869, 0.04435147, 0.298402);
        obj2.position.set(0, -0.0157, 0.0193);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.03, 0.07973589, 0.2130763);
        obj3.position.set(0, 0.01138, -0.0373);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.02219556, 0.4737746);
        obj4.position.set(0, 0.046, 0.1332);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.0342297, 0.01637931);
        obj5.position.set(0, 0.0871, 0.02722);

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

        const obj9 = new Mesh(box, material);
        gun.add(obj9);
        obj9.scale.set(0.03, 0.02695687, 0.1388388);
        obj9.position.set(0, 0.01, -0.352);

        const obj10 = new Mesh(box, material);
        gun.add(obj10);
        obj10.scale.set(0.03, 0.02159728, 0.07750067);
        obj10.position.set(0, -0.0616, -0.388);

        const obj11 = new Mesh(box, material);
        gun.add(obj11);
        obj11.scale.set(0.03, 0.02159728, 0.07750067);
        obj11.position.set(0, -0.0401, -0.3237);
        obj11.rotateX(5.616195);

        const obj12 = new Mesh(cylinder, material);
        gun.add(obj12);
        obj12.scale.set(0.03, 0.03, 0.2448085);
        obj12.position.set(0, -0.005, 0.1313);

        const obj13 = new Mesh(cylinder, material);
        gun.add(obj13);
        obj13.scale.set(0.03, 0.03, 0.2448085);
        obj13.position.set(0, 0.01629992, 0.1313);

        this.group.add(gun);
        gun.position.set(0, -0.05, 0);
    }
}