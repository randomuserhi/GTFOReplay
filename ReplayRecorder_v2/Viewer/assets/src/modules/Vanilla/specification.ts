import { AssaultRifle } from "./Equippable/assaultrifle.js";
import { AutoPistol } from "./Equippable/autopistol.js";
import { Bat } from "./Equippable/bat.js";
import { Biotracker } from "./Equippable/biotracker.js";
import { Bullpup } from "./Equippable/bullpup.js";
import { BurstCannon } from "./Equippable/burstcannon.js";
import { BurstPistol } from "./Equippable/burstpistol.js";
import { BurstRifle } from "./Equippable/burstrifle.js";
import { Carbine } from "./Equippable/carbine.js";
import { CfoamLauncher } from "./Equippable/cfoam.js";
import { ChokeModShotgun } from "./Equippable/chokemodshotgun.js";
import { CombatShotgun } from "./Equippable/combatshotgun.js";
import { Dmr } from "./Equippable/dmr.js";
import { DoubleTap } from "./Equippable/doubletap.js";
import { Model } from "./Equippable/equippable.js";
import { Hammer } from "./Equippable/hammer.js";
import { HeavyAssaultRifle } from "./Equippable/heavyassaultrifle.js";
import { HeavySmg } from "./Equippable/heavysmg.js";
import { HelGun } from "./Equippable/helgun.js";
import { HelRevolver } from "./Equippable/helrevolver.js";
import { HelRifle } from "./Equippable/helrifle.js";
import { HelShotgun } from "./Equippable/helshotgun.js";
import { HighCal } from "./Equippable/highcal.js";
import { Knife } from "./Equippable/knife.js";
import { MachineGun0 } from "./Equippable/machinegun0.js";
import { MachineGun1 } from "./Equippable/machinegun1.js";
import { MachinePistol } from "./Equippable/machinepistol.js";
import { MineDeployer } from "./Equippable/minedeployer.js";
import { Pack } from "./Equippable/pack.js";
import { PDW } from "./Equippable/pdw.js";
import { Pistol } from "./Equippable/pistol.js";
import { PrecisionRifle } from "./Equippable/precisionrifle.js";
import { Revolver } from "./Equippable/revolver.js";
import { Rifle } from "./Equippable/rifle.js";
import { SawedOff } from "./Equippable/sawedoff.js";
import { ScatterGun } from "./Equippable/scattergun.js";
import { Sentry } from "./Equippable/sentry.js";
import { ShortRifle } from "./Equippable/shortrifle.js";
import { Shotgun } from "./Equippable/shotgun.js";
import { SlugShotgun } from "./Equippable/slugshotgun.js";
import { Smg } from "./Equippable/smg.js";
import { Sniper } from "./Equippable/sniper.js";
import { Spear } from "./Equippable/spear.js";

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
    id: 74,
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
    id: 6,
    model: () => new Bullpup()
}, {
    id: 7,
    model: () => new Smg()
}, {
    id: 8,
    model: () => new PDW()
}, {
    id: 9,
    model: () => new HeavySmg()
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
}, {
    id: 16,
    model: () => new SawedOff()
}, {
    id: 17,
    model: () => new HelShotgun()
}, {
    id: 18,
    model: () => new SlugShotgun()
}, {
    id: 19,
    model: () => new HeavyAssaultRifle()
}, {
    id: 20,
    model: () => new ShortRifle()
}, {
    id: 21,
    model: () => new Shotgun()
}, {
    id: 22,
    model: () => new CombatShotgun()
}, {
    id: 23,
    model: () => new ScatterGun()
}, {
    id: 24,
    model: () => new ChokeModShotgun()
}, {
    id: 25,
    model: () => new Revolver()
}, {
    id: 26,
    model: () => new MachineGun0()
}, {
    id: 27,
    model: () => new MachineGun1()
}, {
    id: 28,
    model: () => new BurstCannon()
}, {
    id: 29,
    model: () => new HelGun()
}, {
    id: 30,
    model: () => new HighCal()
}, {
    id: 31,
    model: () => new PrecisionRifle()
}, {
    id: 32,
    model: () => new Sniper()
}, {
    id: 33,
    model: () => new HelRifle()
}];

export const specification: Specification = {
    equippable: new Map(_equippable.map(g => [g.id, g]))
};