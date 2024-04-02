import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "../equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class MachinePistol extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.0410956, 0.3069575, 0.06383834);
        obj0.position.set(0, -0.1532, -0.1771);
        obj0.rotateX(0.2668107);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.03971954, 0.3119811);
        obj1.position.set(0, 0.01888, -0.07533);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.0410956, 0.02000157, 0.07924943);
        obj2.position.set(0, 0.0398, -0.179);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.0410956, 0.03971954, 0.02128277);
        obj3.position.set(0, 0.04559994, 0.04130173);
        obj3.rotateX(0.3764097);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.06, 0.08393136, 0.1171156);
        obj4.position.set(0, -0.0314, 0.00592);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.02, 0.06669018, 0.1192949);
        obj5.position.set(0, -0.0178, -0.1082);

        const obj6 = new Mesh(cylinder, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.03, 0.02846787);
        obj6.position.set(0, 0.0064, 0.064);

        this.group.add(gun);
        gun.position.set(0, -0.05, 0);
    }
}