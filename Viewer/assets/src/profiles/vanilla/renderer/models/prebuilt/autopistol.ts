import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Box, UnityCylinder } from "../../../library/models/primitives.js";
import { GearModel } from "../gear.js";

export class AutoPistol extends GearModel {
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
        obj0.scale.set(0.0410956, 0.1383457, 0.06383834);
        obj0.position.set(0, -0.0719, -0.1549);
        obj0.rotateX(0.2668107);

        const obj1 = new Mesh(Box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.03971954, 0.2785897);
        obj1.position.set(0, 0.01888, -0.09203);

        const obj2 = new Mesh(Box, material);
        gun.add(obj2);
        obj2.scale.set(0.0410956, 0.02000157, 0.1520749);
        obj2.position.set(0, 0.0398, -0.14259);

        const obj3 = new Mesh(Box, material);
        gun.add(obj3);
        obj3.scale.set(0.06, 0.05582863, 0.09491401);
        obj3.position.set(0, -0.01735, -0.00518);

        const obj4 = new Mesh(Box, material);
        gun.add(obj4);
        obj4.scale.set(0.02, 0.05022704, 0.1192949);
        obj4.position.set(0, -0.00957, -0.1082);

        const obj5 = new Mesh(UnityCylinder, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.03, 0.02846787);
        obj5.position.set(0, 0.0064, 0.0284);

        const obj6 = new Mesh(UnityCylinder, material);
        gun.add(obj6);
        obj6.scale.set(0.15, 0.15, 0.04749237);
        obj6.position.set(0, -0.2021, -0.1799);
        obj6.rotateX(0.2869670352090247);

        this.root.add(gun);
        gun.position.set(0, -0.05, 0);
    }
}