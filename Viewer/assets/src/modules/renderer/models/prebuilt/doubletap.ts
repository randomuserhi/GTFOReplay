import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Box, UnityCylinder } from "../../../library/models/primitives.js";
import { GearModel } from "../gear.js";

export class DoubleTap extends GearModel {
    constructor() {
        super();
        this.leftHandGrip = { x: 0.05, y: -0.05, z: 0.15 };
        this.equipOffsetPos = { x: 0, y: 0.05, z: 0.1 };

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(Box, material);
        gun.add(obj0);
        obj0.scale.set(0.0497378, 0.237857, 0.08918999);
        obj0.position.set(0, -0.07353, -0.042);

        const obj1 = new Mesh(Box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.1315114, 0.03521642);
        obj1.position.set(0, -0.0682, -0.1552987);
        obj1.rotateX(0.4289075);

        const obj2 = new Mesh(Box, material);
        gun.add(obj2);
        obj2.scale.set(0.037869, 0.04435147, 0.3630194);
        obj2.position.set(0, -0.02341, 0.05166);

        const obj3 = new Mesh(Box, material);
        gun.add(obj3);
        obj3.scale.set(0.037869, 0.04435147, 0.1648096);
        obj3.position.set(0, 0.0089, 0.428);

        const obj4 = new Mesh(Box, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.1055951, 0.2057264);
        obj4.position.set(0, -0.024, -0.04099873);

        const obj5 = new Mesh(Box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.1055951, 0.2205963);
        obj5.position.set(0, 0.019, 0.00749);

        const obj6 = new Mesh(Box, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.0342297, 0.05603291);
        obj6.position.set(0, 0.099, 0.013);

        const obj7 = new Mesh(Box, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.0357471, 0.3707019);
        obj7.position.set(0, -0.0078, -0.2587287);

        const obj8 = new Mesh(Box, material);
        gun.add(obj8);
        obj8.scale.set(0.03, 0.1389756, 0.0302763);
        obj8.position.set(0, -0.05197025, -0.4145956);

        const obj9 = new Mesh(UnityCylinder, material);
        gun.add(obj9);
        obj9.scale.set(0.04, 0.04, 0.2599547);
        obj9.position.set(0, 0.009, 0.162);

        const obj10 = new Mesh(Box, material);
        gun.add(obj10);
        obj10.scale.set(0.03, 0.01014, 0.17729);
        obj10.position.set(0, -0.0646, -0.3383);
        obj10.rotateX(5.62754);

        const obj11 = new Mesh(Box, material);
        gun.add(obj11);
        obj11.scale.set(0.03, 0.01014, 0.152034);
        obj11.position.set(0, -0.0444, -0.23214);

        this.root.add(gun);
        gun.position.set(0, 0, 0);
    }
}