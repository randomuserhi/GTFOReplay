import { BoxGeometry, CapsuleGeometry, Group, Mesh, MeshPhongMaterial, Quaternion, Scene } from "three";
import * as BitHelper from "../../replay/bithelper.js";
import { ModuleLoader } from "../../replay/moduleloader.js";
import * as Pod from "../../replay/pod.js";
import { DynamicTransform } from "../replayrecorder.js";

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Player": {
                parse: {
                    dimension: number;
                    absolute: boolean;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                    state: PlayerState;
                };
                spawn: {
                    dimension: number;
                    position: Pod.Vector;
                    rotation: Pod.Quaternion;
                    snet: bigint;
                    slot: number;
                    nickname: string;
                };
                despawn: void;
            };
        }
    
        interface Events {
            "Vanilla.Player.Melee": {
                id: number;
                melee: MeleeState;
            }
            "Vanilla.Player.MeleeShove": {
                id: number;
            }
            "Vanilla.Player.MeleeSwing": {
                id: number;
            }
        }

        interface Data {
            "Vanilla.Player": Map<number, Player>
        }
    }
}

export interface Player extends DynamicTransform {
    snet: bigint;
    slot: number;
    nickname: string;
    state: PlayerState;

    melee: MeleeState;
    meleeShove?: number;
    meleeSwing?: number; 
}

type PlayerState = 
    "Default" |
    "Crouch" |
    "Downed" |
    "Jump/Fall"; 
const playerStateTypemap: PlayerState[] = [
    "Default",
    "Crouch",
    "Downed",
    "Jump/Fall"
];

type MeleeState = 
    "Idle" |
    "Charge";
const meleeStateTypemap: MeleeState[] = [
    "Idle",
    "Charge"
];

ModuleLoader.registerDynamic("Vanilla.Player", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicTransform.parseTransform(data);
            return {
                ...result,
                state: playerStateTypemap[await BitHelper.readByte(data)]
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
    
            if (!players.has(id)) throw new PlayerNotFound(`Dynamic of id '${id}' was not found.`);
            const player = players.get(id)!;
            DynamicTransform.lerp(player, data, lerp);
            player.state = data.state;
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicTransform.parseSpawn(data);
            const result = {
                ...spawn,
                snet: await BitHelper.readULong(data),
                slot: await BitHelper.readByte(data),
                nickname: await BitHelper.readString(data)
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
        
            const { snet } = data;
        
            if (players.has(id)) throw new DuplicatePlayer(`Player of id '${id}(${snet})' already exists.`);
            players.set(id, { id, ...data, state: "Default", melee: "Idle" });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());

            if (!players.has(id)) throw new PlayerNotFound(`Player of id '${id}' did not exist.`);
            players.delete(id);
        }
    }
});

ModuleLoader.registerEvent("Vanilla.Player.Melee", "0.0.1", {
    parse: async (data) => {
        return {
            id: await BitHelper.readInt(data),
            melee: meleeStateTypemap[await BitHelper.readByte(data)]
        };
    },
    exec: (data, snapshot) => {
        const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());

        const { id, melee } = data;
        if (!players.has(id)) throw new PlayerNotFound(`Player of id '${id}' did not exist.`);
        players.get(id)!.melee = melee;
    }
});

ModuleLoader.registerEvent("Vanilla.Player.MeleeShove", "0.0.1", {
    parse: async (data) => {
        return {
            id: await BitHelper.readInt(data)
        };
    },
    exec: (data, snapshot) => {
        const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());

        const { id } = data;
        if (!players.has(id)) throw new PlayerNotFound(`Player of id '${id}' did not exist.`);
        players.get(id)!.meleeShove = snapshot.time();
    }
});

ModuleLoader.registerEvent("Vanilla.Player.MeleeSwing", "0.0.1", {
    parse: async (data) => {
        return {
            id: await BitHelper.readInt(data)
        };
    },
    exec: (data, snapshot) => {
        const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());

        const { id } = data;
        if (!players.has(id)) throw new PlayerNotFound(`Player of id '${id}' did not exist.`);
        players.get(id)!.meleeSwing = snapshot.time();
    }
});

export class PlayerNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicatePlayer extends Error {
    constructor(message?: string) {
        super(message);
    }
}

// --------------------------- RENDERING ---------------------------


declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Players": void;
        }

        interface RenderData {
            "Players": Map<number, PlayerModel>;
        }
    }
}

class HammerModel {
    readonly group: Group;
    readonly handle: Mesh;
    readonly head: Mesh;

    constructor() {
        this.group = new Group;

        const radius = 0.05;
        const height = 1;

        const material = new MeshPhongMaterial({
            color: 0x00ff00
        });
        material.transparent = true;
        material.opacity = 0.8;

        {
            const geometry = new CapsuleGeometry(radius, height, 10, 10);

            this.handle = new Mesh(geometry, material);
            this.handle.castShadow = true;
            this.handle.receiveShadow = true;
            this.group.add(this.handle);
        }

        {
            const geometry = new BoxGeometry(0.2, 0.2, 0.4);

            this.head = new Mesh(geometry, material);
            this.head.castShadow = true;
            this.head.receiveShadow = true;
            this.group.add(this.head);
            this.head.position.set(0, height / 2 + radius / 2, 0);
        }
    }

