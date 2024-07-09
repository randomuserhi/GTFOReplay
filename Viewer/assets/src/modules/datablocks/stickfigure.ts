import { BufferGeometry } from "@esm/three";
import { StickModelType } from "../renderer/datablocks/stickfigure";
import { Datablock } from "./lib";

export interface StickModelDatablock {
    path?: string;
    geometry?: BufferGeometry;
}

export const StickModelDatablock = new Datablock<StickModelType, StickModelDatablock>();