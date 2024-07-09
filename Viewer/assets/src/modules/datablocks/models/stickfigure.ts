import { BufferGeometry } from "@esm/three";
import { Datablock } from "../../datablocks/lib";
import { StickModelType } from "../../renderer/datablocks/stickfigure";

export interface StickModelDatablock {
    path?: string;
    geometry?: BufferGeometry;
}

export const StickModelDatablock = new Datablock<StickModelType, StickModelDatablock>();