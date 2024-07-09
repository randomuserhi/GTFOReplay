import { Color } from "@esm/three";
import { Model } from "../../../library/models/lib";
import { PlayerModel } from "../../player/model";

interface PlayerModelDatablock {
    model: (color: Color) => Model;
}

export const PlayerModelDatablock: PlayerModelDatablock = {
    model: (color: Color) => new PlayerModel(color)
};