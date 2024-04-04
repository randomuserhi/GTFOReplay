import { BoxGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "./equippable.js";

const box = new BoxGeometry(1, 1, 1);

export class Knife extends Model {
    constructor() {
        super();

        const material = new MeshPhongMaterial({
            color: 0xcccccc
        });
        
        const gun = new Group();

        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.0129769, 0.02540007, 0.06492332);
        obj0.position.set(0, 0.0001, 0.0142);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.003388139, 0.01353548, 0.1181766);
        obj1.position.set(0, 0.00604, 0.09561027);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.003388139, 0.03367705, 0.01500099);
        obj2.position.set(0, -0.0067, 0.04403);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.003388139, 0.01370582, 0.1181766);
        obj3.position.set(0, -0.01822, 0.0918);

        const obj4 = new Mesh(box, material);
        gun.add(obj4);
        obj4.scale.set(0.003388139, 0.02569299, 0.01574296);
        obj4.position.set(0, 0.003200136, 0.1654103);
        obj4.rotateX(4.860936);

        const obj5 = new Mesh(box, material);
        gun.add(obj5);
        obj5.scale.set(0.003388139, 0.02569299, 0.01574296);
        obj5.position.set(0, -0.002399864, 0.1884103);
        obj5.rotateX(5.028936);

        const obj6 = new Mesh(box, material);
        gun.add(obj6);
        obj6.scale.set(0.003388139, 0.02569299, 0.01574296);
        obj6.position.set(0, -0.01129986, 0.1833103);
        obj6.rotateX(-1.61619234);

        const obj7 = new Mesh(box, material);
        gun.add(obj7);
        obj7.scale.set(0.003388139, 0.02569299, 0.01574296);
        obj7.position.set(0, -0.01599986, 0.1628103);
        obj7.rotateX(4.757777);

        const obj8 = new Mesh(box, material);
        gun.add(obj8);
        obj8.scale.set(0.003388139, 0.01208958, 0.05389988);
        obj8.position.set(0, -0.006199864, 0.15804);

        const obj9 = new Mesh(box, material);
        gun.add(obj9);
        obj9.scale.set(0.0129769, 0.02540007, 0.04570842);
        obj9.position.set(0, -0.004099864, -0.03789248);
        obj9.rotateX(-0.18465583);

        this.group.add(gun);
        gun.scale.set(1.1, 1.1, 1.1);
        gun.position.set(0, -0.07, -0.1);
        gun.rotateX(-Math.PI/2);
    }
}