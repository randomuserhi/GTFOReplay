import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class MineDeployer extends Model {
    constructor() {
        super();
        this.leftHandGrip = { x: 0.05, y: -0.1, z: 0.07 };
        this.equipOffsetPos = { x: 0, y: 0.1, z: 0.1 };

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });
        
        const gun = new Group();

        const obj0 = new Mesh(cylinder, material);
        gun.add(obj0);
        obj0.scale.set(0.223922, 0.16242, 0.1616145);
        obj0.position.set(0, -0.008, 0.141);

        const obj1 = new Mesh(cylinder, material);
        gun.add(obj1);
        obj1.scale.set(0.012, 0.012, 0.09614644);
        obj1.position.set(0.0312, -0.0201997, -0.2880321);

        const obj2 = new Mesh(cylinder, material);
        gun.add(obj2);
        obj2.scale.set(0.012, 0.012, 0.09614644);
        obj2.position.set(-0.0279, 0.0023003, -0.4564021);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.1247992, 0.09454907, 0.115174);
        obj3.position.set(0, -0.0529997, -0.1971021);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.1247992, 0.1404791, 0.1616225);
        obj4.position.set(0, 0.0009502992, -0.09658207);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.0675721, 0.08840716, 0.01587318);
        obj5.position.set(0, -0.0384297, -0.5467021);

        const obj6 = new Mesh(box, material);
        gun.add(obj6);
        obj6.scale.set(0.1022517, 0.03275392, 0.5538224);
        obj6.position.set(0, -0.0846997, -2.067536E-06);

        const obj7 = new Mesh(box, material);
        gun.add(obj7);
        obj7.scale.set(0.1022517, 0.03275392, 0.4515138);
        obj7.position.set(0, 0.0689003, 0.07989793);

        const obj8 = new Mesh(box, material);
        gun.add(obj8);
        obj8.scale.set(0.08137289, 0.02633251, 0.2006369);
        obj8.position.set(0, 0.0923003, 0.1798979);

        const obj9 = new Mesh(box, material);
        gun.add(obj9);
        obj9.scale.set(0.09043071, 0.01629473, 0.08027059);
        obj9.position.set(0.1606, -0.0347997, 0.08389793);
        obj9.rotateX(5.316625);

        const obj10 = new Mesh(box, material);
        gun.add(obj10);
        obj10.scale.set(0.0616434, 0.03148751, 0.1399077);
        obj10.position.set(0, -0.2362997, -0.2876021);

        const obj11 = new Mesh(box, material);
        gun.add(obj11);
        obj11.scale.set(0.0616434, 0.01531332, 0.1399077);
        obj11.position.set(0, -0.2053997, 0.1249979);
        obj11.rotateX(5.906438);

        const obj12 = new Mesh(box, material);
        gun.add(obj12);
        obj12.scale.set(0.07226246, 0.009411273, 0.02576782);
        obj12.position.set(0, -0.008899689, -0.3745021);
        obj12.rotateZ(5.933967);

        const obj13 = new Mesh(box, material);
        gun.add(obj13);
        obj13.scale.set(0.0616434, 0.1750842, 0.04855077);
        obj13.position.set(0, -0.1676997, -0.1979021);
        obj13.rotateX(0.4977555);

        const obj14 = new Mesh(box, material);
        gun.add(obj14);
        obj14.scale.set(0.0616434, 0.1009658, 0.0209817);
        obj14.position.set(0, -0.1410997, 0.2081979);
        obj14.rotateX(0.4977555);

        const obj15 = new Mesh(box, material);
        gun.add(obj15);
        obj15.scale.set(0.0616434, 0.1612385, 0.04855077);
        obj15.position.set(0, -0.1607797, 0.04279793);

        const obj16 = new Mesh(box, material);
        gun.add(obj16);
        obj16.scale.set(0.0616434, 0.167687, 0.04525571);
        obj16.position.set(0, -0.1563997, -0.2967021);
        obj16.rotateX(0.4977555);

        this.group.add(gun);
        gun.position.set(0, 0, 0);

        this.offsetPos = { x: 0, y: 0, z: 0.15 };
    }
}