    public update(t: number, player: Player) {
        const animDuration = 200;

        if (player.meleeShove !== undefined || player.meleeSwing !== undefined) {
            let animationType: "shove" | "swing" = "shove";
            let animationTime: number | undefined = player.meleeShove;
            if (animationTime === undefined || (player.meleeSwing != undefined && animationTime < player.meleeSwing)) {
                animationType = "swing";
                animationTime = player.meleeSwing;
            }
            if (animationTime === undefined) throw new Error(`Unreachable`);

            let lerp = 1;
            if (t < animationTime) throw new Error(`Player action happened after current time step? ${t} < ${animationTime}`);
            const diff = t - animationTime;
            lerp = Math.clamp01(diff / animDuration);

            if (lerp < 1) {
                if (animationType === "shove") {
                    this.group.position.set(0, -0.3, 0.5);
                    this.group.setRotationFromQuaternion(new Quaternion(0, 0, 0.707, 0.707));
                } else {
                    this.group.position.set(0, -0.3, 1.3);
                    this.group.setRotationFromQuaternion(new Quaternion(0.707, 0, 0, 0.707));
                }

                this.setVisible(true);
                return;
            }
        }
        
        if (player.melee === "Charge") {
            this.group.position.set(0, 0.5, -0.4);
            this.group.setRotationFromQuaternion(new Quaternion(-0.707, 0, 0, 0.707));

            this.setVisible(true);
            return;
        }

        this.setVisible(false);
    }

    public setVisible(visible: boolean) {
        this.group.visible = visible;
    }    

    public setPosition(x: number, y: number, z: number) {
        this.group.position.set(x, y, z);
    }
    public setRotation(x: number, y: number, z: number, w: number) {
        this.group.setRotationFromQuaternion(new Quaternion(x, y, z, w));
    }
}

class PlayerModel {
    readonly group: Group;
    readonly body: Mesh;
    readonly crouch: Mesh;
    readonly head: Group;
    readonly eyes: Mesh;

    readonly hammer: HammerModel;

    private radius: number;
    private height: number;

    constructor() {
        this.group = new Group;

        this.hammer = new HammerModel();

        this.radius = 0.25;
        this.height = 1;
        
        const material = new MeshPhongMaterial({
            color: 0x00ff00
        });
        material.transparent = true;
        material.opacity = 0.8;

        {
            const geometry = new CapsuleGeometry(this.radius * 1.1, this.height, 10, 10);

            this.body = new Mesh(geometry, material);
            this.body.castShadow = true;
            this.body.receiveShadow = true;
            this.group.add(this.body);
            this.body.position.set(0, this.height / 2 + this.radius * 1.1, 0);
        }

        {
            this.head = new Group();
            this.group.add(this.head);
            this.head.position.set(0, this.height + this.radius * 1.1, 0);

            
            this.head.add(this.hammer.group);
            this.hammer.setPosition(0, 0, 0);
        }

        {
            const geometry = new BoxGeometry(this.radius * 2, this.radius / 2, this.radius * 1.4);

            this.eyes = new Mesh(geometry, material);
            this.eyes.castShadow = true;
            this.eyes.receiveShadow = true;
            this.head.add(this.eyes);
            this.eyes.position.set(0, 0, this.radius * 1.4 / 2);
        }
    }

    public update(t: number, player: Player) {
        let scale = 1; 
        switch(player.state) {
        case "Crouch": scale = 0.5; break;
        }

        const height = this.height * scale;
        this.body.scale.y = scale;
        this.body.position.set(0, height / 2 + this.radius * 1.1, 0);
        this.head.position.set(0, height + this.radius * 1.1, 0);

        this.hammer.update(t, player);
    }

    public addToScene(scene: Scene) {
        scene.add(this.group);
    }

    public removeFromScene(scene: Scene) {
        scene.remove(this.group);
    }

    public setVisible(visible: boolean) {
        this.group.visible = visible;
        this.hammer.setVisible(visible);
    }    

    public setPosition(x: number, y: number, z: number) {
        this.group.position.set(x, y, z);
    }
    public setRotation(x: number, y: number, z: number, w: number) {
        this.head.setRotationFromQuaternion(new Quaternion(x, y, z, w));
    }
}

// TODO(randomuserhi): Proper player models
ModuleLoader.registerRender("Players", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([{ 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Players", () => new Map());
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
            for (const [id, player] of players) {
                if (!models.has(id)) {
                    const model = new PlayerModel();
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.setPosition(player.position.x, player.position.y, player.position.z);
                model.setRotation(player.rotation.x, player.rotation.y, player.rotation.z, player.rotation.w);
                model.setVisible(player.dimension === renderer.get("Dimension"));
                model.update(snapshot.time(), player);
            }

            for (const [id, model] of [...models.entries()]) {
                if (!players.has(id)) {
                    model.removeFromScene(renderer.scene);
                    models.delete(id);
                }
            }
        } 
    }, ...renderLoop]);
});