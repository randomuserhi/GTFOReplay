import { Camera, Color, ColorRepresentation, Group, Matrix4, Quaternion, Vector3 } from "three";
import { Text } from "troika-three-text";
import { getInstance } from "../../../replay/instancing.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";
import { Equippable } from "../Equippable/equippable.js";
import { SkeletonModel, upV, zeroQ, zeroV } from "../humanmodel.js";
import { specification } from "../specification.js";
import { Player, PlayerSkeleton } from "./player.js";
import { PlayerBackpack, inventorySlotMap, inventorySlots } from "./playerbackpack.js";
import { PlayerStats } from "./playerstats.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Players": void;
        }

        interface RenderData {
            "Players": Map<number, PlayerModel>;
        }
    }
}

class PlayerModel extends SkeletonModel {
    equipped: Group;

    slots: Equippable[];
    backpack: Group;
    backpackAligns: Group[];

    tmp?: Text;

    constructor(color: Color) {
        super(color);

        this.tmp = new Text();
        this.tmp.font = "./fonts/oxanium/Oxanium-SemiBold.ttf";
        this.tmp.fontSize = 0.2;
        this.tmp.position.y = 2;
        this.tmp.textAlign = "center";
        this.tmp.anchorX = "center";
        this.tmp.anchorY = "bottom";
        this.tmp.color = 0xffffff;
        this.tmp.visible = false;

        this.equipped = new Group();
        this.backpack = new Group();
        this.group.add(this.equipped, this.backpack, this.tmp);

        this.slots = new Array(inventorySlots.length);
        this.backpackAligns = new Array(inventorySlots.length);
        for (let i = 0; i < inventorySlots.length; ++i) {
            this.slots[i] = { id: 0 };

            this.backpackAligns[i] = new Group();
            this.backpack.add(this.backpackAligns[i]);
        }

        this.backpackAligns[inventorySlotMap.get("melee")!].position.set(0.03, 0.01130009, -0.5089508);
        this.backpackAligns[inventorySlotMap.get("melee")!].rotateX(Math.PI);

        this.backpackAligns[inventorySlotMap.get("main")!].position.set(-0.15, 0.078, -0.395);
        this.backpackAligns[inventorySlotMap.get("main")!].quaternion.set(0.5, -0.5, 0.5, 0.5);

        this.backpackAligns[inventorySlotMap.get("special")!].position.set(0.159, 0.07800007, -0.223);
        this.backpackAligns[inventorySlotMap.get("special")!].quaternion.set(0.704416037, 0.0616284497, -0.0616284497, 0.704416037);

        this.backpackAligns[inventorySlotMap.get("tool")!].position.set(-0.295, 0.07800007, -0.318);
        this.backpackAligns[inventorySlotMap.get("tool")!].quaternion.set(0.0979499891, 0.700289905, -0.700289726, 0.0979499221);

        this.backpackAligns[inventorySlotMap.get("pack")!].position.set(-0.003, -0.2, -0.24);
        this.backpackAligns[inventorySlotMap.get("pack")!].quaternion.set(0, -0.263914526, 0, 0.964546144);
        this.backpackAligns[inventorySlotMap.get("pack")!].scale.set(0.7, 0.7, 0.7);
    }

    public update(skeleton: PlayerSkeleton): void {
        if (!this.group.visible) return;

        super.update(skeleton);

        const x = this.group.position.x;
        const y = this.group.position.y;
        const z = this.group.position.z;

        this.backpack.position.set(skeleton.backpackPos.x, skeleton.backpackPos.y, skeleton.backpackPos.z);
        this.backpack.quaternion.set(skeleton.backpackRot.x, skeleton.backpackRot.y, skeleton.backpackRot.z, skeleton.backpackRot.w);

        this.equipped.position.set(skeleton.wieldedPos.x, skeleton.wieldedPos.y, skeleton.wieldedPos.z);
        this.equipped.quaternion.set(skeleton.wieldedRot.x, skeleton.wieldedRot.y, skeleton.wieldedRot.z, skeleton.wieldedRot.w);
        for (let i = 0; i < this.slots.length; ++i) {
            const item = this.slots[i];
            if (item.model !== undefined) {
                const isEquipped = item.model.group.parent !== null && item.model.group.parent.id == this.equipped.id;
                item.model.update(isEquipped ? skeleton.foldRot : item.model.baseFoldRot);
            }
        }

        const radius = 0.05;
        const sM = new Vector3(radius, radius, radius);

        const bodyTop = Pod.Vec.mid(skeleton.LULeg, skeleton.RULeg);
        bodyTop.x += x;
        bodyTop.y += y;
        bodyTop.z += z;
        const bodyBottom = { x: skeleton.head.x + x, y: skeleton.head.y + y, z: skeleton.head.z + z };

        const pM = new Matrix4();
        pM.lookAt(new Vector3(bodyBottom.x, bodyBottom.y, bodyBottom.z).sub(bodyTop), zeroV, upV);
        getInstance("Cylinder.MeshPhong").setMatrixAt(this.parts[0], pM.compose(new Vector3(bodyTop.x, bodyTop.y, bodyTop.z), new Quaternion().setFromRotationMatrix(pM), new Vector3(radius, radius, Pod.Vec.dist(bodyTop, bodyBottom) * 0.7)));

        const spheres = getInstance("Sphere.MeshPhong");
        spheres.setMatrixAt(this.points[0], pM.compose(new Vector3(bodyTop.x, bodyTop.y, bodyTop.z), zeroQ, sM));
        spheres.setMatrixAt(this.points[1], pM.compose(new Vector3(bodyTop.x + (bodyBottom.x - bodyTop.x) * 0.7, bodyTop.y + (bodyBottom.y - bodyTop.y) * 0.7, bodyTop.z + (bodyBottom.z - bodyTop.z) * 0.7), zeroQ, sM));
    }

