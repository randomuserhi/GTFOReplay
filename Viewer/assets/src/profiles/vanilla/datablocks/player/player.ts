import type { ColorRepresentation } from "@esm/three";

export interface PlayerDatablock {
    health: number
}

export const PlayerDatablock: PlayerDatablock = {
    health: 25
};

const playerColors: ColorRepresentation[] = [
    0xc21f4e,
    0x18935e,
    0x20558c,
    0x7a1a8e,
    
    0xffa500,
    0xffff00,
    0xff00ff,
    0xffffff
];
export function getPlayerColor(slot: number) {
    return playerColors[slot % playerColors.length];
}