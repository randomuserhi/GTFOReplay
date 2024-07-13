import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Box, UnityCylinder } from "../../../library/models/primitives.js";
import { GearModel } from "../gear.js";

export class HackingTool extends GearModel {
    constructor() {
        super();
        this.leftHandGrip = { x: 0.1, y: -0.05, z: 0 };
        this.equipOffsetPos = { x: 0.05, y: 0, z: -0.05 };
        this.equipOffsetRot = { x: -0.303235918, y: 0, z: 0, w: 0.952915549 };

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(Box, material);
        gun.add(obj0);
        obj0.scale.set(0.280664, 0.088803, 0.2921484);
        obj0.position.set(0, 0, 0);

        const obj1 = new Mesh(UnityCylinder, material);
        gun.add(obj1);
        obj1.scale.set(0.05, 0.05, 0.12006);
        obj1.position.set(-0.07, 0, 0.2481);

        const obj2 = new Mesh(UnityCylinder, material);
        gun.add(obj2);
        obj2.scale.set(0.05, 0.05, 0.05);
        obj2.position.set(0.07, 0, 0.1818);

        this.root.add(gun);
        gun.position.set(0, 0, 0);
        gun.scale.set(0.7, 0.7, 0.7);
    }
}