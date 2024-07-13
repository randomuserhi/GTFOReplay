import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Box, UnityCylinder } from "../../../library/models/primitives.js";
import { GearModel } from "../gear.js";

export class CfoamLauncher extends GearModel {
    constructor() {
        super();
        this.leftHandGrip = { x: 0.05, y: -0.1, z: 0.12 };
        this.equipOffsetPos = { x: 0, y: 0.1, z: 0.1 };

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });
        
        const gun = new Group();

        const obj0 = new Mesh(UnityCylinder, material);
        gun.add(obj0);
        obj0.scale.set(0.08, 0.08, 0.1293878);
        obj0.position.set(0.0457, -0.02722502, 0.2775992);

        const obj1 = new Mesh(UnityCylinder, material);
        gun.add(obj1);
        obj1.scale.set(0.08, 0.08, 0.1293878);
        obj1.position.set(0.0457, 0.0611, 0.2775992);

        const obj2 = new Mesh(UnityCylinder, material);
        gun.add(obj2);
        obj2.scale.set(0.08, 0.08, 0.1293878);
        obj2.position.set(-0.0457, 0.06110001, 0.2775992);

        const obj3 = new Mesh(UnityCylinder, material);
        gun.add(obj3);
        obj3.scale.set(0.08, 0.08, 0.1293878);
        obj3.position.set(-0.0457, -0.02722502, 0.2775992);

        const obj4 = new Mesh(UnityCylinder, material);
        gun.add(obj4);
        obj4.scale.set(0.12, 0.12, 0.1270768);
        obj4.position.set(0, 0.04927492, -0.0576);

        const obj5 = new Mesh(UnityCylinder, material);
        gun.add(obj5);
        obj5.scale.set(0.05, 0.05, 0.07131097);
        obj5.position.set(0, 0.007274628, -0.3003006);

        const obj6 = new Mesh(Box, material);
        gun.add(obj6);
        obj6.scale.set(0.1945276, 0.1802512, 0.05096871);
        obj6.position.set(0, 0.0275, -0.21203);

        const obj7 = new Mesh(Box, material);
        gun.add(obj7);
        obj7.scale.set(0.1945276, 0.1802512, 0.05096871);
        obj7.position.set(0, 0.0275, 0.1178992);

        const obj8 = new Mesh(Box, material);
        gun.add(obj8);
        obj8.scale.set(0.1945276, 0.03275392, 0.2838851);
        obj8.position.set(0, -0.047, -0.048);

        const obj9 = new Mesh(Box, material);
        gun.add(obj9);
        obj9.scale.set(0.1945276, 0.03275392, 0.09571186);
        obj9.position.set(0, 0.1534, -0.13);

        const obj10 = new Mesh(Box, material);
        gun.add(obj10);
        obj10.scale.set(0.1330666, 0.02189239, 0.09571186);
        obj10.position.set(0.185, 0.04339981, 0.08969879);
        obj10.rotateX(5.316625);

        const obj11 = new Mesh(Box, material);
        gun.add(obj11);
        obj11.scale.set(0.1945276, 0.01526005, 0.2330523);
        obj11.position.set(0, 0.1247, -0.1174);

        const obj12 = new Mesh(Box, material);
        gun.add(obj12);
        obj12.scale.set(0.02007135, 0.01526005, 0.276407);
        obj12.position.set(0.08723, 0.109, 0.2755792);

        const obj13 = new Mesh(Box, material);
        gun.add(obj13);
        obj13.scale.set(0.02007135, 0.01526005, 0.276407);
        obj13.position.set(-0.08723, 0.109, 0.2755792);

        const obj14 = new Mesh(Box, material);
        gun.add(obj14);
        obj14.scale.set(0.01724292, 0.01526005, 0.4756534);
        obj14.position.set(0.08864, -0.073, 0.1759392);

        const obj15 = new Mesh(Box, material);
        gun.add(obj15);
        obj15.scale.set(0.01724292, 0.01526005, 0.4756534);
        obj15.position.set(-0.08864, -0.073, 0.1759392);

        const obj16 = new Mesh(Box, material);
        gun.add(obj16);
        obj16.scale.set(0.0804176, 0.0804176, 0.02405128);
        obj16.position.set(0, 0.0085, -0.3765);

        const obj17 = new Mesh(Box, material);
        gun.add(obj17);
        obj17.scale.set(0.0804176, 0.009411273, 0.09547395);
        obj17.position.set(0, 0.0432, -0.4324);

        const obj18 = new Mesh(Box, material);
        gun.add(obj18);
        obj18.scale.set(0.0804176, 0.009411273, 0.09547395);
        obj18.position.set(0, -0.0237, -0.4324);

        const obj19 = new Mesh(Box, material);
        gun.add(obj19);
        obj19.scale.set(0.1954469, 0.009411273, 0.02054798);
        obj19.position.set(0, -0.0864, 0.4143);
        obj19.rotateX(1.043213);

        const obj20 = new Mesh(Box, material);
        gun.add(obj20);
        obj20.scale.set(0.1954469, 0.009411273, 0.02054798);
        obj20.position.set(0, 0.118, 0.421);
        obj20.rotateX(5.239967);

        const obj21 = new Mesh(Box, material);
        gun.add(obj21);
        obj21.scale.set(0.0616434, 0.1750842, 0.04855077);
        obj21.position.set(0, -0.116, -0.249);
        obj21.rotateX(0.4977555);

        const obj22 = new Mesh(Box, material);
        gun.add(obj22);
        obj22.scale.set(0.0616434, 0.1750842, 0.04855077);
        obj22.position.set(0, -0.1323, 0.1280992);

        this.root.add(gun);
        gun.position.set(0, 0, 0);

        this.offsetPos = { x: 0, y: -0.15, z: 0 };
    }
}