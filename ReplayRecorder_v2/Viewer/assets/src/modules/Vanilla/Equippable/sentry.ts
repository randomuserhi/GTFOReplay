import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Model } from "../equippable.js";

const box = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(1, 1, 1, 10, 10).rotateX(Math.PI * 0.5);

export class Sentry extends Model {
    readonly sentry: Group;
    readonly base: Mesh;

    readonly gun: Group;
    readonly muzzle: Mesh;
    readonly screen: Mesh;
    readonly top: Mesh;
    readonly middle: Mesh;
    readonly bottom: Mesh;
    
    constructor() {
        super();

        this.sentry = new Group();

        const material = new MeshPhongMaterial({ color: 0xcccccc });

        this.base = new Mesh(box, material);
        this.sentry.add(this.base);
        this.base.position.set(0, 0.1 / 2, 0);
        this.base.scale.set(0.4, 0.05, 0.6);

        this.gun = new Group();

        this.bottom = new Mesh(box, material);
        this.gun.add(this.bottom);
        this.bottom.position.set(0, -0.075, -0.1);
        this.bottom.scale.set(0.2, 0.1, 0.6);

        this.middle = new Mesh(box, material);
        this.gun.add(this.middle);
        this.middle.position.set(0, 0, -0.3);
        this.middle.scale.set(0.2, 0.1, 0.2);

        this.top = new Mesh(box, material);
        this.gun.add(this.top);
        this.top.position.set(0, 0.075, -0.2);
        this.top.scale.set(0.2, 0.1, 0.4);

        this.muzzle = new Mesh(cylinder, material);
        this.gun.add(this.muzzle);
        this.muzzle.position.set(0, 0, 0.2);
        this.muzzle.scale.set(0.03, 0.03, 0.6);

        this.screen = new Mesh(box, material);
        this.gun.add(this.screen);
        this.screen.position.set(0, 0.15, -0.5);
        this.screen.scale.set(0.3, 0.2, 0.05);
        this.screen.rotateX(10);

        this.gun.position.set(0, 0.3, 0);
        this.sentry.add(this.gun);

        this.group.add(this.sentry);
        this.sentry.position.set(0, -0.3, 0);
        this.group.scale.set(0.7, 0.7, 0.7);
        this.group.rotateX(90);
    }
}