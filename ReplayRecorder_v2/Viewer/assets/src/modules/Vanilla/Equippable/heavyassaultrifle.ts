import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class HeavyAssaultRifle extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.0497378, 0.1761858, 0.0714663);
        obj0.position.set(0, -0.085, -0.051);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.1215218, 0.04198748);
        obj1.position.set(0, -0.06507, -0.15014);
        obj1.rotateX(0.4289075);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.037869, 0.05081791, 0.3589823);
        obj2.position.set(0, -0.0189, -0.0302);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.03, 0.0703749, 0.2988395);
        obj3.position.set(0, 0.0067, -0.0802);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.02219556, 0.2205963);
        obj4.position.set(0, 0.045, 0.0066);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.0342297, 0.03336465);
        obj5.position.set(0, 0.074, 0.0225);

        const obj6 = new Mesh(box, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.01234494, 0.05881012);
        obj6.position.set(0, 0.06305985, 0.01678652);

        const obj7 = new Mesh(box, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.0357471, 0.3707019);
        obj7.position.set(0, -0.0078, -0.2587287);

        const obj8 = new Mesh(box, material);
        gun.add(obj8);
        obj8.scale.set(0.03, 0.1133323, 0.0302763);
        obj8.position.set(0, -0.03915, -0.4145956);

        const obj9 = new Mesh(box, material);
        gun.add(obj9);
        obj9.scale.set(0.03, 0.04582739, 0.09987003);
        obj9.position.set(0, -0.04374, -0.39367);

        const obj10 = new Mesh(box, material);
        gun.add(obj10);
        obj10.scale.set(0.03, 0.01811163, 0.08393227);
        obj10.position.set(0, -0.0849, -0.3877);

        const obj11 = new Mesh(box, material);
        gun.add(obj11);
        obj11.scale.set(0.03, 0.01811163, 0.1283282);
        obj11.position.set(0, -0.1236, -0.2217);

        const obj12 = new Mesh(box, material);
        gun.add(obj12);
        obj12.scale.set(0.03, 0.01811163, 0.08393227);
        obj12.position.set(0, -0.1058, -0.3158);
        obj12.rotateX(0.5970807);

        const obj13 = new Mesh(cylinder, material);
        gun.add(obj13);
        obj13.scale.set(0.02, 0.02, 0.1958279);
        obj13.position.set(0, 0.0157, 0.0823);

        this.group.add(gun);
        gun.position.set(0, 0, 0);
    }
}