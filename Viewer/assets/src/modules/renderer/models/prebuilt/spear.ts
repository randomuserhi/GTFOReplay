import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Box, UnityCylinder } from "../../../library/models/primitives.js";
import { GearModel } from "../gear.js";

export class Spear extends GearModel {
    constructor() {
        super();
        this.equipOffsetPos = { x: 0.1, y: 0.3, z: 0 };

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });
        
        const gun = new Group();

        const obj0 = new Mesh(UnityCylinder, material);
        gun.add(obj0);
        obj0.scale.set(0.03, 0.03, 0.5852184);
        obj0.position.set(0, 0, 0.0309);

        const obj1 = new Mesh(Box, material);
        gun.add(obj1);
        obj1.scale.set(0.0129769, 0.03706785, 0.07355237);
        obj1.position.set(0, 0, 0.64);

        const obj2 = new Mesh(Box, material);
        gun.add(obj2);
        obj2.scale.set(0.003388139, 0.01353548, 0.1181766);
        obj2.position.set(0, 0.01177015, 0.725722);

        const obj3 = new Mesh(Box, material);
        gun.add(obj3);
        obj3.scale.set(0.003388139, 0.03367705, 0.01500099);
        obj3.position.set(0, -0.0009698477, 0.6741417);

        const obj4 = new Mesh(Box, material);
        gun.add(obj4);
        obj4.scale.set(0.003388139, 0.01370582, 0.1181766);
        obj4.position.set(0, -0.01248985, 0.7219117);

        const obj5 = new Mesh(Box, material);
        gun.add(obj5);
        obj5.scale.set(0.003388139, 0.02569299, 0.01574296);
        obj5.position.set(0, 0.008930288, 0.795522);
        obj5.rotateX(4.860936);

        const obj6 = new Mesh(Box, material);
        gun.add(obj6);
        obj6.scale.set(0.003388139, 0.02569299, 0.01574296);
        obj6.position.set(0, 0.003330288, 0.818522);
        obj6.rotateX(5.028936);

        const obj7 = new Mesh(Box, material);
        gun.add(obj7);
        obj7.scale.set(0.003388139, 0.02569299, 0.01574296);
        obj7.position.set(0, -0.005569712, 0.813422);
        obj7.rotateX(-1.61619234);

        const obj8 = new Mesh(Box, material);
        gun.add(obj8);
        obj8.scale.set(0.003388139, 0.02569299, 0.01574296);
        obj8.position.set(0, -0.01026971, 0.792922);
        obj8.rotateX(4.757777);

        const obj9 = new Mesh(Box, material);
        gun.add(obj9);
        obj9.scale.set(0.003388139, 0.01208958, 0.05389988);
        obj9.position.set(0, -0.0004697121, 0.7881517);

        this.root.add(gun);
        gun.rotateX(-90 * Math.deg2rad);
        gun.rotateY(30 * Math.deg2rad);
    }
}