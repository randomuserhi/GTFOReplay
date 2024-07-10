import { Color } from "@esm/three";
import { Model } from "../../../library/models/lib";
import { IdentifierData } from "../../../parser/identifier";
import { PlayerAnimState } from "../../../parser/player/animation";
import { PlayerBackpack } from "../../../parser/player/backpack";
import { Player } from "../../../parser/player/player";
import { PlayerStats } from "../../../parser/player/stats";
import { PlayerModel } from "../../player/model";
import { Camera } from "../../renderer";

interface PlayerModelDatablock {
    model: (color: Color) => Model<[camera: Camera, database: IdentifierData, player: Player, anim: PlayerAnimState, stats?: PlayerStats, backpack?: PlayerBackpack]>;
}

export const PlayerModelDatablock: PlayerModelDatablock = {
    model: (color: Color) => new PlayerModel(color)
};