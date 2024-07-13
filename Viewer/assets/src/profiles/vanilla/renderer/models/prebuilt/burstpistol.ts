import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Box } from "../../../library/models/primitives.js";
import { GearModel } from "../gear.js";

export class BurstPistol extends GearModel {
    constructor() {
        super();
        this.leftHandGrip = { x: 0.05, y: -0.1, z: -0.2 };
        this.equipOffsetPos = { x: 0, y: 0.11, z: 0.1 };

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(Box, material);
        gun.add(obj0);
        obj0.scale.set(0.0410956, 0.1315114, 0.06383834);
        obj0.position.set(0, -0.06857, -0.15395);
        obj0.rotateX(0.2668107);

        const obj1 = new Mesh(Box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.02867174, 0.2475313);
        obj1.position.set(0, 0.0244, -0.04311);

        const obj2 = new Mesh(Box, material);
        gun.add(obj2);
        obj2.scale.set(0.06, 0.04642076, 0.1171156);
        obj2.position.set(0, -0.01042, 0.00592);

        const obj3 = new Mesh(Box, material);
        gun.add(obj3);
        obj3.scale.set(0.02, 0.03688501, 0.1192949);
        obj3.position.set(0, -0.0029, -0.1082);

        this.root.add(gun);
        gun.position.set(0, -0.05, 0);
    }
}