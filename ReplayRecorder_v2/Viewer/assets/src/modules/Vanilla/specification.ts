import { AssaultRifle } from "./Equippable/assaultrifle.js";
import { AutoPistol } from "./Equippable/autopistol.js";
import { Bat } from "./Equippable/bat.js";
import { Biotracker } from "./Equippable/biotracker.js";
import { Bullpup } from "./Equippable/bullpup.js";
import { BurstPistol } from "./Equippable/burstpistol.js";
import { BurstRifle } from "./Equippable/burstrifle.js";
import { Carbine } from "./Equippable/carbine.js";
import { CfoamLauncher } from "./Equippable/cfoam.js";
import { Dmr } from "./Equippable/dmr.js";
import { DoubleTap } from "./Equippable/doubletap.js";
import { Hammer } from "./Equippable/hammer.js";
import { HelRevolver } from "./Equippable/helrevolver.js";
import { Knife } from "./Equippable/knife.js";
import { MachinePistol } from "./Equippable/machinepistol.js";
import { MineDeployer } from "./Equippable/minedeployer.js";
import { Pack } from "./Equippable/pack.js";
import { Pistol } from "./Equippable/pistol.js";
import { Revolver } from "./Equippable/revolver.js";
import { Rifle } from "./Equippable/rifle.js";
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
}, {
    id: 1,
    model: () => new Pistol()
}, {
    id: 2,
    model: () => new BurstPistol()
}, {
    id: 3,
    model: () => new HelRevolver()
}, {
    id: 4,
    model: () => new MachinePistol()
}, {
    id: 5,
    model: () => new AutoPistol()
}, {
    id: 5,
    model: () => new Bullpup()
}, {
    id: 25,
    model: () => new Revolver()
}, {
    id: 10,
    model: () => new Carbine()
}, {
    id: 11,
    model: () => new Dmr()
}, {
    id: 12,
    model: () => new DoubleTap()
}, {
    id: 13,
    model: () => new AssaultRifle()
}, {
    id: 14,
    model: () => new BurstRifle()
}, {
    id: 15,
    model: () => new Rifle()
}];

export const specification: Specification = {
    equippable: new Map(_equippable.map(g => [g.id, g]))
};