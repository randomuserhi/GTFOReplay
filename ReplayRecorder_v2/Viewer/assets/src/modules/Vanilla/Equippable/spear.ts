import { CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "../equippable.js";

//const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(1, 1, 1, 10, 10).translate(0, 0.5, 0).rotateX(Math.PI * 0.5);

export class Spear extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        }); 
        //const head = new Mesh(box, material);
        //head.scale.set(0.1, 0.3, 0.1);

        const handle = new Mesh(cylinder, material);
        handle.scale.set(0.02, 0.02, 1.2);
        
        const spear = new Group();
        //hammer.add(head);
        //head.position.set(0, 0, 0.8);
        spear.add(handle);
        spear.rotateX(-80);

        this.group.add(spear);
        spear.position.set(0, 0.5, 0);
    }
}