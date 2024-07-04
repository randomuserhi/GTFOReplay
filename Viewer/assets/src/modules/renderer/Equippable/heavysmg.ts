import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class HeavySmg extends Model {
    constructor() {
        super();
        this.leftHandGrip = { x: 0.05, y: -0.1, z: 0.1 };
        this.equipOffsetPos = { x: 0, y: 0.11, z: 0.1 };

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.0497378, 0.2287681, 0.0370476);
        obj0.position.set(0, -0.1284, -0.0117);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.0497378, 0.1761858, 0.05839702);
        obj1.position.set(0, -0.0599, -0.0136);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.037869, 0.1243801, 0.05839702);
        obj2.position.set(0, -0.09, 0.116);
        obj2.rotateX(0.3659238);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.0410956, 0.2044097, 0.05855261);
        obj3.position.set(0, -0.10615, -0.18047);
        obj3.rotateX(0.4289075);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.0410956, 0.1888794, 0.05855261);
        obj4.position.set(0, -0.07843, -0.31849);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.037869, 0.05672409, 0.3124567);
        obj5.position.set(0, -0.02186, 0.0123);

        const obj6 = new Mesh(box, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.06677948, 0.1826507);
        obj6.position.set(0, -0.00576, -0.21153);

        const obj7 = new Mesh(box, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.07319798, 0.2091052);
        obj7.position.set(0, 0.0081, -0.0353);

        const obj8 = new Mesh(box, material);
        gun.add(obj8);
        obj8.scale.set(0.03, 0.02219556, 0.2205963);
        obj8.position.set(0, 0.0505, 0.0066);

        const obj9 = new Mesh(box, material);
        gun.add(obj9);
        obj9.scale.set(0.03, 0.0342297, 0.04088144);
        obj9.position.set(0, 0.0871, 0.0071);

        const obj10 = new Mesh(box, material);
        gun.add(obj10);
        obj10.scale.set(0.03, 0.01234494, 0.05881012);
        obj10.position.set(0, 0.07616, 0.00601);

        const obj11 = new Mesh(box, material);
        gun.add(obj11);
        obj11.scale.set(0.03, 0.04253655, 0.4156087);
        obj11.position.set(0, -0.01453, -0.28118);

        const obj12 = new Mesh(box, material);
        gun.add(obj12);
        obj12.scale.set(0.03, 0.1425189, 0.02503581);
        obj12.position.set(0, -0.05565, -0.46039);

        const obj13 = new Mesh(box, material);
        gun.add(obj13);
        obj13.scale.set(0.03, 0.01705484, 0.1551246);
        obj13.position.set(0, -0.18255, -0.30615);

        const obj14 = new Mesh(box, material);
        gun.add(obj14);
        obj14.scale.set(0.03, 0.01705484, 0.1045695);
        obj14.position.set(0, -0.15137, -0.4232);
        obj14.rotateX(0.6042188);

        const obj15 = new Mesh(cylinder, material);
        gun.add(obj15);
        obj15.scale.set(0.03, 0.03, 0.1653333);
        obj15.position.set(0, 0.0157, 0.0518);

        this.group.add(gun);
        gun.position.set(0, -0.05, 0);
    }
}