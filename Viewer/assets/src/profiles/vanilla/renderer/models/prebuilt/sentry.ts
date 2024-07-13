import { Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Box, UnityCylinder } from "../../../library/models/primitives.js";
import { GearModel } from "../gear.js";

export class Sentry extends GearModel {
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
        this.leftHandGrip = { x: 0.05, y: -0.05, z: 0.12 };
        this.equipOffsetPos = { x: 0, y: -0.3, z: 0.1 };
        this.equipOffsetRot = { x: -0.7071081, y: 0, z: 0, w: 0.7071055 };

        this.sentry = new Group();

        const material = new MeshPhongMaterial({ color: 0xcccccc });

        this.base = new Mesh(Box, material);
        this.sentry.add(this.base);
        this.base.position.set(0, 0.1 / 2, 0);
        this.base.scale.set(0.4, 0.05, 0.6);

        this.gun = new Group();

        this.bottom = new Mesh(Box, material);
        this.gun.add(this.bottom);
        this.bottom.position.set(0, -0.075, -0.1);
        this.bottom.scale.set(0.2, 0.1, 0.6);

        this.middle = new Mesh(Box, material);
        this.gun.add(this.middle);
        this.middle.position.set(0, 0, -0.3);
        this.middle.scale.set(0.2, 0.1, 0.2);

        this.top = new Mesh(Box, material);
        this.gun.add(this.top);
        this.top.position.set(0, 0.075, -0.2);
        this.top.scale.set(0.2, 0.1, 0.4);

        this.muzzle = new Mesh(UnityCylinder, material);
        this.gun.add(this.muzzle);
        this.muzzle.position.set(0, 0, 0.2);
        this.muzzle.scale.set(0.03, 0.03, 0.6);

        this.screen = new Mesh(Box, material);
        this.gun.add(this.screen);
        this.screen.position.set(0, 0.15, -0.5);
        this.screen.scale.set(0.3, 0.2, 0.05);
        this.screen.rotateX(10);

        this.gun.position.set(0, 0.3, 0);
        this.sentry.add(this.gun);

        this.root.add(this.sentry);
        this.sentry.scale.set(0.5, 0.5, 0.5);
        this.sentry.rotateX(Math.PI / 2);

        this.offsetRot = { x: -0.7071081, y: 0, z: 0, w: 0.7071055 };
        this.offsetPos = { x: 0, y: -0.3, z: 0 };
    }
}