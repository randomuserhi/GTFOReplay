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
    0x7a1a8e
];
export function getPlayerColor(slot: number) {
    return playerColors[slot % playerColors.length];
}