    public morph(player: Player) {
        this.group.position.set(player.position.x, player.position.y, player.position.z);
    }

    public updateTmp(player: Player, camera: Camera, stats?: PlayerStats, backpack?: PlayerBackpack) {
        if (this.tmp !== undefined) {
            if (stats === undefined) {
                this.tmp.visible = false;   
                return;
            }
            
            const nickname = player.nickname.replace(/<\/?[^>]+(>|$)/g, "");
            const health = `Health: ${Math.round(stats.health * 100).toString().padStart(3)}%`;
            const infectionValue = Math.round(stats.infection * 100);
            const infection = `${(infectionValue >= 10 ? ` (${infectionValue.toString().padStart(3)}%)` : "")}`;
            if (backpack === undefined) {
                this.tmp.text = `${nickname}
${health}${infection}
Main: ${Math.round(stats.primaryAmmo * 100).toString().padStart(3)}%
Special: ${Math.round(stats.secondaryAmmo * 100).toString().padStart(3)}%
Tool: ${Math.round(stats.toolAmmo * 100).toString().padStart(3)}%`;
                this.tmp.colorRanges = {
                    0: playerColors[player.slot],
                    [nickname.length]: 0xffffff,
                };
            } else {
                const main = specification.equippable.get(backpack.slots[inventorySlotMap.get("main")!]);
                const special = specification.equippable.get(backpack.slots[inventorySlotMap.get("special")!]);
                const tool = specification.equippable.get(backpack.slots[inventorySlotMap.get("tool")!]);
                this.tmp.text = `${nickname}
${health}${infection}
${(main !== undefined && main.name !== undefined ? main.name : "Main")}: ${Math.round(stats.primaryAmmo * 100).toString().padStart(3)}%
${(special !== undefined && special.name !== undefined ? special.name : "Special")}: ${Math.round(stats.secondaryAmmo * 100).toString().padStart(3)}%
${(tool !== undefined && tool.name !== undefined ? tool.name : "Tool")}: ${Math.round(stats.toolAmmo * 100).toString().padStart(3)}%`;
                this.tmp.colorRanges = {
                    0: playerColors[player.slot],
                    [nickname.length]: 0xffffff,
                    [nickname.length + health.length + 1]: 0x03e8fc, 
                    [nickname.length + health.length + 1 + infection.length]: 0xffffff
                };
            }
            this.tmp.visible = true;

            const tmpPos = new Vector3();
            this.tmp.getWorldPosition(tmpPos);

            const camPos = new Vector3();
            camera.getWorldPosition(camPos);

            const lerp = Math.clamp01(camPos.distanceTo(tmpPos) / 30);
            this.tmp.fontSize = lerp * 0.3 + 0.05;
            this.tmp.lookAt(camPos);
        }
    }

    public updateBackpack(player: Player, backpack?: PlayerBackpack) {
        if (backpack === undefined) return;

        for (let i = 0; i < this.slots.length; ++i) {
            const item = this.slots[i];
            if (item.model !== undefined) {
                item.model.group.removeFromParent();
            }

            if (item.model === undefined || backpack.slots[i] !== item.id) {
                item.id = backpack.slots[i];
                item.model = specification.equippable.get(backpack.slots[i])?.model();
            }

            if (item.model !== undefined) {
                if (item.id === player.equippedId) {
                    this.equipped.add(item.model.group);
                    item.model.group.position.set(0, 0, 0);
                    item.model.group.quaternion.set(0, 0, 0, 1);
                } else {
                    this.backpackAligns[i].add(item.model.group);
                    item.model.group.position.copy(item.model.offsetPos);
                    item.model.group.quaternion.copy(item.model.offsetRot);
                }
            }
        }
    }

    public dispose() {
        this.tmp?.dispose();
        this.tmp = undefined;
    }
}

export const playerColors: ColorRepresentation[] = [
    0xc21f4e,
    0x18935e,
    0x20558c,
    0x7a1a8e
];

ModuleLoader.registerRender("Players", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const camera = renderer.get("Camera")!;
            const models = renderer.getOrDefault("Players", () => new Map());
            const players = snapshot.getOrDefault("Vanilla.Player", () => new Map());
            const backpacks = snapshot.getOrDefault("Vanilla.Player.Backpack", () => new Map());
            const stats = snapshot.getOrDefault("Vanilla.Player.Stats", () => new Map());
            const skeletons = snapshot.getOrDefault("Vanilla.Player.Model", () => new Map());
            for (const [id, player] of players) {
                if (!models.has(id)) {
                    const model = new PlayerModel(new Color(playerColors[player.slot]));
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                const skeleton = skeletons.get(id);
                if (skeleton !== undefined) {
                    model.morph(player);
                    model.update(skeleton);
                    const backpack = backpacks.get(id);
                    model.updateBackpack(player, backpack);
                    model.updateTmp(player, camera, stats.get(id), backpack);
                } else {
                    // TODO
                }
                model.setVisible(player.dimension === renderer.get("Dimension"));
            }

            for (const [id, model] of [...models.entries()]) {
                if (!players.has(id)) {
                    model.removeFromScene(renderer.scene);
                    model.dispose();
                    models.delete(id);
                }
            }
        } 
    }]);
});

ModuleLoader.registerDispose((renderer) => {
    const models = renderer.getOrDefault("Players", () => new Map());
    for (const model of models.values()) {
        model.dispose();
    }
});