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

const playerChatColors: { back: string, front: string }[] = [
    { back: "#c21f4e", front: "#ffffff" },
    { back: "#18935e", front: "#ffffff" },
    { back: "#20558c", front: "#ffffff" },
    { back: "#7a1a8e", front: "#ffffff" },

    { back: "#ffbb41", front: "#000000" },
    { back: "#ffff00", front: "#000000" },
    { back: "#ff00ff", front: "#ffffff" },
    { back: "#ffffff", front: "#000000" }
];
export function getPlayerChatColor(slot: number) {
    return playerChatColors[slot % playerColors.length];
}