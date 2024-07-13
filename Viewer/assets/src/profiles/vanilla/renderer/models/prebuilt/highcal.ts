import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Box, UnityCylinder } from "../../../library/models/primitives.js";
import { GearModel } from "../gear.js";

export class HighCal extends GearModel {
    constructor() {
        super();
        this.leftHandGrip = { x: 0.05, y: -0.1, z: -0.1 };
        this.equipOffsetPos = { x: 0, y: 0.11, z: 0 };

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(Box, material);
        gun.add(obj0);
        obj0.scale.set(0.0410956, 0.1234528, 0.07255954);
        obj0.position.set(0, -0.0676, -0.149);
        obj0.rotateX(0.2966734);

        const obj1 = new Mesh(Box, material);
        gun.add(obj1);
        obj1.scale.set(0.037869, 0.02306365, 0.2833118);
        obj1.position.set(0, 0.0005, 0.03515);

        const obj2 = new Mesh(Box, material);
        gun.add(obj2);
        obj2.scale.set(0.03, 0.06858722, 0.2483889);
        obj2.position.set(0, 0.00581, -0.055);

        const obj3 = new Mesh(Box, material);
        gun.add(obj3);
        obj3.scale.set(0.03, 0.09100458, 0.1055328);
        obj3.position.set(0, -0.0327, 0.0168);
        obj3.rotateX(0.2605932);

        const obj4 = new Mesh(Box, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.02219556, 0.3088177);
        obj4.position.set(0, 0.047, 0.0251);

        const obj5 = new Mesh(Box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.02219556, 0.03118816);
        obj5.position.set(0, 0.047, -0.1653);

        const obj6 = new Mesh(Box, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.02631817, 0.1733402);
        obj6.position.set(0, -0.07616, -0.03168);

        const obj7 = new Mesh(UnityCylinder, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.03, 0.1731956);
        obj7.position.set(0, 0.022, 0.02011);

        this.root.add(gun);
        gun.position.set(0, -0.05, 0);
    }
}