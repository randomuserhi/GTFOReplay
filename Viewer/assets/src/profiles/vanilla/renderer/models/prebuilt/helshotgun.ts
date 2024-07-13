import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Box, UnityCylinder } from "../../../library/models/primitives.js";
import { GearModel } from "../gear.js";

export class HelShotgun extends GearModel {
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
        obj0.scale.set(0.0497378, 0.1357871, 0.07033338);
        obj0.position.set(0, -0.0639, 0.0121);
        obj0.rotateX(5.93826);

        const obj1 = new Mesh(Box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.1138152, 0.05538205);
        obj1.position.set(0, -0.06434, -0.14245);
        obj1.rotateX(0.4289075);

        const obj2 = new Mesh(Box, material);
        gun.add(obj2);
        obj2.scale.set(0.037869, 0.04435147, 0.2173291);
        obj2.position.set(0, -0.0157, -0.02123);

        const obj3 = new Mesh(Box, material);
        gun.add(obj3);
        obj3.scale.set(0.0838153, 0.04365116, 0.3065947);
        obj3.position.set(0, -0.0157, 0.1948);

        const obj4 = new Mesh(Box, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.07973589, 0.2130763);
        obj4.position.set(0, 0.01138, -0.0373);

        const obj5 = new Mesh(Box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.02219556, 0.3018992);
        obj5.position.set(0, 0.0505, 0.04725);

        const obj6 = new Mesh(Box, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.02219556, 0.1435712);
        obj6.position.set(0, 0.0234, 0.2583);
        obj6.rotateX(0.3960789);

        const obj7 = new Mesh(Box, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.0342297, 0.01637931);
        obj7.position.set(0, 0.0871, 0.02722);

        const obj8 = new Mesh(Box, material);
        gun.add(obj8);
        obj8.scale.set(0.03, 0.01234494, 0.05881012);
        obj8.position.set(0, 0.07616, 0.00601);

        const obj9 = new Mesh(Box, material);
        gun.add(obj9);
        obj9.scale.set(0.03, 0.0357471, 0.2434585);
        obj9.position.set(0, 0.0239, -0.1958);
        obj9.rotateX(6.121517);

        const obj10 = new Mesh(Box, material);
        gun.add(obj10);
        obj10.scale.set(0.03, 0.0357471, 0.1784408);
        obj10.position.set(0, 0.005699871, -0.3919);

        const obj11 = new Mesh(Box, material);
        gun.add(obj11);
        obj11.scale.set(0.03, 0.09625313, 0.0302763);
        obj11.position.set(0, -0.01410013, -0.456);

        const obj12 = new Mesh(UnityCylinder, material);
        gun.add(obj12);
        obj12.scale.set(0.02, 0.02, 0.2442971);
        obj12.position.set(0, 0.0157, 0.13079);

        this.root.add(gun);
        gun.position.set(0, 0, 0);
    }
}