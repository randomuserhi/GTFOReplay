import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Box, UnityCylinder } from "../../../library/models/primitives.js";
import { GearModel } from "../gear.js";

export class Revolver extends GearModel {
    constructor() {
        super();
        this.leftHandGrip = { x: 0.05, y: -0.1, z: -0.1 };
        this.equipOffsetPos = { x: 0, y: 0, z: 0.1 };

        this.fold = new Group();

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const box0 = new Mesh(Box, material);
        gun.add(box0);
        box0.scale.set(0.07, 0.1827715, 0.08918999);
        box0.position.set(0, -0.1010699, -0.12677);
        box0.rotateX(0.37507126);
        
        const box1 = new Mesh(Box, material);
        gun.add(box1);
        box1.scale.set(0.05, 0.027227, 0.1278838);
        box1.position.set(0, -0.0584, -0.0173);

        const box2 = new Mesh(Box, material);
        gun.add(box2);
        box2.scale.set(0.03, 0.1055951, 0.09855723);
        box2.position.set(0, -0.024, -0.0849);
        
        const f = new Group();
        const box3  = new Mesh(Box, material);
        f.add(box3);
        box3.scale.set(0.07, 0.1350144, 0.23438);
        box3.position.set(0, 0.03921996, 0.0754);

        const box4  = new Mesh(Box, material);
        f.add(box4);
        box4.scale.set(0.05, 0.01554308, 0.2897247);
        box4.position.set(0, 0.093, -0.0124);

        const cylinder0  = new Mesh(UnityCylinder, material);
        f.add(cylinder0);
        cylinder0.scale.set(0.07, 0.07, 0.03834316);
        cylinder0.position.set(0, 0.0635, -0.07926);

        const cylinder1  = new Mesh(UnityCylinder, material);
        f.add(cylinder1);
        cylinder1.scale.set(0.05, 0.05, 0.02458714);
        cylinder1.position.set(0, 0.066, 0.1768);

        this.fold.add(f);
        
        gun.add(this.fold);
        this.fold.position.set(0, -0.054, 0.081);

        this.root.add(gun);
        gun.position.set(0, 0.05, -0.05);
        gun.scale.set(0.9, 0.9, 0.9);
    }
}