import { ColorRepresentation, Group } from "@esm/three";
import { getPlayerColor } from "../../../datablocks/player/player.js";
import { Model } from "../../../library/models/lib.js";
import { Enemy } from "../../../parser/enemy/enemy.js";
import { Actor } from "../../models/actor.js";
import { EnemyModelWrapper } from "../lib.js";

export interface FlyerSettings { scale?: number; color?: ColorRepresentation }
export class FlyerModel extends Model {
    anchor = new Group();
    settings: FlyerSettings = {};
    private actor: Actor;
    constructor(id = "flyer") {
        super();
        this.root.add(this.anchor);
        this.actor = new Actor(id, this.anchor);
        this.cullingRadius = this.actor.cullingRadius;
    }
    applySettings(settings: FlyerSettings) {
        Object.assign(this.settings, settings);
        this.anchor.scale.setScalar(this.settings.scale ?? 1);
        this.cullingRadius = this.actor.cullingRadius * this.anchor.scale.x;
    }
    render(dt: number, time: number, enemy: Enemy) {
        this.root.position.copy(enemy.position);
        this.anchor.quaternion.copy(enemy.rotation);
        this.actor.update(true, EnemyModelWrapper.aggroColour() && enemy.targetPlayerSlotIndex !== 255
            ? getPlayerColor(enemy.targetPlayerSlotIndex) : undefined, false, time);
    }
    dispose() { this.actor.dispose(); }
}
