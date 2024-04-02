import { BoxGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "../equippable.js";

const box = new BoxGeometry(1, 1, 1);
//const cylinder = new CylinderGeometry(1, 1, 1, 10, 10).rotateX(Math.PI * 0.5);

export class Biotracker extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({ color: 0xcccccc });

        const tool = new Group;
        
        const box0 = new Mesh(box, material);
        box0.position.set(0, -0.1423002, -0.1982989);
        box0.rotateX(-1.831792863);
        box0.scale.set(0.07, 0.04, 0.2);
        tool.add(box0);

        const box1 = new Mesh(box, material);
        box1.position.set(0, -0.0883, -0.0436);
        box1.rotateX(-0.112661);
        box1.scale.set(0.03, 0.03, 0.3);
        tool.add(box1);

        const box2 = new Mesh(box, material);
        box2.position.set(0, -0.1023002, 0.1547011);
        box2.scale.set(0.15, 0.2, 0.2);
        tool.add(box2);

        const box3 = new Mesh(box, material);
        box3.position.set(0, -0.1023002, 0.3095711);
        box3.scale.set(0.2, 0.15, 0.06);
        tool.add(box3);

        const box4 = new Mesh(box, material);
        box4.position.set(0, 0.01419982, 0.02480109);
        box4.rotateX(0.641530673);
        box4.scale.set(0.2, 0.07, 0.02);
        tool.add(box4);
        
        this.group.add(tool);
        tool.position.set(0, 0, -0.2);
    }
}