import { Bat } from "./Equippable/bat.js";
import { Biotracker } from "./Equippable/biotracker.js";
import { CfoamLauncher } from "./Equippable/cfoam.js";
import { Dmr } from "./Equippable/dmr.js";
import { Hammer } from "./Equippable/hammer.js";
import { Knife } from "./Equippable/knife.js";
import { MineDeployer } from "./Equippable/minedeployer.js";
import { Pack } from "./Equippable/pack.js";
import { Revolver } from "./Equippable/revolver.js";
import { Sentry } from "./Equippable/sentry.js";
import { Spear } from "./Equippable/spear.js";
import { Model } from "./equippable.js";

export interface Specification {
    equippable: Map<number, {
        id: number;
        model(): Model;
    }>;
}

const _equippable = [{
    id: 43,
    model: () => new Knife()
}, {
    id: 44,
    model: () => new Knife()
}, {
    id: 45,
    model: () => new Bat()
}, {
    id: 46,
    model: () => new Bat()
}, {
    id: 48,
    model: () => new Spear()
}, {
    id: 47,
    model: () => new Spear()
}, {
    id: 41,
    model: () => new Hammer()
}, {
    id: 42,
    model: () => new Hammer()
}, {
    id: 49,
    model: () => new Hammer()
}, {
    id: 50,
    model: () => new Hammer()
}, {
    id: 51,
    model: () => new Hammer()
}, {
    id: 53,
    model: () => new Pack(0xff0000)
}, {
    id: 54,
    model: () => new Pack(0x00ff00)
}, {
    id: 55,
    model: () => new Pack(0x0000ff)
}, {
    id: 56,
    model: () => new Pack(0xffffff)
}, {
    id: 37,
    model: () => new Sentry()
}, {
    id: 38,
    model: () => new Sentry()
}, {
    id: 39,
    model: () => new Sentry()
}, {
    id: 40,
    model: () => new Sentry()
}, {
    id: 34,
    model: () => new Biotracker()
}, {
    id: 35,
    model: () => new CfoamLauncher()
}, {
    id: 36,
    model: () => new MineDeployer()
}];
const pistols: number[] = [
    1, 2, 3, 4, 5, 16, 25
];
for (const id of pistols) {
    _equippable.push({
        id,
        model: () => new Revolver()
    });
}

const not_pistol: number[] = [
    6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29, 30, 31, 32, 33
];
for (const id of not_pistol) {
    _equippable.push({
        id,
        model: () => new Dmr()
    });
}

export const specification: Specification = {
    equippable: new Map(_equippable.map(g => [g.id, g]))
};