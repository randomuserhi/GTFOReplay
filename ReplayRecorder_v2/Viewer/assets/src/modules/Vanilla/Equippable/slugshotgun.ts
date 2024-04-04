import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class SlugShotgun extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.0410956, 0.11212, 0.0502489);
        obj0.position.set(0, -0.05625, -0.1581);
        obj0.rotateX(0.4289075);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.037869, 0.04435147, 0.298402);
        obj1.position.set(0, -0.0157, 0.0193);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.03, 0.05831404, 0.2815591);
        obj2.position.set(0, 0.00067, -0.07154);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.03, 0.0342297, 0.01637931);
        obj3.position.set(0, 0.0423, -0.0531);
        obj3.rotateX(6.12903);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.01234494, 0.05881012);
        obj4.position.set(0, 0.0353, -0.0694);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.0357471, 0.3393389);
        obj5.position.set(0, -0.0078, -0.24304);

        const obj6 = new Mesh(box, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.01136651, 0.08547414);
        obj6.position.set(0, -0.0696, -0.3622701);

        const obj7 = new Mesh(box, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.01136651, 0.08547414);
        obj7.position.set(0, -0.0201, 0.1968);

        const obj8 = new Mesh(box, material);
        gun.add(obj8);
        obj8.scale.set(0.03, 0.01136651, 0.08547414);
        obj8.position.set(0, -0.0418, -0.2921);
        obj8.rotateX(5.538943);

        const obj9 = new Mesh(box, material);
        gun.add(obj9);
        obj9.scale.set(0.03, 0.01136651, 0.05788821);
        obj9.position.set(0, -0.00324, 0.25575);
        obj9.rotateX(5.538943);

        const obj10 = new Mesh(box, material);
        gun.add(obj10);
        obj10.scale.set(0.03, 0.09625313, 0.0302763);
        obj10.position.set(0, -0.03061, -0.3863001);

        const obj11 = new Mesh(cylinder, material);
        gun.add(obj11);
        obj11.scale.set(0.02, 0.02, 0.2283453);
        obj11.position.set(0, 0.0157, 0.1148);

        this.group.add(gun);
        gun.position.set(0, 0, 0);
    }
}