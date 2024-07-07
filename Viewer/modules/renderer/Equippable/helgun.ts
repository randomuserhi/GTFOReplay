import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class HelGun extends Model {
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
        obj0.scale.set(0.0497378, 0.1761858, 0.05839702);
        obj0.position.set(0, -0.092, -0.028);
        obj0.rotateX(5.961857);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.09327051, 0.06040947);
        obj1.position.set(0, -0.04525, -0.16793);
        obj1.rotateX(0.4289075);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.037869, 0.05055657, 0.3060783);
        obj2.position.set(0, -0.00908, -0.02487);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.037869, 0.01577099, 0.2941685);
        obj3.position.set(0, -0.0204, 0.08078);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.037869, 0.06099853, 0.1772647);
        obj4.position.set(0, -0.0514, 0.10996);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.07973589, 0.2008375);
        obj5.position.set(0, 0.01138, -0.0312);

        const obj6 = new Mesh(box, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.05501537, 0.08391955);
        obj6.position.set(0, -0.01374, -0.37321);

        const obj7 = new Mesh(box, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.02219556, 0.321238);
        obj7.position.set(0, 0.0505, 0.0569);

        const obj8 = new Mesh(box, material);
        gun.add(obj8);
        obj8.scale.set(0.03, 0.02219556, 0.06145039);
        obj8.position.set(0, 0.073, 0.182);

        const obj9 = new Mesh(box, material);
        gun.add(obj9);
        obj9.scale.set(0.03, 0.0342297, 0.01637931);
        obj9.position.set(0, 0.0871, 0.02722);

        const obj10 = new Mesh(box, material);
        gun.add(obj10);
        obj10.scale.set(0.03, 0.01234494, 0.05881012);
        obj10.position.set(0, 0.07616, 0.00601);

        const obj11 = new Mesh(box, material);
        gun.add(obj11);
        obj11.scale.set(0.03, 0.02467765, 0.211518);
        obj11.position.set(0, -0.04244, -0.24942);
        obj11.rotateX(0.4221289);

        const obj12 = new Mesh(box, material);
        gun.add(obj12);
        obj12.scale.set(0.03, 0.09625313, 0.0302763);
        obj12.position.set(0, -0.03061, -0.4145956);

        const obj13 = new Mesh(cylinder, material);
        gun.add(obj13);
        obj13.scale.set(0.02, 0.02, 0.189407);
        obj13.position.set(0, 0.022, 0.0759);

        const obj14 = new Mesh(cylinder, material);
        gun.add(obj14);
        obj14.scale.set(0.02, 0.02, 0.07108361);
        obj14.position.set(0, -0.0034, 0.166);

        const obj15 = new Mesh(cylinder, material);
        gun.add(obj15);
        obj15.scale.set(0.03, 0.03, 0.03616294);
        obj15.position.set(0, 0.022, 0.2937);

        this.group.add(gun);
        gun.position.set(0, 0, 0);
    }
}