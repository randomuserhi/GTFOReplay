import { Model } from "../../library/models/lib.js";
import { IdentifierData } from "../../parser/identifier.js";
import { PlayerAnimState } from "../../parser/player/animation.js";
import { PlayerBackpack } from "../../parser/player/backpack.js";
import { Player } from "../../parser/player/player.js";
import { PlayerStats } from "../../parser/player/stats.js";
import { PlayerModel } from "../../renderer/player/model.js";
import { Camera } from "../../renderer/renderer.js";

if (module.isParser) console.warn("Datablocks should not be loaded by the parser. This degrades performance greatly.");

interface PlayerModelDatablock {
    model: () => Model<[camera: Camera, database: IdentifierData, player: Player, anim: PlayerAnimState, stats?: PlayerStats, backpack?: PlayerBackpack]>;
}

export const PlayerModelDatablock: PlayerModelDatablock = {
    model: () => new PlayerModel()
};