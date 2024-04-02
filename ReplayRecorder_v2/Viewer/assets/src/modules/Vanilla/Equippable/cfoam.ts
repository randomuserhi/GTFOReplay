import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "../equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class CfoamLauncher extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({ color: 0xcccccc });

        const tool = new Group;
        
        const box0 = new Mesh(box, material);
        box0.position.set(0, -0.077, -0.1982989);
        box0.scale.set(0.07, 0.1, 0.04);
        tool.add(box0);

        const box1 = new Mesh(box, material);
        box1.position.set(0, -0.0762, -0.0539);
        box1.scale.set(0.03, 0.03, 0.3);
        tool.add(box1);

        const box3 = new Mesh(box, material);
        box3.position.set(0, -0.137, 0.047);
        box3.rotateX(0.768660456);
        box3.scale.set(0.07, 0.2, 0.04);
        tool.add(box3);

        const cylinder0 = new Mesh(cylinder, material);
        cylinder0.position.set(0, -0.043, 0.139);
        cylinder0.scale.set(0.1, 0.1, 0.1);
        tool.add(cylinder0);

        const cylinder1 = new Mesh(cylinder, material);
        cylinder1.position.set(-0.03, -0.02959997, 0.3549983);
        cylinder1.scale.set(0.06, 0.06, 0.1);
        tool.add(cylinder1);

        const cylinder2 = new Mesh(cylinder, material);
        cylinder2.position.set(-0.03, -0.096, 0.3549983);
        cylinder2.scale.set(0.06, 0.06, 0.1);
        tool.add(cylinder2);

        const cylinder3 = new Mesh(cylinder, material);
        cylinder3.position.set(0.03, -0.02959997, 0.3549983);
        cylinder3.scale.set(0.06, 0.06, 0.1);
        tool.add(cylinder3);

        const cylinder4 = new Mesh(cylinder, material);
        cylinder4.position.set(0.03, -0.096, 0.3549983);
        cylinder4.scale.set(0.06, 0.06, 0.1);
        tool.add(cylinder4);

        tool.scale.set(1.3, 1.3, 1.3);
        
        this.group.add(tool);
        tool.position.set(0, 0, -0.2);
    }
}