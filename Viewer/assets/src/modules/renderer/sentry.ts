import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { BoxGeometry, Color, ColorRepresentation, CylinderGeometry, Group, Mesh, MeshPhongMaterial, Scene } from "@esm/three";
import { Sentry } from "../parser/sentry.js";
import { playerColors } from "./player/renderer.js";

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

class SentryModel {
    readonly group: Group;
    readonly base: Mesh;

    readonly gun: Group;
    readonly muzzle: Mesh;
    readonly screen: Mesh;
    readonly top: Mesh;
    readonly middle: Mesh;
    readonly bottom: Mesh;
    
    constructor(color: Color) {
        this.group = new Group();

        const material = new MeshPhongMaterial({ color });

        this.base = new Mesh(geometry, material);
        this.group.add(this.base);
        this.base.position.set(0, 0.1 / 2, 0);
        this.base.scale.set(0.4, 0.05, 0.6);

        this.gun = new Group();

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

    public update(sentry: Sentry) {
        this.group.quaternion.set(sentry.baseRot.x, sentry.baseRot.y, sentry.baseRot.z, sentry.baseRot.w);
        this.group.position.set(sentry.position.x, sentry.position.y - 0.3, sentry.position.z);

        this.gun.quaternion.set(sentry.rotation.x, sentry.rotation.y, sentry.rotation.z, sentry.rotation.w);
        this.gun.position.set(this.group.position.x, this.group.position.y + 0.45, this.group.position.z);
    }

    public setVisible(visible: boolean) {
        this.group.visible = visible;
    }

    public addToScene(scene: Scene) {
        scene.add(this.group);
        scene.add(this.gun);
    }

    public removeFromScene(scene: Scene) {
        scene.remove(this.group);
        scene.remove(this.gun);
    }
}

ModuleLoader.registerRender("Sentry", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Sentry", () => new Map());
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
            const sentries = snapshot.getOrDefault("Vanilla.Sentry", () => new Map());
            for (const [id, sentry] of sentries) {
                if (!models.has(id)) {
                    let color: ColorRepresentation = 0xffffff;
                    if (players.has(sentry.owner)) {
                        color = playerColors[players.get(sentry.owner)!.slot % playerColors.length];
                    }
                    const model = new SentryModel(new Color(color));
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.update(sentry);
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