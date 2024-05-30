import { BoxGeometry, Color, Group, Mesh, MeshPhongMaterial, Quaternion, Scene } from "three";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import { DoorState } from "../../parser/map/door.js";
import { Bezier } from "../../renderer/bezier.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.Doors": void;
        }

        interface RenderData {
            "Doors": Map<number, DoorModel>;
            "DoorDimension": number;
        }
    }
}

class DoorModel {
    group: Group;
    left: Mesh;
    right: Mesh;

    shutter: Mesh;

    mainColor: Color;
    width: number;
    height: number;

    constructor(width: number, height: number, color: Color) {
        this.group = new Group();

        this.mainColor = color;
        this.width = width;
        this.height = height;

        const postWidth = 0.3;
        const doorWidth = 0.2;

        {
            const geometry = new BoxGeometry(postWidth, this.height, postWidth);
            const material = new MeshPhongMaterial({
                color: 0x00ff00
            });
            material.transparent = true;
            material.opacity = 0.8;

            this.left = new Mesh(geometry, material);
            this.left.castShadow = true;
            this.left.receiveShadow = true;
            this.group.add(this.left);
            this.left.position.set(-this.width / 2, 0, 0);

            this.right = new Mesh(geometry, material);
            this.right.castShadow = true;
            this.right.receiveShadow = true;
            this.group.add(this.right);
            this.right.position.set(this.width / 2, 0, 0);
        }
    
        {
            const geometry = new BoxGeometry(this.width - postWidth, this.height, doorWidth);
            const material = new MeshPhongMaterial({
                color: 0x00ff00
            });
            material.transparent = true;
            material.opacity = 0.5;

            this.shutter = new Mesh(geometry, material);
            this.shutter.castShadow = true;
            this.shutter.receiveShadow = true;
            this.group.add(this.shutter);
            this.shutter.position.set(0, 0, 0);
        }
    }

    private static bezier = Bezier(0.5, 0.0, 0.5, 1);
    public update(t: number, door: DoorState) {
        switch(door.status) {
        case "Closed":
        case "Open": {
            const animDuration = 4000;
            let lerp = 1;
            if (door.change !== undefined) {
                if (t < door.change) throw new Error(`Door state change happened after current time step? ${t} < ${door.change}`);
                const diff = t - door.change;
                lerp = DoorModel.bezier(Math.clamp01(diff / animDuration));
            }

            if (door.status === "Open") {
                this.shutter.scale.y = Math.clamp01(0.05 + (1 - lerp));
            } else if (door.status === "Closed") {
                this.shutter.scale.y = Math.clamp01(0.05 + (lerp));
            }
        } break;
        default: this.shutter.scale.y = 1; break;
        }
        this.shutter.position.set(this.shutter.position.x, this.height / 2 * (1 - this.shutter.scale.y), this.shutter.position.z);

        let color = this.mainColor.getHex();
        switch (door.status) {
        case "Glued": color = 0x0000ff; break;
        case "Destroyed": color = 0x444444; break;
        }
        (this.left.material as MeshPhongMaterial).color.setHex(color);
        (this.right.material as MeshPhongMaterial).color.setHex(color);
        (this.shutter.material as MeshPhongMaterial).color.setHex(color);
    }

    public addToScene(scene: Scene) {
        scene.add(this.group);
    }

    public setVisible(visible: boolean) {
        this.group.visible = visible;
    }    

    public setPosition(x: number, y: number, z: number) {
        this.group.position.set(x, y + this.height / 2, z);
    }
    public setRotation(x: number, y: number, z: number, w: number) {
        this.group.setRotationFromQuaternion(new Quaternion(x, y, z, w));
    }
}

// TODO(randomuserhi): Proper door models
ModuleLoader.registerRender("Vanilla.Doors", (name, api) => {
    const initPasses = api.getInitPasses();
    api.setInitPasses([{ 
        name, pass: (renderer, header) => {
            const doors = header.getOrDefault("Vanilla.Map.Doors", () => new Map());
            const models = renderer.getOrDefault("Doors", () => new Map());
            for (const [id, door] of doors) {
                if (!models.has(id)) {
                    const height = 4;
                    let width = 7;
                    switch(door.size) {
                    case "Small": width = 4; break;
                    }

                    const model = new DoorModel(width, height, new Color(door.type === "WeakDoor" ? 0x00ff00 : 0xff5555));
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.setPosition(door.position.x, door.position.y, door.position.z);
                model.setRotation(door.rotation.x, door.rotation.y, door.rotation.z, door.rotation.w);
                model.setVisible(false);
            }
        } 
    }, ...initPasses]);

    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const t = snapshot.time();

            const doors = snapshot.header.getOrDefault("Vanilla.Map.Doors", () => new Map());
            const states = snapshot.getOrDefault("Vanilla.Map.DoorState", () => new Map());
            const models = renderer.getOrDefault("Doors", () => new Map());
            for (const [id, door] of doors) {
                const model = models.get(id)!;

                if (!states.has(id)) states.set(id, { id, status: "Closed" });
                const state = states.get(id)!;

                model.update(t, state);
                model.setVisible(door.dimension === renderer.get("Dimension"));
            }
        } 
    }]);
});