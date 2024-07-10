import { Color } from "@esm/three";
import { Model } from "../../library/models/lib.js";
import { IdentifierData } from "../../parser/identifier.js";
import { PlayerAnimState } from "../../parser/player/animation.js";
import { PlayerBackpack } from "../../parser/player/backpack.js";
import { Player } from "../../parser/player/player.js";
import { PlayerStats } from "../../parser/player/stats.js";
import { PlayerModel } from "../../renderer/player/model.js";
import { Camera } from "../../renderer/renderer.js";

interface PlayerModelDatablock {
    model: (color: Color) => Model<[camera: Camera, database: IdentifierData, player: Player, anim: PlayerAnimState, stats?: PlayerStats, backpack?: PlayerBackpack]>;
}

export const PlayerModelDatablock: PlayerModelDatablock = {
    model: (color: Color) => new PlayerModel(color)
};