import { ColorRepresentation, Object3D, Vector3 } from "@esm/three";
import { Text } from "@esm/troika-three-text";
import { EnemyAnimHandle, EnemyAnimHandlesDatablock } from "../../datablocks/enemy/animation";
import { EnemyDatablock } from "../../datablocks/enemy/enemy";
import { EnemyModelDatablock } from "../../datablocks/enemy/model";
import { playerColors } from "../../datablocks/player/player";
import { Model } from "../../library/models/lib";
import { EnemyAnimState } from "../../parser/enemy/animation";
import { Enemy } from "../../parser/enemy/enemy";
import { Player } from "../../parser/player/player";
import { HumanJoints } from "../animations/human";
import { Camera } from "../renderer";
import { HumanoidEnemyModel } from "./models/humanoid";

export class EnemyModel {
    model: Model<[enemy: Enemy, anim: EnemyAnimState]>;

    tmp?: Text;
    tmpHeight: number;
    tag?: Text;

    animHandle?: EnemyAnimHandle;
    datablock?: EnemyDatablock;
    modelDatablock?: EnemyModelDatablock;

    tagTarget?: Object3D;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(enemy: Enemy) {
        this.datablock = EnemyDatablock.get(enemy.type);
        this.modelDatablock = EnemyModelDatablock.get(enemy.type);
        if (enemy.animHandle !== undefined) this.animHandle = EnemyAnimHandlesDatablock.get(enemy.animHandle);
        if (this.modelDatablock !== undefined) this.model = this.modelDatablock.model(this, enemy);
        else this.model = new HumanoidEnemyModel(this);

        this.tmp = new Text();
        this.tmp.font = "./fonts/oxanium/Oxanium-SemiBold.ttf";
        this.tmp.fontSize = 0.2;
        this.tmp.textAlign = "center";
        this.tmp.anchorX = "center";
        this.tmp.anchorY = "bottom";
        this.tmp.color = 0xffffff;
        this.tmp.visible = false;
        this.tmpHeight = (this.modelDatablock?.tmpHeight === undefined ? 2.2 : this.modelDatablock.tmpHeight) * enemy.scale;
        this.tmp.position.y = this.tmpHeight;
        this.model.root.add(this.tmp);

        this.tag = new Text();
        this.tag.font = "./fonts/oxanium/Oxanium-ExtraBold.ttf";
        this.tag.fontSize = 0.2;
        this.tag.textAlign = "center";
        this.tag.anchorX = "center";
        this.tag.anchorY = "bottom";
        this.tag.color = 0xffffff;
        this.tag.visible = false;
        this.tag.text = `Δ
·`;
        this.tag.colorRanges = {
            0: 0xff0000,
            1: 0xffffff,
        };
        this.tag.material.depthTest = false;
        this.tag.material.depthWrite = false;
        this.tag.renderOrder = Infinity;
        this.model.root.add(this.tag);
    }

    public static showInfo: boolean = false;

    private static FUNC_updateTmp = {
        tagPos: new Vector3()
    } as const;
    public updateTmp(enemy: Enemy, anim: EnemyAnimState, camera: Camera, players: (Player | undefined)[]) {
        if (this.tmp === undefined || this.tag === undefined) return;
        
        if (!this.model.isVisible()) {
            this.tmp.visible = false;
            this.tag.visible = false;
            return;
        }
        
        const { tagPos } = EnemyModel.FUNC_updateTmp;

        this.tag.visible = enemy.tagged;
        if (this.tagTarget === undefined) {
            this.tag.position.copy(this.model.root.position);
        } else {
            this.tag.position.copy(this.tagTarget.getWorldPosition(tagPos).sub(this.model.root.position));
        }
        
        let target = "Unknown";
        let color: ColorRepresentation = 0xffffff;
        const player = players[enemy.targetPlayerSlotIndex];
        if (player !== undefined) {
            target = player.nickname;
            color = playerColors[player.slot]; 
        }

        this.tmp.text = `${(this.datablock !== undefined ? this.datablock.name : enemy.type.hash)}
State: ${anim.state}
Anim: ${enemy.animHandle}
HP: ${Math.round(enemy.health * 10) / 10}
Target: `;
        this.tmp.colorRanges = {
            0: 0xffffff,
            [this.tmp.text.length]: color,
        };
        this.tmp.text += target;

        this.tmp.visible = EnemyModel.showInfo;

        this.orientateText(this.tmp, camera, 0.3, 0.05);
        this.orientateText(this.tag, camera, 0.5, 0.1);
    }

    public addToLimb(obj: Object3D, limb: HumanJoints) {
        if ((this.model as any).addToLimb !== undefined) {
            (this.model as any).addToLimb(obj, limb);
        } else {
            obj.visible = false;
        }
    }

    private static FUNC_orientateText = {
        tmpPos: new Vector3(),
        camPos: new Vector3()
    } as const;
    private orientateText(tmp: Text, camera: Camera, scale: number, min: number) {
        const { tmpPos, camPos } = EnemyModel.FUNC_orientateText;

        tmp.getWorldPosition(tmpPos);
        camera.root.getWorldPosition(camPos);

        const lerp = Math.clamp01(camPos.distanceTo(tmpPos) / 30);
        tmp.fontSize = lerp * scale + min;
        tmp.lookAt(camPos);
    }

    public dispose(): void {
        this.tag?.dispose();
        this.tag = undefined;

        this.tmp?.dispose();
        this.tmp = undefined;
    }
}