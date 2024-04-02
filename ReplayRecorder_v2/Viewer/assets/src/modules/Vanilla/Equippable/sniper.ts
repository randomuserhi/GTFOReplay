import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "../equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(0.5, 0.5, 2, 10, 10).rotateX(Math.PI * 0.5);

export class Sniper extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });

        const gun = new Group();
        
        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.0497378, 0.0822858, 0.1137586);
        obj0.position.set(0, -0.0529, -0.0299);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.0410956, 0.1315114, 0.03521642);
        obj1.position.set(0, -0.0682, -0.1552987);
        obj1.rotateX(0.4289075);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.037869, 0.04435147, 0.7535181);
        obj2.position.set(0, -0.0157, 0.2469);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.03, 0.07973589, 0.2130763);
        obj3.position.set(0, 0.01138, -0.0373);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.03, 0.02219556, 0.2205963);
        obj4.position.set(0, 0.0505, 0.0066);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.03, 0.02219556, 0.2205963);
        obj5.position.set(0, 0.048, 0.513398);

        const obj6 = new Mesh(box, material);
        gun.add(obj6);
        obj6.scale.set(0.03, 0.04239006, 0.07816287);
        obj6.position.set(0, 0.0912, -0.0037);

        const obj7 = new Mesh(box, material);
        gun.add(obj7);
        obj7.scale.set(0.03, 0.0342297, 0.1130919);
        obj7.position.set(0, -0.043, 0.5506);

        const obj8 = new Mesh(box, material);
        gun.add(obj8);
        obj8.scale.set(0.03, 0.01234494, 0.127831);
        obj8.position.set(0, 0.07616, -0.0047);

        const obj9 = new Mesh(box, material);
        gun.add(obj9);
        obj9.scale.set(0.03, 0.0357471, 0.3707019);
        obj9.position.set(0, -0.0078, -0.2587287);

        const obj10 = new Mesh(box, material);
        gun.add(obj10);
        obj10.scale.set(0.03, 0.01310524, 0.1939345);
        obj10.position.set(0, -0.0913, -0.2765);
        obj10.rotateX(0.2439756);

        const obj11 = new Mesh(box, material);
        gun.add(obj11);
        obj11.scale.set(0.03, 0.09625313, 0.08155952);
        obj11.position.set(0, -0.03061, -0.38896);

        const obj12 = new Mesh(box, material);
        gun.add(obj12);
        obj12.scale.set(0.03, 0.09625313, 0.01511706);
        obj12.position.set(0, -0.03061, -0.4523);

        const obj13 = new Mesh(cylinder, material);
        gun.add(obj13);
        obj13.scale.set(0.03, 0.03, 0.3685443);
        obj13.position.set(0, 0.0261, 0.25506);

        this.group.add(gun);
        gun.position.set(0, 0, 0);
    }
}