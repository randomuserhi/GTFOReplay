import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class Dmr extends Model {
    constructor() {
        super();
        this.leftHandGrip = { x: 0.05, y: -0.05, z: 0.15 };
        this.equipOffsetPos = { x: 0, y: 0.05, z: 0.1 };

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.0497378, 0.237857, 0.08918999);
        obj0.position.set(0, -0.07353, -0.042);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.1315114, 0.03521642);
        obj1.position.set(0, -0.0682, -0.1552987);
        obj1.rotateX(0.4289075);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.037869, 0.04435147, 0.3630194);
        obj2.position.set(0, -0.02341, 0.05166);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.037869, 0.04435147, 0.1648096);
        obj3.position.set(0, 0.0089, 0.428);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.1055951, 0.2057264);
        obj4.position.set(0, -0.024, -0.04099873);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.1055951, 0.2951002);
        obj5.position.set(0, 0.019, 0.04474);

        const obj6 = new Mesh(box, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.0357471, 0.3707019);
        obj6.position.set(0, -0.0078, -0.2587287);

        const obj7 = new Mesh(box, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.1389756, 0.0302763);
        obj7.position.set(0, -0.05197025, -0.4145956);

        const obj8 = new Mesh(box, material);
        gun.add(obj8);
        obj8.scale.set(0.03, 0.01013746, 0.1772939);
        obj8.position.set(0, -0.09260009, -0.3474987);

        const obj9 = new Mesh(box, material);
        gun.add(obj9);
        obj9.scale.set(0.03, 0.01013746, 0.07575434);
        obj9.position.set(0, -0.1066, -0.2256987);
        obj9.rotateX(0.3874465);

        const obj10 = new Mesh(cylinder, material);
        gun.add(obj10);
        obj10.scale.set(0.04, 0.04, 0.05);
        obj10.position.set(0, 0.092, 0.0751);

        const obj11 = new Mesh(cylinder, material);
        gun.add(obj11);
        obj11.scale.set(0.04, 0.04, 0.2599547);
        obj11.position.set(0, 0.009, 0.162);

        this.group.add(gun);
        gun.position.set(0, 0, 0);
    }
}