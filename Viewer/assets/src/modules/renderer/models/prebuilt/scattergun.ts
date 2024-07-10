import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Box, UnityCylinder } from "../../../library/models/primitives.js";
import { GearModel } from "../gear.js";

export class ScatterGun extends GearModel {
    constructor() {
        super();
        this.leftHandGrip = { x: 0.05, y: -0.1, z: 0.1 };
        this.equipOffsetPos = { x: 0, y: 0.05, z: 0.1 };

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(Box, material);
        gun.add(obj0);
        obj0.scale.set(0.0410956, 0.09767745, 0.04927183);
        obj0.position.set(0, -0.05191, -0.15026);
        obj0.rotateX(0.4289075);

        const obj1 = new Mesh(Box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.1151539, 0.1329722);
        obj1.position.set(0, -0.06624, 0.00694);
        obj1.rotateX(6.023431);

        const obj2 = new Mesh(Box, material);
        gun.add(obj2);
        obj2.scale.set(0.037869, 0.04718686, 0.2872686);
        obj2.position.set(0, -0.01712, 0.02487);

        const obj3 = new Mesh(Box, material);
        gun.add(obj3);
        obj3.scale.set(0.07436337, 0.06246018, 0.2959407);
        obj3.position.set(0, 0.0025, 0.10783);

        const obj4 = new Mesh(Box, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.07973589, 0.2130763);
        obj4.position.set(0, 0.01138, -0.0373);

        const obj5 = new Mesh(Box, material);
        gun.add(obj5);
        obj5.scale.set(0.044685, 0.02219556, 0.2205963);
        obj5.position.set(0, 0.0505, 0.0066);

        const obj6 = new Mesh(Box, material);
        gun.add(obj6);
        obj6.scale.set(0.008234099, 0.0342297, 0.01637931);
        obj6.position.set(0, 0.0768, 0.079);

        const obj7 = new Mesh(Box, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.0357471, 0.4382623);
        obj7.position.set(0, -0.0078, -0.29251);

        const obj8 = new Mesh(Box, material);
        gun.add(obj8);
        obj8.scale.set(0.03, 0.0357471, 0.4382623);
        obj8.position.set(0, -0.0093, -0.2957);
        obj8.rotateX(6.122275);

        const obj9 = new Mesh(Box, material);
        gun.add(obj9);
        obj9.scale.set(0.03, 0.09625313, 0.0302763);
        obj9.position.set(0, -0.0328, -0.5038);

        const obj10 = new Mesh(UnityCylinder, material);
        gun.add(obj10);
        obj10.scale.set(0.03, 0.03, 0.1257164);
        obj10.position.set(0, 0.0294, 0.14924);

        this.root.add(gun);
        gun.position.set(0, -0.05, 0);
    }
}