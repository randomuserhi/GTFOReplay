import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Box, UnityCylinder } from "../../../library/models/primitives.js";
import { GearModel } from "../gear.js";

export class PrecisionRifle extends GearModel {
    constructor() {
        super();
        this.leftHandGrip = { x: 0.05, y: -0.05, z: 0.1 };
        this.equipOffsetPos = { x: 0, y: 0.05, z: 0.05 };

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(Box, material);
        gun.add(obj0);
        obj0.scale.set(0.0497378, 0.2111767, 0.1183065);
        obj0.position.set(0, -0.0774, 0.0164);

        const obj1 = new Mesh(Box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.1315114, 0.06195167);
        obj1.position.set(0, -0.07376, -0.14314);
        obj1.rotateX(0.4289075);

        const obj2 = new Mesh(Box, material);
        gun.add(obj2);
        obj2.scale.set(0.037869, 0.04435147, 0.298402);
        obj2.position.set(0, -0.0157, 0.0193);

        const obj3 = new Mesh(Box, material);
        gun.add(obj3);
        obj3.scale.set(0.03, 0.07973589, 0.2130763);
        obj3.position.set(0, 0.01138, -0.0373);

        const obj4 = new Mesh(Box, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.02219556, 0.2205963);
        obj4.position.set(0, 0.0505, 0.0066);

        const obj5 = new Mesh(Box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.02219556, 0.21374);
        obj5.position.set(0, 0.036, 0.1519);

        const obj6 = new Mesh(Box, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.02219556, 0.09347501);
        obj6.position.set(0, -0.019, 0.489);

        const obj7 = new Mesh(Box, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.02219556, 0.4130156);
        obj7.position.set(0, -0.0044, 0.34007);

        const obj8 = new Mesh(Box, material);
        gun.add(obj8);
        obj8.scale.set(0.03, 0.0342297, 0.04281584);
        obj8.position.set(0, 0.0871, -0.04896684);

        const obj9 = new Mesh(Box, material);
        gun.add(obj9);
        obj9.scale.set(0.03, 0.01234494, 0.07074623);
        obj9.position.set(0, 0.07616, -0.051);

        const obj10 = new Mesh(Box, material);
        gun.add(obj10);
        obj10.scale.set(0.03, 0.02615615, 0.2149003);
        obj10.position.set(-0.00119, -0.06117, -0.26642);
        obj10.rotateX(0.4144463);
        obj10.rotateY(6.259483);
        obj10.rotateZ(6.254691);

        const obj11 = new Mesh(Box, material);
        gun.add(obj11);
        obj11.scale.set(0.03, 0.09625313, 0.0302763);
        obj11.position.set(0, -0.04980985, -0.4323988);

        const obj12 = new Mesh(Box, material);
        gun.add(obj12);
        obj12.scale.set(0.03, 0.07262106, 0.169676);
        obj12.position.set(0, -0.0413, -0.35495);

        const obj13 = new Mesh(UnityCylinder, material);
        gun.add(obj13);
        obj13.scale.set(0.02, 0.02, 0.3574716);
        obj13.position.set(0, 0.0157, 0.24393);

        const obj14 = new Mesh(UnityCylinder, material);
        gun.add(obj14);
        obj14.scale.set(0.03, 0.03, 0.03796196);
        obj14.position.set(0, 0.0157, 0.6372);

        this.root.add(gun);
        gun.position.set(0, 0, 0);
    }
}