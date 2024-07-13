import { Model } from "../../../modules/library/models/lib.js";
import { IdentifierData } from "../../../modules/parser/identifier.js";
import { PlayerAnimState } from "../../../modules/parser/player/animation.js";
import { PlayerBackpack } from "../../../modules/parser/player/backpack.js";
import { Player } from "../../../modules/parser/player/player.js";
import { PlayerStats } from "../../../modules/parser/player/stats.js";
import { PlayerModel } from "../../../modules/renderer/player/model.js";
import { Camera } from "../../../modules/renderer/renderer.js";

interface PlayerModelDatablock {
    model: () => Model<[camera: Camera, database: IdentifierData, player: Player, anim: PlayerAnimState, stats?: PlayerStats, backpack?: PlayerBackpack]>;
}

export const PlayerModelDatablock: PlayerModelDatablock = {
    model: () => new PlayerModel()
};