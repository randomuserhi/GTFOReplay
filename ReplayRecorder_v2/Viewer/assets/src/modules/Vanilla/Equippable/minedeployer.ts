import { BoxGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "../equippable.js";

const box = new BoxGeometry(1, 1, 1);
//const cylinder = new CylinderGeometry(1, 1, 1, 10, 10).rotateX(Math.PI * 0.5);

export class MineDeployer extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({ color: 0xcccccc });

        const tool = new Group;
        
        const box0 = new Mesh(box, material);
        box0.position.set(0, -0.1423002, -0.1982989);
        box0.scale.set(0.07, 0.2, 0.04);
        tool.add(box0);

        const box1 = new Mesh(box, material);
        box1.position.set(0, -0.0762, -0.0539);
        box1.scale.set(0.03, 0.03, 0.3);
        tool.add(box1);

        const box2 = new Mesh(box, material);
        box2.position.set(0, -0.1024, 0.2452);
        box2.scale.set(0.15, 0.1635372, 0.3808703);
        tool.add(box2);

        const box3 = new Mesh(box, material);
        box3.position.set(0, -0.172, 0.059);
        box3.rotateX(0.768660456);
        box3.scale.set(0.07, 0.2, 0.04);
        tool.add(box3);

        const box4 = new Mesh(box, material);
        box4.position.set(0, -0.00693, 0.2916);
        box4.scale.set(0.13, 0.03408256, 0.1757243);
        tool.add(box4);
        
        this.group.add(tool);
        tool.position.set(0, 0, -0.1);
    }
}