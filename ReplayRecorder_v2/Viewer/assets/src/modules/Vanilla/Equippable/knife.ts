import { BoxGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "../equippable.js";

const box = new BoxGeometry(1, 1, 1);
//const cylinder = new CylinderGeometry(1, 1, 1, 10, 10).translate(0, 0.5, 0).rotateX(Math.PI * 0.5);

export class Knife extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });
        const blade = new Mesh(box, material);
        blade.scale.set(0.01, 0.3, 0.05);

        //const handle = new Mesh(cylinder, material);
        //handle.scale.set(0.02, 0.02, 0.02);

        const knife = new Group();
        knife.add(blade);
        blade.position.set(-0.1, 0.1, -0.025);
        //knife.add(handle);
        
        this.group.add(knife);
        //knife.rotateZ(-10);
    }
}