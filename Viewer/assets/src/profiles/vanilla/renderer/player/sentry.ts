import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { BoxGeometry, Color, ColorRepresentation, CylinderGeometry, Group, Mesh, MeshPhongMaterial, Object3D } from "@esm/three";
import { getPlayerColor } from "../../datablocks/player/player.js";
import { Factory } from "../../library/factory.js";
import { Identifier, IdentifierData } from "../../parser/identifier.js";
import { inventorySlotMap, PlayerBackpack } from "../../parser/player/backpack.js";
import { Sentry } from "../../parser/player/sentry.js";
import { GearBuilder } from "../models/gearbuilder.js";
import { ObjectWrapper } from "../objectwrapper.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Sentry": void;
        }

        interface RenderData {
            "Sentry": Map<number, SentryModel>;
        }
    }
}

const geometry = new BoxGeometry(1, 1, 1);
const cylinder = new CylinderGeometry(1, 1, 1, 10, 10).rotateX(Math.PI * 0.5);

class SentryModel extends ObjectWrapper<Group> {
    readonly base: Mesh;

    readonly defaultModel: Group;

    current: Identifier;
    gearModel?: GearBuilder;
    yaw?: Object3D;
    pitch?: Object3D;

    readonly gun: Group;
    readonly muzzle: Mesh;
    readonly screen: Mesh;
    readonly top: Mesh;
    readonly middle: Mesh;
    readonly bottom: Mesh;

    readonly color: Color;
    
    constructor(color: Color) {
        super();

        this.color = color;

        this.root = new Group();
        
        this.defaultModel = new Group();
        this.root.add(this.defaultModel);

        const material = new MeshPhongMaterial({ color: this.color });

        this.base = new Mesh(geometry, material);
        this.defaultModel.add(this.base);
        this.base.position.set(0, 0.1 / 2, 0);
        this.base.scale.set(0.4, 0.05, 0.6);

        this.gun = new Group();
        this.defaultModel.add(this.gun);

        this.bottom = new Mesh(geometry, material);
        this.gun.add(this.bottom);
        this.bottom.position.set(0, -0.075, -0.1);
        this.bottom.scale.set(0.2, 0.1, 0.6);

        this.middle = new Mesh(geometry, material);
        this.gun.add(this.middle);
        this.middle.position.set(0, 0, -0.3);
        this.middle.scale.set(0.2, 0.1, 0.2);

        this.top = new Mesh(geometry, material);
        this.gun.add(this.top);
        this.top.position.set(0, 0.075, -0.2);
        this.top.scale.set(0.2, 0.1, 0.4);

        this.muzzle = new Mesh(cylinder, material);
        this.gun.add(this.muzzle);
        this.muzzle.position.set(0, 0, 0.2);
        this.muzzle.scale.set(0.03, 0.03, 0.6);

        this.screen = new Mesh(geometry, material);
        this.gun.add(this.screen);
        this.screen.position.set(0, 0.15, -0.5);
        this.screen.scale.set(0.3, 0.2, 0.05);
        this.screen.rotateX(10);

        this.gun.position.set(0, 0.45, 0);
    }

    private static FUNC_update = {
        temp: new Object3D()
    } as const;
    public update(sentry: Sentry, db: IdentifierData, backpack?: PlayerBackpack) {
        if (backpack !== undefined && !Identifier.equals(db, this.current, backpack.slots[inventorySlotMap.tool])) {
            this.current = backpack.slots[inventorySlotMap.tool];
            if (this.gearModel !== undefined) this.gearModel.removeFromParent();
            this.gearModel = new GearBuilder(this.current.stringKey, (gearModel) => {
                gearModel.material.color = this.color;
                this.yaw = gearModel.findObjectByName(gearModel.root, "a_yaw");
                this.pitch = gearModel.findObjectByName(gearModel.root, "a_pitch");
            });
            this.root.add(this.gearModel.root);
        }

        if (this.gearModel !== undefined) {
            this.root.position.set(sentry.position.x, sentry.position.y, sentry.position.z);
            this.gearModel.root.quaternion.copy(sentry.baseRot);

            this.base.visible = false;
            this.gun.visible = false;

            const { temp } = SentryModel.FUNC_update;
            temp.quaternion.copy(sentry.rotation);
            if (this.yaw !== undefined) this.yaw.rotation.y = - temp.rotation.y + this.gearModel.root.rotation.y;
            if (this.pitch !== undefined) this.pitch.rotation.x = - temp.rotation.x + this.gearModel.root.rotation.x;
        } else {
            this.root.position.set(sentry.position.x, sentry.position.y - 0.3, sentry.position.z);

            this.base.visible = true;
            this.gun.visible = true;
            this.base.quaternion.set(sentry.baseRot.x, sentry.baseRot.y, sentry.baseRot.z, sentry.baseRot.w);
            this.gun.quaternion.set(sentry.rotation.x, sentry.rotation.y, sentry.rotation.z, sentry.rotation.w);
        }
    }
}

ModuleLoader.registerRender("Sentry", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Sentry", Factory("Map"));
            const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
            const backpack = snapshot.getOrDefault("Vanilla.Player.Backpack", Factory("Map"));
            const sentries = snapshot.getOrDefault("Vanilla.Sentry", Factory("Map"));
            const db = IdentifierData(snapshot);
            for (const [id, sentry] of sentries) {
                if (!models.has(id)) {
                    let color: ColorRepresentation = 0xffffff;
                    if (players.has(sentry.owner)) {
                        color = getPlayerColor(players.get(sentry.owner)!.slot);
                    }
                    const model = new SentryModel(new Color(color));
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.update(sentry, db, backpack.get(sentry.owner));
                model.setVisible(sentry.dimension === renderer.get("Dimension"));
            }

            for (const [id, model] of [...models.entries()]) {
                if (!sentries.has(id)) {
                    model.removeFromScene(renderer.scene);
                    models.delete(id);
                }
            }
        } 
    }]);
});