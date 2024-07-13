import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Box, UnityCylinder } from "../../../library/models/primitives.js";
import { GearModel } from "../gear.js";

export class SawedOff extends GearModel {
    constructor() {
        super();
        this.leftHandGrip = { x: 0.1, y: -0.1, z: -0.2 };
        this.equipOffsetPos = { x: 0, y: 0.05, z: 0.07 };
        this.fold = new Group();

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(Box, material);
        gun.add(obj0);
        obj0.scale.set(0.02869747, 0.1925871, 0.05538205);
        obj0.position.set(0, -0.06185, -0.14298);
        obj0.rotateX(0.5842004);

        const obj1 = new Mesh(Box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.02148902, 0.1346794);
        obj1.position.set(0, -0.0389, -0.0604);

        gun.add(this.fold);
        this.fold.position.set(0, -0.0291, 0.0055);

        const obj2 = new Mesh(UnityCylinder, material);
        this.fold.add(obj2);
        obj2.scale.set(0.025, 0.025, 0.07497258);
        obj2.position.set(0, 0.04029995, -0.02490155);

        const obj3 = new Mesh(UnityCylinder, material);
        this.fold.add(obj3);
        obj3.scale.set(0.025, 0.025, 0.07497258);
        obj3.position.set(0.0125, 0.01790005, -0.02490155);

        const obj4 = new Mesh(UnityCylinder, material);
        this.fold.add(obj4);
        obj4.scale.set(0.025, 0.025, 0.07497258);
        obj4.position.set(-0.0125, 0.01790005, -0.02490155);

        this.root.add(gun);
        gun.scale.set(1.1, 1.1, 1.1);
        gun.position.set(0, 0, 0);
    }
}