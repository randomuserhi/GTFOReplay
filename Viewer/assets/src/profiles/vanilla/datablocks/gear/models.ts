import { Vector3, Vector3Like } from "@esm/three";
import { Identifier } from "../../parser/identifier.js";
import { GearFoldAnimation } from "../../renderer/animations/gearfold.js";
import { HumanAnimation } from "../../renderer/animations/human.js";
import { GearModel } from "../../renderer/models/gear.js";
import { AssaultRifle } from "../../renderer/models/prebuilt/assaultrifle.js";
import { AutoPistol } from "../../renderer/models/prebuilt/autopistol.js";
import { Bat } from "../../renderer/models/prebuilt/bat.js";
import { Biotracker } from "../../renderer/models/prebuilt/biotracker.js";
import { Bullpup } from "../../renderer/models/prebuilt/bullpup.js";
import { BurstCannon } from "../../renderer/models/prebuilt/burstcannon.js";
import { BurstPistol } from "../../renderer/models/prebuilt/burstpistol.js";
import { BurstRifle } from "../../renderer/models/prebuilt/burstrifle.js";
import { Carbine } from "../../renderer/models/prebuilt/carbine.js";
import { CfoamLauncher } from "../../renderer/models/prebuilt/cfoam.js";
import { ChokeModShotgun } from "../../renderer/models/prebuilt/chokemodshotgun.js";
import { CombatShotgun } from "../../renderer/models/prebuilt/combatshotgun.js";
import { Dmr } from "../../renderer/models/prebuilt/dmr.js";
import { DoubleTap } from "../../renderer/models/prebuilt/doubletap.js";
import { HackingTool } from "../../renderer/models/prebuilt/hackingtool.js";
import { Hammer } from "../../renderer/models/prebuilt/hammer.js";
import { HeavyAssaultRifle } from "../../renderer/models/prebuilt/heavyassaultrifle.js";
import { HeavySmg } from "../../renderer/models/prebuilt/heavysmg.js";
import { HelGun } from "../../renderer/models/prebuilt/helgun.js";
import { HelRevolver } from "../../renderer/models/prebuilt/helrevolver.js";
import { HelRifle } from "../../renderer/models/prebuilt/helrifle.js";
import { HelShotgun } from "../../renderer/models/prebuilt/helshotgun.js";
import { HighCal } from "../../renderer/models/prebuilt/highcal.js";
import { Knife } from "../../renderer/models/prebuilt/knife.js";
import { MachineGun0 } from "../../renderer/models/prebuilt/machinegun0.js";
import { MachineGun1 } from "../../renderer/models/prebuilt/machinegun1.js";
import { MachinePistol } from "../../renderer/models/prebuilt/machinepistol.js";
import { MineDeployer } from "../../renderer/models/prebuilt/minedeployer.js";
import { PDW } from "../../renderer/models/prebuilt/pdw.js";
import { Pistol } from "../../renderer/models/prebuilt/pistol.js";
import { PrecisionRifle } from "../../renderer/models/prebuilt/precisionrifle.js";
import { Revolver } from "../../renderer/models/prebuilt/revolver.js";
import { Rifle } from "../../renderer/models/prebuilt/rifle.js";
import { SawedOff } from "../../renderer/models/prebuilt/sawedoff.js";
import { ScatterGun } from "../../renderer/models/prebuilt/scattergun.js";
import { Sentry } from "../../renderer/models/prebuilt/sentry.js";
import { ShortRifle } from "../../renderer/models/prebuilt/shortrifle.js";
import { Shotgun } from "../../renderer/models/prebuilt/shotgun.js";
import { SlugShotgun } from "../../renderer/models/prebuilt/slugshotgun.js";
import { Smg } from "../../renderer/models/prebuilt/smg.js";
import { Sniper } from "../../renderer/models/prebuilt/sniper.js";
import { Spear } from "../../renderer/models/prebuilt/spear.js";
import { Archetype } from "../items/item.js";
import { Datablock } from "../lib.js";
import { PlayerAnimDatablock } from "../player/animation.js";
import { GearAnimDatablock } from "./animation.js";

if (module.isParser) console.warn("Datablocks should not be loaded by the parser. This degrades performance greatly.");

export interface MeleeArchetype {
    equipAnim: HumanAnimation,
    movementAnim: HumanAnimation,
    jumpAnim: HumanAnimation,
    fallAnim: HumanAnimation,
    landAnim: HumanAnimation,
    attackAnim: HumanAnimation,
    chargeAnim: HumanAnimation,
    chargeIdleAnim: HumanAnimation,
    releaseAnim: HumanAnimation,
    shoveAnim: HumanAnimation,
}

export interface GunArchetype {
    gunFoldAnim: GearFoldAnimation;
    offset?: Vector3Like;
}


export interface GearDatablock {
    model: (gearJSON: string) => GearModel;
    type?: Archetype;
    name?: string;
    meleeArchetype?: MeleeArchetype;
    gunArchetype?: GunArchetype;
}

export const GearDatablock = new Datablock<Identifier, GearDatablock>((identifier) => {
    if (identifier.type === "Unknown") return undefined;
    if (identifier.type !== "Gear") throw new Error(`Identifier did not represent gear: ${identifier.hash}`);
    return identifier.stringKey;
});

const playerAnimations = PlayerAnimDatablock.obj();
const gearFoldAnimations = GearAnimDatablock.obj();

export const hammerArchetype: MeleeArchetype = {
    equipAnim: playerAnimations.Equip_Melee,
    movementAnim: playerAnimations.hammerMovement,
    jumpAnim: playerAnimations.SledgeHammer_Jump,
    fallAnim:  playerAnimations.SledgeHammer_Fall,
    landAnim:  playerAnimations.SledgeHammer_Land,
    attackAnim: playerAnimations.hammerSwing,
    chargeAnim: playerAnimations.hammerCharge,
    chargeIdleAnim: playerAnimations.hammerChargeIdle,
    releaseAnim: playerAnimations.hammerRelease,
    shoveAnim: playerAnimations.hammerShove,
};

export const spearArchetype: MeleeArchetype = {
    equipAnim: playerAnimations.Equip_Melee,
    movementAnim: playerAnimations.spearMovement,
    jumpAnim: playerAnimations.Spear_Jump,
    fallAnim:  playerAnimations.Spear_Fall,
    landAnim:  playerAnimations.Spear_Land,
    attackAnim: playerAnimations.spearSwing,
    chargeAnim: playerAnimations.spearCharge,
    chargeIdleAnim: playerAnimations.spearChargeIdle,
    releaseAnim: playerAnimations.spearRelease,
    shoveAnim: playerAnimations.spearShove,
};

export const knifeArchetype: MeleeArchetype = {
    equipAnim: playerAnimations.Equip_Melee,
    movementAnim: playerAnimations.knifeMovement,
    jumpAnim: playerAnimations.Knife_Jump,
    fallAnim:  playerAnimations.Knife_Fall,
    landAnim:  playerAnimations.Knife_Land,
    attackAnim: playerAnimations.knifeSwing,
    chargeAnim: playerAnimations.knifeCharge,
    chargeIdleAnim: playerAnimations.knifeChargeIdle,
    releaseAnim: playerAnimations.knifeRelease,
    shoveAnim: playerAnimations.knifeShove,
};

export const batArchetype: MeleeArchetype = {
    equipAnim: playerAnimations.Equip_Melee,
    movementAnim: playerAnimations.batMovement,
    jumpAnim: playerAnimations.Knife_Jump,
    fallAnim:  playerAnimations.Knife_Fall,
    landAnim:  playerAnimations.Knife_Land,
    attackAnim: playerAnimations.batSwing,
    chargeAnim: playerAnimations.batCharge,
    chargeIdleAnim: playerAnimations.batChargeIdle,
    releaseAnim: playerAnimations.batRelease,
    shoveAnim: playerAnimations.batShove,
};

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Mastaba Fixed Blade","Packet":{"Comps":{"Length":7,"a":{"c":2,"v":27},"b":{"c":3,"v":161},"c":{"c":4,"v":39},"d":{"c":44,"v":12},"e":{"c":48,"v":14},"f":{"c":50,"v":10}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Mastaba Fixed Blade"}}}`
    ), {
        model: () => new Knife(),
        type: "melee",
        meleeArchetype: knifeArchetype,
        name: "Knife"
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Wox Compact","Packet":{"Comps":{"Length":5,"a":{"c":2,"v":27},"b":{"c":3,"v":161},"c":{"c":4,"v":39},"d":{"c":48,"v":19}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Wox Compact"}}}`,
    ), {
        model: () => new Knife(),
        type: "melee",
        meleeArchetype: knifeArchetype,
        name: "Knife"
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Kovac Peacekeeper","Packet":{"Comps":{"Length":7,"a":{"c":2,"v":29},"b":{"c":3,"v":163},"c":{"c":4,"v":41},"d":{"c":44,"v":14},"e":{"c":48,"v":16},"f":{"c":50,"v":12}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Kovac Peacekeeper"}}}`,
    ), {
        model: () => new Bat(),
        type: "melee",
        meleeArchetype: batArchetype,
        name: "Bat"
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Attroc Titanium","Packet":{"Comps":{"Length":5,"a":{"c":2,"v":29},"b":{"c":3,"v":163},"c":{"c":4,"v":41},"d":{"c":48,"v":17}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Attroc Titanium"}}}`,
    ), {
        model: () => new Bat(),
        type: "melee",
        meleeArchetype: batArchetype,
        name: "Bat"
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"MACO Drillhead","Packet":{"Comps":{"Length":7,"a":{"c":2,"v":28},"b":{"c":3,"v":162},"c":{"c":4,"v":40},"d":{"c":44,"v":13},"e":{"c":48,"v":15},"f":{"c":50,"v":11}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"MACO Drillhead"}}}`,
    ), {
        model: () => new Spear(),
        type: "melee",
        meleeArchetype: spearArchetype,
        name: "Spear"
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"IsoCo Stinger","Packet":{"Comps":{"Length":7,"a":{"c":2,"v":28},"b":{"c":3,"v":162},"c":{"c":4,"v":40},"d":{"c":44,"v":16},"e":{"c":48,"v":18},"f":{"c":50,"v":13}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"IsoCo Stinger"}}}`,
    ), {
        model: () => new Spear(),
        type: "melee",
        meleeArchetype: spearArchetype,
        name: "Spear"
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Kovac Sledgehammer","Packet":{"Comps":{"Length":8,"a":{"c":2,"v":14},"b":{"c":3,"v":100},"c":{"c":4,"v":13},"d":{"c":44,"v":11},"e":{"c":46,"v":12},"f":{"c":48,"v":6},"g":{"c":50,"v":4}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Kovac Sledgehammer"}}}`,
    ), {
        model: () => new Hammer(),
        type: "melee",
        meleeArchetype: hammerArchetype,
        name: "Hammer"
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Santonian HDH","Packet":{"Comps":{"Length":8,"a":{"c":2,"v":14},"b":{"c":3,"v":100},"c":{"c":4,"v":13},"d":{"c":44,"v":2},"e":{"c":46,"v":4},"f":{"c":48,"v":9},"g":{"c":50,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Santonian HDH"}}}`,
    ), {
        model: () => new Hammer(),
        type: "melee",
        meleeArchetype: hammerArchetype,
        name: "Hammer"
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Santonian Mallet","Packet":{"Comps":{"Length":8,"a":{"c":2,"v":14},"b":{"c":3,"v":100},"c":{"c":4,"v":13},"d":{"c":44,"v":6},"e":{"c":46,"v":9},"f":{"c":48,"v":10},"g":{"c":50,"v":8}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Santonian Mallet"}}}`,
    ), {
        model: () => new Hammer(),
        type: "melee",
        meleeArchetype: hammerArchetype,
        name: "Hammer"
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Omneco Maul","Packet":{"Comps":{"Length":8,"a":{"c":2,"v":14},"b":{"c":3,"v":100},"c":{"c":4,"v":13},"d":{"c":44,"v":3},"e":{"c":46,"v":5},"f":{"c":48,"v":2},"g":{"c":50,"v":5}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Omneco Maul"}}}`,
    ), {
        model: () => new Hammer(),
        type: "melee",
        meleeArchetype: hammerArchetype,
        name: "Hammer"
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"MACO Gavel","Packet":{"Comps":{"Length":8,"a":{"c":2,"v":14},"b":{"c":3,"v":100},"c":{"c":4,"v":13},"d":{"c":44,"v":5},"e":{"c":46,"v":3},"f":{"c":48,"v":5},"g":{"c":50,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"MACO Gavel"}}}`,
    ), {
        model: () => new Hammer(),
        type: "melee",
        meleeArchetype: hammerArchetype,
        name: "Hammer"
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Mechatronic SGB3","Packet":{"Comps":{"Length":11,"a":{"c":1,"v":12},"b":{"c":2,"v":12},"c":{"c":3,"v":97},"d":{"c":4,"v":11},"e":{"c":5,"v":3},"f":{"c":12,"v":17},"g":{"c":16,"v":8},"h":{"c":27,"v":9},"i":{"c":40,"v":3},"j":{"c":42,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Mechatronic SGB3"}}}`,
    ), {
        model: () => new Sentry(),
        name: "Burst Sentry"
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"RAD Labs Meduza","Packet":{"Comps":{"Length":11,"a":{"c":1,"v":11},"b":{"c":2,"v":12},"c":{"c":3,"v":97},"d":{"c":4,"v":11},"e":{"c":5,"v":45},"f":{"c":12,"v":28},"g":{"c":16,"v":2},"h":{"c":27,"v":9},"i":{"c":40,"v":2},"j":{"c":42,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"RAD Labs Meduza"}}}`,
    ), {
        model: () => new Sentry(),
        name: "Auto Sentry"
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Autotek 51 RSG","Packet":{"Comps":{"Length":11,"a":{"c":1,"v":10},"b":{"c":2,"v":12},"c":{"c":3,"v":97},"d":{"c":4,"v":11},"e":{"c":5,"v":36},"f":{"c":12,"v":19},"g":{"c":16,"v":1},"h":{"c":27,"v":9},"i":{"c":40,"v":1},"j":{"c":42,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Autotek 51 RSG"}}}`,
    ), {
        model: () => new Sentry(),
        name: "Sniper Sentry"
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Mechatronic B5 LFR","Packet":{"Comps":{"Length":11,"a":{"c":1,"v":13},"b":{"c":2,"v":12},"c":{"c":3,"v":97},"d":{"c":4,"v":11},"e":{"c":5,"v":4},"f":{"c":12,"v":13},"g":{"c":16,"v":2},"h":{"c":27,"v":9},"i":{"c":40,"v":2},"j":{"c":42,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Mechatronic B5 LFR"}}}`,
    ), {
        model: () => new Sentry(),
        name: "Shotgun Sentry"
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"D-tek Optron IV","Packet":{"Comps":{"Length":9,"a":{"c":2,"v":9},"b":{"c":3,"v":28},"c":{"c":4,"v":10},"d":{"c":27,"v":10},"e":{"c":30,"v":3},"f":{"c":33,"v":3},"g":{"c":40,"v":2},"h":{"c":42,"v":3}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"D-tek Optron IV"}}}`,
    ), {
        model: () => new Biotracker(),
        name: "Bio Tracker"
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Stalwart Flow G2","Packet":{"Comps":{"Length":12,"a":{"c":2,"v":11},"b":{"c":3,"v":73},"c":{"c":4,"v":15},"d":{"c":27,"v":15},"e":{"c":30,"v":5},"f":{"c":32,"v":4},"g":{"c":33,"v":4},"h":{"c":36,"v":1},"i":{"c":37,"v":2},"j":{"c":40,"v":2},"k":{"c":42,"v":7}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Stalwart Flow G2"}}}`,
    ), {
        model: () => new CfoamLauncher(),
        name: "C-Foam Launcher"
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Krieger O4","Packet":{"Comps":{"Length":10,"a":{"c":2,"v":13},"b":{"c":3,"v":37},"c":{"c":4,"v":14},"d":{"c":27,"v":12},"e":{"c":30,"v":2},"f":{"c":33,"v":2},"g":{"c":37,"v":1},"h":{"c":40,"v":1},"i":{"c":42,"v":6}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Krieger O4"}}}`,
    ), {
        model: () => new MineDeployer(),
        name: "Mine Deployer"
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Shelling S49","Packet":{"Comps":{"Length":16,"a":{"c":2,"v":8},"b":{"c":3,"v":108},"c":{"c":4,"v":8},"d":{"c":5,"v":1},"e":{"c":6,"v":1},"f":{"c":7,"v":2},"g":{"c":8,"v":16},"h":{"c":9,"v":15},"i":{"c":10,"v":27},"j":{"c":11,"v":27},"k":{"c":12,"v":38},"l":{"c":16,"v":21},"m":{"c":19,"v":18},"n":{"c":23,"v":8},"o":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":-0.098,"y":-0.07,"normalized":{"x":-0.813733459,"y":-0.5812382,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.120432556,"sqrMagnitude":0.014504},"scale":0.05},"tDecalB":{"position":{"x":-0.098,"y":-0.07,"normalized":{"x":-0.813733459,"y":-0.5812382,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.120432556,"sqrMagnitude":0.014504},"scale":0.04},"tPattern":{"position":{"x":-0.09,"y":-0.03,"normalized":{"x":-0.9486833,"y":-0.316227764,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.09486833,"sqrMagnitude":0.009000001},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Shelling S49"}}}`,
    ), {
        name: "Pistol",
        type: "pistol",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        },
        model: () => new Pistol()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Shelling Nano","Packet":{"Comps":{"Length":15,"a":{"c":1,"v":1},"b":{"c":2,"v":8},"c":{"c":3,"v":108},"d":{"c":4,"v":8},"e":{"c":5,"v":1},"f":{"c":6,"v":1},"g":{"c":7,"v":1},"h":{"c":8,"v":16},"i":{"c":9,"v":15},"j":{"c":10,"v":27},"k":{"c":11,"v":27},"l":{"c":12,"v":45},"m":{"c":19,"v":22},"n":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":-0.098,"y":-0.07,"normalized":{"x":-0.813733459,"y":-0.5812382,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.120432556,"sqrMagnitude":0.014504},"scale":0.05},"tDecalB":{"position":{"x":-0.098,"y":-0.07,"normalized":{"x":-0.813733459,"y":-0.5812382,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.120432556,"sqrMagnitude":0.014504},"scale":0.04},"tPattern":{"position":{"x":-0.09,"y":-0.03,"normalized":{"x":-0.9486833,"y":-0.316227764,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.09486833,"sqrMagnitude":0.009000001},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Shelling Nano"}}}`,
    ), {
        name: "Burst Pistol",
        type: "pistol",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        },
        model: () => new BurstPistol()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Bataldo 3RB","Packet":{"Comps":{"Length":16,"a":{"c":1,"v":1},"b":{"c":2,"v":23},"c":{"c":3,"v":108},"d":{"c":4,"v":42},"e":{"c":5,"v":29},"f":{"c":6,"v":29},"g":{"c":7,"v":2},"h":{"c":8,"v":19},"i":{"c":9,"v":10},"j":{"c":10,"v":17},"k":{"c":11,"v":17},"l":{"c":12,"v":35},"m":{"c":16,"v":17},"n":{"c":19,"v":15},"o":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.115,"y":-0.02,"normalized":{"x":0.9852118,"y":-0.171341166,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.116726175,"sqrMagnitude":0.0136250006},"angle":45.0,"scale":0.05},"tDecalB":{"position":{"x":0.115,"y":-0.02,"normalized":{"x":0.9852118,"y":-0.171341166,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.116726175,"sqrMagnitude":0.0136250006},"scale":0.06},"tPattern":{"position":{"x":0.07,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.07,"sqrMagnitude":0.0049},"angle":120.0,"scale":0.08}},"publicName":{"data":"Bataldo 3RB"}}}`,
    ), {
        name: "Hel Revolver",
        type: "pistol",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Front_Revolver_2_Reload_0,
        },
        model: () => new HelRevolver()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Raptus Treffen 2","Packet":{"Comps":{"Length":17,"a":{"c":1,"v":2},"b":{"c":2,"v":8},"c":{"c":3,"v":108},"d":{"c":4,"v":21},"e":{"c":5,"v":1},"f":{"c":6,"v":1},"g":{"c":7,"v":1},"h":{"c":8,"v":19},"i":{"c":9,"v":12},"j":{"c":10,"v":20},"k":{"c":11,"v":20},"l":{"c":12,"v":40},"m":{"c":16,"v":18},"n":{"c":19,"v":18},"o":{"c":23,"v":5},"p":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":-0.09,"y":0.03,"normalized":{"x":-0.9486833,"y":0.316227764,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.09486833,"sqrMagnitude":0.009000001},"scale":0.2},"tDecalB":{"position":{"x":-0.1,"y":0.04,"normalized":{"x":-0.9284767,"y":0.371390671,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.1077033,"sqrMagnitude":0.0116000008},"scale":0.2},"tPattern":{"position":{"x":-0.07,"y":0.03,"normalized":{"x":-0.919145,"y":0.3939193,"normalized":{"x":-0.919145048,"y":0.393919319,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.0761577338,"sqrMagnitude":0.0058},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Raptus Treffen 2"}}}`,
    ), {
        name: "Machine Pistol",
        type: "pistol",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        },
        model: () => new MachinePistol()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Raptus Steigro","Packet":{"Comps":{"Length":17,"a":{"c":1,"v":2},"b":{"c":2,"v":21},"c":{"c":3,"v":108},"d":{"c":4,"v":21},"e":{"c":5,"v":44},"f":{"c":6,"v":1},"g":{"c":7,"v":1},"h":{"c":8,"v":18},"i":{"c":9,"v":11},"j":{"c":10,"v":28},"k":{"c":11,"v":28},"l":{"c":12,"v":39},"m":{"c":16,"v":18},"n":{"c":19,"v":18},"o":{"c":23,"v":17},"p":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":-0.03,"y":0.032,"normalized":{"x":-0.683941066,"y":0.7295372,"normalized":{"x":-0.6839411,"y":0.729537249,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.0438634269,"sqrMagnitude":0.0019240001},"scale":0.033},"tDecalB":{"position":{"x":-0.03,"y":0.032,"normalized":{"x":-0.683941066,"y":0.7295372,"normalized":{"x":-0.6839411,"y":0.729537249,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.0438634269,"sqrMagnitude":0.0019240001},"scale":0.03},"tPattern":{"position":{"x":-0.1,"y":0.032,"normalized":{"x":-0.9524241,"y":0.3047757,"normalized":{"x":-0.952424169,"y":0.304775745,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.104995243,"sqrMagnitude":0.0110240011},"angle":140.0,"scale":0.15}},"publicName":{"data":"Raptus Steigro"}}}`,
    ), {
        name: "Auto Pistol",
        type: "pistol",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.1)
        },
        model: () => new AutoPistol()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Accrat Golok DA","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":17},"c":{"c":3,"v":108},"d":{"c":4,"v":22},"e":{"c":5,"v":38},"f":{"c":6,"v":2},"g":{"c":7,"v":2},"h":{"c":8,"v":18},"i":{"c":9,"v":13},"j":{"c":10,"v":22},"k":{"c":11,"v":22},"l":{"c":12,"v":41},"m":{"c":16,"v":19},"n":{"c":19,"v":17},"o":{"c":21,"v":9},"p":{"c":23,"v":5},"q":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":-0.202,"y":0.012,"normalized":{"x":-0.9982401,"y":0.05930139,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.20235613,"sqrMagnitude":0.0409480035},"scale":0.07},"tDecalB":{"position":{"x":-0.2,"y":0.01,"normalized":{"x":-0.9987523,"y":0.0499376133,"normalized":{"x":-0.998752356,"y":0.049937617,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.200249851,"sqrMagnitude":0.0401000045},"scale":0.07},"tPattern":{"position":{"x":-0.1,"y":0.032,"normalized":{"x":-0.9524241,"y":0.3047757,"normalized":{"x":-0.952424169,"y":0.304775745,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.104995243,"sqrMagnitude":0.0110240011},"angle":-140.0,"scale":0.1}},"publicName":{"data":"Accrat Golok DA"}}}`,
    ), {
        name: "Bullpup",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
        },
        model: () => new Bullpup()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Van Auken LTC5","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":2},"c":{"c":3,"v":108},"d":{"c":4,"v":2},"e":{"c":5,"v":2},"f":{"c":6,"v":2},"g":{"c":7,"v":1},"h":{"c":8,"v":15},"i":{"c":9,"v":5},"j":{"c":10,"v":17},"k":{"c":11,"v":17},"l":{"c":12,"v":26},"m":{"c":16,"v":6},"n":{"c":19,"v":5},"o":{"c":21,"v":10},"p":{"c":23,"v":5},"q":{"c":25,"v":2}},"MatTrans":{"tDecalA":{"position":{"x":0.07,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.07,"sqrMagnitude":0.0049},"angle":45.0,"scale":0.1},"tDecalB":{"position":{"x":0.075,"y":0.003,"normalized":{"x":0.999201059,"y":0.03996804,"normalized":{"x":0.99920094,"y":0.0399680361,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":1.00000012,"sqrMagnitude":1.00000024},"magnitude":0.07505997,"sqrMagnitude":0.005634},"angle":45.0,"scale":0.1},"tPattern":{"position":{"x":0.02,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.02,"sqrMagnitude":0.0004},"angle":200.0,"scale":0.5}},"publicName":{"data":"Van Auken LTC5"}}}`,
    ), {
        name: "Smg",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.SMG_Front_4_Reload_1,
        },
        model: () => new Smg()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Accrat STB","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":32},"c":{"c":3,"v":108},"d":{"c":4,"v":1},"e":{"c":5,"v":49},"f":{"c":6,"v":3},"g":{"c":7,"v":1},"h":{"c":8,"v":17},"i":{"c":9,"v":6},"j":{"c":10,"v":12},"k":{"c":11,"v":12},"l":{"c":12,"v":24},"m":{"c":16,"v":23},"n":{"c":19,"v":9},"o":{"c":21,"v":16},"p":{"c":23,"v":8},"q":{"c":25,"v":6}},"MatTrans":{"tDecalA":{"position":{"x":0.045,"y":0.025,"normalized":{"x":0.8741573,"y":0.48564294,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05147815,"sqrMagnitude":0.00265000015},"angle":90.0,"scale":0.1},"tDecalB":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":90.0,"scale":0.1},"tPattern":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Accrat STB"}}}`,
    ), {
        name: "PDW",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.SMG_Front_4_Reload_1,
        },
        model: () => new PDW()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Accrat ND6","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":25},"c":{"c":3,"v":108},"d":{"c":4,"v":2},"e":{"c":5,"v":47},"f":{"c":6,"v":2},"g":{"c":7,"v":1},"h":{"c":8,"v":15},"i":{"c":9,"v":5},"j":{"c":10,"v":17},"k":{"c":11,"v":17},"l":{"c":12,"v":25},"m":{"c":16,"v":6},"n":{"c":19,"v":5},"o":{"c":21,"v":8},"p":{"c":23,"v":5},"q":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.07,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.07,"sqrMagnitude":0.0049},"angle":45.0,"scale":0.1},"tDecalB":{"position":{"x":0.075,"y":0.003,"normalized":{"x":0.999201059,"y":0.03996804,"normalized":{"x":0.99920094,"y":0.0399680361,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":1.00000012,"sqrMagnitude":1.00000024},"magnitude":0.07505997,"sqrMagnitude":0.005634},"angle":45.0,"scale":0.1},"tPattern":{"position":{"x":0.02,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.02,"sqrMagnitude":0.0004},"angle":200.0,"scale":0.5}},"publicName":{"data":"Accrat ND6"}}}`,
    ), {
        name: "Heavy Smg",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.SMG_Front_4_Reload_1,
        },
        model: () => new HeavySmg()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Van Auken CAB F4","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":1},"b":{"c":2,"v":2},"c":{"c":3,"v":108},"d":{"c":4,"v":2},"e":{"c":5,"v":41},"f":{"c":6,"v":2},"g":{"c":7,"v":1},"h":{"c":8,"v":19},"i":{"c":9,"v":9},"j":{"c":10,"v":10},"k":{"c":11,"v":10},"l":{"c":12,"v":23},"m":{"c":16,"v":6},"n":{"c":19,"v":9},"o":{"c":21,"v":12},"p":{"c":23,"v":5},"q":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.05,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05,"sqrMagnitude":0.00250000018},"scale":0.3},"tDecalB":{"position":{"x":0.1,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.1,"sqrMagnitude":0.0100000007},"scale":0.3},"tPattern":{"angle":-135.0,"scale":0.2}},"publicName":{"data":"Van Auken CAB F4"}}}`,
    ), {
        name: "Carbine",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.SMG_Front_4_Reload_1,
        },
        model: () => new Carbine()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"TR22 Hanaway","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":4},"b":{"c":3,"v":108},"c":{"c":4,"v":4},"d":{"c":5,"v":34},"e":{"c":6,"v":34},"f":{"c":7,"v":5},"g":{"c":8,"v":14},"h":{"c":9,"v":10},"i":{"c":10,"v":18},"j":{"c":11,"v":18},"k":{"c":12,"v":15},"l":{"c":16,"v":8},"m":{"c":19,"v":2},"n":{"c":21,"v":7},"o":{"c":23,"v":1},"p":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.48,"y":-0.035,"normalized":{"x":0.9973521,"y":-0.0727236,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.481274337,"sqrMagnitude":0.231624991},"scale":0.5},"tDecalB":{"position":{"x":0.53,"y":-0.05,"normalized":{"x":0.995579541,"y":-0.0939226,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.5323532,"sqrMagnitude":0.283399969},"scale":0.5},"tPattern":{"position":{"y":-0.02,"normalized":{"y":-1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.02,"sqrMagnitude":0.0004},"scale":0.5}},"publicName":{"data":"TR22 Hanaway"}}}`,
    ), {
        name: "Dmr",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        type: "rifle",
        model: () => new Dmr()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Hanaway PSB","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":1},"b":{"c":2,"v":4},"c":{"c":3,"v":108},"d":{"c":4,"v":4},"e":{"c":5,"v":34},"f":{"c":6,"v":34},"g":{"c":7,"v":5},"h":{"c":8,"v":13},"i":{"c":9,"v":9},"j":{"c":10,"v":10},"k":{"c":11,"v":10},"l":{"c":12,"v":15},"m":{"c":16,"v":2},"n":{"c":19,"v":8},"o":{"c":21,"v":18},"p":{"c":23,"v":1},"q":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":0.035,"y":0.045,"normalized":{"x":0.6139406,"y":0.789352238,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.0570087731,"sqrMagnitude":0.00325},"scale":0.3},"tDecalB":{"position":{"x":0.03,"y":0.04,"normalized":{"x":0.599999964,"y":0.799999952,"normalized":{"x":0.6,"y":0.8,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.05,"sqrMagnitude":0.0025},"scale":0.2},"tPattern":{"position":{"y":0.03,"normalized":{"y":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.03,"sqrMagnitude":0.0009},"angle":-90.0,"scale":0.3}},"publicName":{"data":"Hanaway PSB"}}}`,
    ), {
        name: "Double Tap",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        type: "rifle",
        model: () => new DoubleTap()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Malatack LX","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":1},"c":{"c":3,"v":108},"d":{"c":4,"v":1},"e":{"c":5,"v":3},"f":{"c":6,"v":3},"g":{"c":7,"v":3},"h":{"c":8,"v":17},"i":{"c":9,"v":6},"j":{"c":10,"v":12},"k":{"c":11,"v":12},"l":{"c":12,"v":28},"m":{"c":16,"v":9},"n":{"c":19,"v":7},"o":{"c":21,"v":20},"p":{"c":23,"v":4},"q":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.045,"y":0.025,"normalized":{"x":0.8741573,"y":0.48564294,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05147815,"sqrMagnitude":0.00265000015},"angle":90.0,"scale":0.1},"tDecalB":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":90.0,"scale":0.1},"tPattern":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Malatack LX"}}}`,
    ), {
        name: "Assault Rifle",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new AssaultRifle()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Malatack CH 4","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":1},"b":{"c":2,"v":1},"c":{"c":3,"v":108},"d":{"c":4,"v":1},"e":{"c":5,"v":3},"f":{"c":6,"v":3},"g":{"c":7,"v":3},"h":{"c":8,"v":17},"i":{"c":9,"v":1},"j":{"c":10,"v":14},"k":{"c":11,"v":23},"l":{"c":12,"v":17},"m":{"c":16,"v":9},"n":{"c":19,"v":8},"o":{"c":21,"v":21},"p":{"c":23,"v":4},"q":{"c":25,"v":4}},"MatTrans":{"tDecalA":{"position":{"x":0.225,"y":0.003,"normalized":{"x":0.9999111,"y":0.013332149,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.225019991,"sqrMagnitude":0.0506339967},"angle":-90.0,"scale":0.05},"tDecalB":{"position":{"x":0.03,"y":-0.012,"normalized":{"x":0.9284767,"y":-0.371390671,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.03231099,"sqrMagnitude":0.001044},"scale":0.06},"tPattern":{"position":{"x":0.07,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.07,"sqrMagnitude":0.0049},"angle":180.0,"scale":0.3}},"publicName":{"data":"Malatack CH 4"}}}`,
    ), {
        name: "Burst Rifle",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new BurstRifle()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Drekker Pres MOD 556","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":1},"b":{"c":3,"v":108},"c":{"c":4,"v":1},"d":{"c":5,"v":42},"e":{"c":6,"v":3},"f":{"c":7,"v":2},"g":{"c":8,"v":9},"h":{"c":9,"v":8},"i":{"c":10,"v":10},"j":{"c":11,"v":10},"k":{"c":12,"v":14},"l":{"c":16,"v":8},"m":{"c":19,"v":7},"n":{"c":21,"v":15},"o":{"c":23,"v":1},"p":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":0.03,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.03,"sqrMagnitude":0.0009},"scale":0.3},"tDecalB":{"position":{"x":0.1,"y":0.02,"normalized":{"x":0.9805806,"y":0.19611612,"normalized":{"x":0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.101980396,"sqrMagnitude":0.010400001},"scale":0.3},"tPattern":{"position":{"x":0.32,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.32,"sqrMagnitude":0.1024},"scale":0.6}},"publicName":{"data":"Drekker Pres MOD 556"}}}`,
    ), {
        name: "Rifle",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new Rifle()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Buckland SBS III","Packet":{"Comps":{"Length":14,"a":{"c":2,"v":16},"b":{"c":3,"v":156},"c":{"c":4,"v":20},"d":{"c":5,"v":37},"e":{"c":6,"v":4},"f":{"c":8,"v":17},"g":{"c":9,"v":5},"h":{"c":10,"v":18},"i":{"c":11,"v":18},"j":{"c":12,"v":47},"k":{"c":16,"v":22},"l":{"c":19,"v":21},"m":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.51,"y":-0.05,"normalized":{"x":0.9952285,"y":-0.09757143,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.5124451,"sqrMagnitude":0.262599975},"scale":0.3},"tDecalB":{"position":{"x":0.5,"y":-0.07,"normalized":{"x":0.990341663,"y":-0.138647839,"normalized":{"x":0.9903418,"y":-0.138647854,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.9999999,"sqrMagnitude":0.9999998},"magnitude":0.504876256,"sqrMagnitude":0.2549},"scale":0.3},"tPattern":{"angle":-90.0,"scale":0.3}},"publicName":{"data":"Buckland SBS III"}}}`,
    ), {
        name: "Sawed Off",
        type: "pistol",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Revolver_Front_1_Reload_1
        },
        model: () => new SawedOff()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Bataldo J 300","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":33},"c":{"c":3,"v":156},"d":{"c":4,"v":46},"e":{"c":5,"v":50},"f":{"c":6,"v":4},"g":{"c":7,"v":4},"h":{"c":8,"v":17},"i":{"c":9,"v":5},"j":{"c":10,"v":18},"k":{"c":11,"v":18},"l":{"c":12,"v":32},"m":{"c":16,"v":12},"n":{"c":19,"v":10},"o":{"c":21,"v":11},"p":{"c":23,"v":9},"q":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":0.51,"y":-0.05,"normalized":{"x":0.9952285,"y":-0.09757143,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.5124451,"sqrMagnitude":0.262599975},"scale":0.3},"tDecalB":{"position":{"x":0.5,"y":-0.07,"normalized":{"x":0.990341663,"y":-0.138647839,"normalized":{"x":0.9903418,"y":-0.138647854,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.9999999,"sqrMagnitude":0.9999998},"magnitude":0.504876256,"sqrMagnitude":0.2549},"scale":0.3},"tPattern":{"angle":-90.0,"scale":0.3}},"publicName":{"data":"Bataldo J 300"}}}`,
    ), {
        name: "Hel Shotgun",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new HelShotgun()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Bataldo Custom K330","Packet":{"Comps":{"Length":16,"a":{"c":2,"v":37},"b":{"c":3,"v":108},"c":{"c":4,"v":6},"d":{"c":5,"v":50},"e":{"c":6,"v":4},"f":{"c":7,"v":4},"g":{"c":8,"v":18},"h":{"c":9,"v":13},"i":{"c":10,"v":22},"j":{"c":11,"v":22},"k":{"c":12,"v":33},"l":{"c":16,"v":12},"m":{"c":19,"v":12},"n":{"c":21,"v":49},"o":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":-0.202,"y":0.012,"normalized":{"x":-0.9982401,"y":0.05930139,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.20235613,"sqrMagnitude":0.0409480035},"scale":0.07},"tDecalB":{"position":{"x":-0.2,"y":0.01,"normalized":{"x":-0.9987523,"y":0.0499376133,"normalized":{"x":-0.998752356,"y":0.049937617,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.200249851,"sqrMagnitude":0.0401000045},"scale":0.07},"tPattern":{"position":{"x":-0.1,"y":0.032,"normalized":{"x":-0.9524241,"y":0.3047757,"normalized":{"x":-0.952424169,"y":0.304775745,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.104995243,"sqrMagnitude":0.0110240011},"angle":-140.0,"scale":0.1}},"publicName":{"data":"Bataldo Custom K330"}}}`,
    ), {
        name: "Slug Shotgun",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new SlugShotgun()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Malatack HXC","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":22},"c":{"c":3,"v":109},"d":{"c":4,"v":1},"e":{"c":5,"v":42},"f":{"c":6,"v":3},"g":{"c":7,"v":3},"h":{"c":8,"v":17},"i":{"c":9,"v":6},"j":{"c":10,"v":12},"k":{"c":11,"v":12},"l":{"c":12,"v":28},"m":{"c":16,"v":9},"n":{"c":19,"v":3},"o":{"c":21,"v":45},"p":{"c":23,"v":1},"q":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":0.045,"y":0.025,"normalized":{"x":0.8741573,"y":0.48564294,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05147815,"sqrMagnitude":0.00265000015},"angle":90.0,"scale":0.1},"tDecalB":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":90.0,"scale":0.1},"tPattern":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Malatack HXC"}}}`,
    ), {
        name: "Heavy Assault Rifle",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new HeavyAssaultRifle()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Drekker CLR","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":24},"b":{"c":3,"v":109},"c":{"c":4,"v":49},"d":{"c":5,"v":2},"e":{"c":6,"v":2},"f":{"c":7,"v":1},"g":{"c":8,"v":15},"h":{"c":9,"v":5},"i":{"c":10,"v":17},"j":{"c":11,"v":17},"k":{"c":12,"v":25},"l":{"c":16,"v":7},"m":{"c":19,"v":8},"n":{"c":21,"v":50},"o":{"c":23,"v":5},"p":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.07,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.07,"sqrMagnitude":0.0049},"angle":45.0,"scale":0.1},"tDecalB":{"position":{"x":0.075,"y":0.003,"normalized":{"x":0.999201059,"y":0.03996804,"normalized":{"x":0.99920094,"y":0.0399680361,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":1.00000012,"sqrMagnitude":1.00000024},"magnitude":0.07505997,"sqrMagnitude":0.005634},"angle":45.0,"scale":0.1},"tPattern":{"position":{"x":0.02,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.02,"sqrMagnitude":0.0004},"angle":200.0,"scale":0.5}},"publicName":{"data":"Drekker CLR"}}}`,
    ), {
        name: "Short Rifle",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new ShortRifle()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Buckland s870","Packet":{"Comps":{"Length":16,"a":{"c":2,"v":6},"b":{"c":3,"v":110},"c":{"c":4,"v":6},"d":{"c":5,"v":4},"e":{"c":6,"v":4},"f":{"c":7,"v":4},"g":{"c":8,"v":7},"h":{"c":9,"v":1},"i":{"c":10,"v":24},"j":{"c":11,"v":24},"k":{"c":12,"v":22},"l":{"c":16,"v":12},"m":{"c":19,"v":13},"n":{"c":21,"v":40},"o":{"c":25,"v":2}},"MatTrans":{"tDecalA":{"position":{"x":0.11,"y":0.01,"normalized":{"x":0.99589324,"y":0.090535745,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.110453606,"sqrMagnitude":0.0122},"angle":0.07,"scale":0.07},"tDecalB":{"position":{"x":0.105,"y":0.005,"normalized":{"x":0.9988681,"y":0.0475651473,"normalized":{"x":0.998868167,"y":0.04756515,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.105118982,"sqrMagnitude":0.01105},"angle":0.07,"scale":0.07},"tPattern":{"position":{"x":0.25,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.25,"sqrMagnitude":0.0625},"angle":180.0,"scale":0.5}},"publicName":{"data":"Buckland s870"}}}`,
    ), {
        name: "Shotgun",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new Shotgun()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Buckland AF6","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":6},"c":{"c":3,"v":110},"d":{"c":4,"v":46},"e":{"c":5,"v":4},"f":{"c":6,"v":4},"g":{"c":7,"v":4},"h":{"c":8,"v":17},"i":{"c":9,"v":5},"j":{"c":10,"v":18},"k":{"c":11,"v":18},"l":{"c":12,"v":12},"m":{"c":16,"v":6},"n":{"c":19,"v":10},"o":{"c":21,"v":42},"p":{"c":23,"v":9},"q":{"c":25,"v":2}},"MatTrans":{"tDecalA":{"position":{"x":0.51,"y":-0.05,"normalized":{"x":0.9952285,"y":-0.09757143,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.5124451,"sqrMagnitude":0.262599975},"scale":0.3},"tDecalB":{"position":{"x":0.5,"y":-0.07,"normalized":{"x":0.990341663,"y":-0.138647839,"normalized":{"x":0.9903418,"y":-0.138647854,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.9999999,"sqrMagnitude":0.9999998},"magnitude":0.504876256,"sqrMagnitude":0.2549},"scale":0.3},"tPattern":{"angle":-90.0,"scale":0.3}},"publicName":{"data":"Buckland AF6"}}}`,
    ), {
        name: "Combat Shotgun",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new CombatShotgun()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Drekker INEX Drei","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":1},"b":{"c":2,"v":30},"c":{"c":3,"v":110},"d":{"c":4,"v":43},"e":{"c":5,"v":4},"f":{"c":6,"v":4},"g":{"c":7,"v":4},"h":{"c":8,"v":19},"i":{"c":9,"v":10},"j":{"c":10,"v":19},"k":{"c":11,"v":19},"l":{"c":12,"v":11},"m":{"c":16,"v":9},"n":{"c":19,"v":13},"o":{"c":21,"v":33},"p":{"c":23,"v":19},"q":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":0.06,"y":0.005,"normalized":{"x":0.9965458,"y":0.08304548,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.06020797,"sqrMagnitude":0.003625},"scale":0.08},"tDecalB":{"position":{"x":0.07,"y":0.01,"normalized":{"x":0.9899496,"y":0.141421363,"normalized":{"x":0.989949465,"y":0.141421348,"normalized":{"x":0.9899495,"y":0.141421363,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":1.00000012,"sqrMagnitude":1.00000024},"magnitude":0.0707106739,"sqrMagnitude":0.005},"scale":0.08},"tPattern":{"position":{"x":0.06,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.06,"sqrMagnitude":0.0036},"angle":-60.0,"scale":0.3}},"publicName":{"data":"Drekker INEX Drei"}}}`,
    ), {
        name: "Scatter Gun",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new ScatterGun()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Buckland XDist2","Packet":{"Comps":{"Length":17,"a":{"c":1,"v":1},"b":{"c":2,"v":6},"c":{"c":3,"v":110},"d":{"c":4,"v":6},"e":{"c":5,"v":46},"f":{"c":6,"v":4},"g":{"c":7,"v":4},"h":{"c":8,"v":19},"i":{"c":9,"v":10},"j":{"c":10,"v":19},"k":{"c":11,"v":19},"l":{"c":12,"v":20},"m":{"c":16,"v":6},"n":{"c":19,"v":12},"o":{"c":21,"v":43},"p":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":0.06,"y":0.005,"normalized":{"x":0.9965458,"y":0.08304548,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.06020797,"sqrMagnitude":0.003625},"scale":0.08},"tDecalB":{"position":{"x":0.07,"y":0.01,"normalized":{"x":0.9899496,"y":0.141421363,"normalized":{"x":0.989949465,"y":0.141421348,"normalized":{"x":0.9899495,"y":0.141421363,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":1.00000012,"sqrMagnitude":1.00000024},"magnitude":0.0707106739,"sqrMagnitude":0.005},"scale":0.08},"tPattern":{"position":{"x":0.06,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.06,"sqrMagnitude":0.0036},"angle":-60.0,"scale":0.3}},"publicName":{"data":"Buckland XDist2"}}}`,
    ), {
        name: "Choke Mod Shotgun",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new ChokeModShotgun()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Mastaba R66","Packet":{"Comps":{"Length":14,"a":{"c":2,"v":7},"b":{"c":3,"v":109},"c":{"c":4,"v":7},"d":{"c":5,"v":29},"e":{"c":6,"v":29},"f":{"c":8,"v":7},"g":{"c":9,"v":14},"h":{"c":10,"v":20},"i":{"c":11,"v":35},"j":{"c":12,"v":36},"k":{"c":16,"v":16},"l":{"c":19,"v":14},"m":{"c":25,"v":2}},"MatTrans":{"tDecalA":{"position":{"x":0.17,"y":0.02,"normalized":{"x":0.993150651,"y":0.116841249,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.171172425,"sqrMagnitude":0.0293},"scale":0.06},"tDecalB":{"position":{"x":0.17,"y":-0.015,"normalized":{"x":0.9961299,"y":-0.08789381,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.170660481,"sqrMagnitude":0.0291250013},"scale":0.2},"tPattern":{"position":{"x":0.24,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.24,"sqrMagnitude":0.0576},"scale":0.5}},"publicName":{"data":"Mastaba R66"}}}`,
    ), {
        name: "Revolver",
        type: "pistol",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Revolver_Front_1_Reload_1,
        },
        model: () => new Revolver()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"TechMan Arbalist V","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":3},"c":{"c":3,"v":109},"d":{"c":4,"v":3},"e":{"c":5,"v":33},"f":{"c":6,"v":33},"g":{"c":7,"v":3},"h":{"c":8,"v":10},"i":{"c":9,"v":10},"j":{"c":10,"v":13},"k":{"c":11,"v":14},"l":{"c":12,"v":18},"m":{"c":16,"v":6},"n":{"c":19,"v":3},"o":{"c":21,"v":13},"p":{"c":23,"v":14},"q":{"c":25,"v":6}},"MatTrans":{"tDecalA":{"position":{"x":0.1,"y":0.02,"normalized":{"x":0.9805806,"y":0.19611612,"normalized":{"x":0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.101980396,"sqrMagnitude":0.010400001},"angle":180.0,"scale":0.4},"tDecalB":{"position":{"x":-0.07,"y":0.03,"normalized":{"x":-0.919145,"y":0.3939193,"normalized":{"x":-0.919145048,"y":0.393919319,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.0761577338,"sqrMagnitude":0.0058},"angle":-90.0,"scale":0.05},"tPattern":{"angle":-90.0,"scale":0.1}},"publicName":{"data":"TechMan Arbalist V"}}}`,
    ), {
        name: "Machine Gun",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new MachineGun0()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"TechMan Veruta XII","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":19},"c":{"c":3,"v":109},"d":{"c":4,"v":3},"e":{"c":5,"v":39},"f":{"c":6,"v":33},"g":{"c":7,"v":3},"h":{"c":8,"v":10},"i":{"c":9,"v":10},"j":{"c":10,"v":13},"k":{"c":11,"v":14},"l":{"c":12,"v":27},"m":{"c":16,"v":6},"n":{"c":19,"v":3},"o":{"c":21,"v":5},"p":{"c":23,"v":7},"q":{"c":25,"v":6}},"MatTrans":{"tDecalA":{"position":{"x":0.1,"y":0.02,"normalized":{"x":0.9805806,"y":0.19611612,"normalized":{"x":0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.101980396,"sqrMagnitude":0.010400001},"angle":180.0,"scale":0.4},"tDecalB":{"position":{"x":-0.07,"y":0.03,"normalized":{"x":-0.919145,"y":0.3939193,"normalized":{"x":-0.919145048,"y":0.393919319,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.0761577338,"sqrMagnitude":0.0058},"angle":-90.0,"scale":0.05},"tPattern":{"angle":-90.0,"scale":0.1}},"publicName":{"data":"TechMan Veruta XII"}}}`,
    ), {
        name: "Machine Gun",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new MachineGun1()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"TechMan Klust 6","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":1},"b":{"c":2,"v":3},"c":{"c":3,"v":109},"d":{"c":4,"v":3},"e":{"c":5,"v":43},"f":{"c":6,"v":33},"g":{"c":7,"v":3},"h":{"c":8,"v":18},"i":{"c":9,"v":8},"j":{"c":10,"v":27},"k":{"c":11,"v":26},"l":{"c":12,"v":27},"m":{"c":16,"v":11},"n":{"c":19,"v":8},"o":{"c":21,"v":4},"p":{"c":23,"v":16},"q":{"c":25,"v":6}},"MatTrans":{"tDecalA":{"position":{"x":-0.05,"y":0.01,"normalized":{"x":-0.9805806,"y":0.19611612,"normalized":{"x":-0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.0509901978,"sqrMagnitude":0.00260000024},"scale":0.1},"tDecalB":{"position":{"x":-0.05,"y":0.01,"normalized":{"x":-0.9805806,"y":0.19611612,"normalized":{"x":-0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.0509901978,"sqrMagnitude":0.00260000024},"scale":0.1},"tPattern":{"position":{"x":0.17,"y":0.05,"normalized":{"x":0.9593655,"y":0.282166332,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.177200451,"sqrMagnitude":0.0314000025},"angle":-135.0,"scale":0.2}},"publicName":{"data":"TechMan Klust 6"}}}`,
    ), {
        name: "Burst Cannon",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new BurstCannon()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Omneco exp1","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":3},"b":{"c":3,"v":109},"c":{"c":4,"v":3},"d":{"c":5,"v":33},"e":{"c":6,"v":33},"f":{"c":7,"v":3},"g":{"c":8,"v":13},"h":{"c":9,"v":5},"i":{"c":10,"v":25},"j":{"c":11,"v":12},"k":{"c":12,"v":27},"l":{"c":16,"v":10},"m":{"c":19,"v":1},"n":{"c":21,"v":24},"o":{"c":23,"v":14},"p":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":-0.05,"y":0.045,"normalized":{"x":-0.7432942,"y":0.6689648,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.06726812,"sqrMagnitude":0.004525},"scale":0.05},"tDecalB":{"position":{"x":-0.22,"normalized":{"x":-1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.22,"sqrMagnitude":0.0484},"scale":0.1},"tPattern":{"position":{"y":0.02,"normalized":{"y":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.02,"sqrMagnitude":0.0004},"angle":-90.0,"scale":0.2}},"publicName":{"data":"Omneco exp1"}}}`,
    ), {
        name: "Hel Gun",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new HelGun()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Shelling Arid 5","Packet":{"Comps":{"Length":16,"a":{"c":2,"v":35},"b":{"c":3,"v":109},"c":{"c":4,"v":48},"d":{"c":5,"v":48},"e":{"c":6,"v":29},"f":{"c":7,"v":2},"g":{"c":8,"v":16},"h":{"c":9,"v":15},"i":{"c":10,"v":27},"j":{"c":11,"v":27},"k":{"c":12,"v":49},"l":{"c":16,"v":21},"m":{"c":19,"v":18},"n":{"c":23,"v":8},"o":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":-0.098,"y":-0.07,"normalized":{"x":-0.813733459,"y":-0.5812382,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.120432556,"sqrMagnitude":0.014504},"scale":0.05},"tDecalB":{"position":{"x":-0.098,"y":-0.07,"normalized":{"x":-0.813733459,"y":-0.5812382,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.120432556,"sqrMagnitude":0.014504},"scale":0.04},"tPattern":{"position":{"x":-0.09,"y":-0.03,"normalized":{"x":-0.9486833,"y":-0.316227764,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.09486833,"sqrMagnitude":0.009000001},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Shelling Arid 5"}}}`,
    ), {
        name: "High Cal",
        type: "pistol",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new HighCal()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Drekker DEL P1","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":34},"b":{"c":3,"v":109},"c":{"c":4,"v":47},"d":{"c":5,"v":51},"e":{"c":6,"v":36},"f":{"c":7,"v":5},"g":{"c":8,"v":18},"h":{"c":9,"v":10},"i":{"c":10,"v":27},"j":{"c":11,"v":15},"k":{"c":12,"v":19},"l":{"c":16,"v":1},"m":{"c":19,"v":1},"n":{"c":21,"v":14},"o":{"c":23,"v":12},"p":{"c":25,"v":2}},"MatTrans":{"tDecalA":{"position":{"x":0.04,"y":0.04,"normalized":{"x":0.707106769,"y":0.707106769,"normalized":{"x":0.7071068,"y":0.7071068,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.05656854,"sqrMagnitude":0.0032},"scale":0.08},"tDecalB":{"position":{"x":0.48,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.48,"sqrMagnitude":0.2304},"scale":0.3},"tPattern":{"position":{"y":0.04,"normalized":{"y":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.04,"sqrMagnitude":0.0016},"angle":-90.0,"scale":0.2}},"publicName":{"data":"Drekker DEL P1"}}}`,
    ), {
        name: "Precision Rifle",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new PrecisionRifle()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Köning PR 11","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":5},"b":{"c":3,"v":109},"c":{"c":4,"v":5},"d":{"c":5,"v":36},"e":{"c":6,"v":36},"f":{"c":7,"v":5},"g":{"c":8,"v":18},"h":{"c":9,"v":10},"i":{"c":10,"v":27},"j":{"c":11,"v":15},"k":{"c":12,"v":21},"l":{"c":16,"v":9},"m":{"c":19,"v":11},"n":{"c":21,"v":46},"o":{"c":23,"v":13},"p":{"c":25,"v":4}},"MatTrans":{"tDecalA":{"position":{"x":0.04,"y":0.04,"normalized":{"x":0.707106769,"y":0.707106769,"normalized":{"x":0.7071068,"y":0.7071068,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.05656854,"sqrMagnitude":0.0032},"scale":0.08},"tDecalB":{"position":{"x":0.48,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.48,"sqrMagnitude":0.2304},"scale":0.3},"tPattern":{"position":{"y":0.04,"normalized":{"y":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.04,"sqrMagnitude":0.0016},"angle":-90.0,"scale":0.2}},"publicName":{"data":"Köning PR 11"}}}`,
    ), {
        name: "Sniper",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new Sniper()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Omneco LRG","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":20},"b":{"c":3,"v":109},"c":{"c":4,"v":5},"d":{"c":5,"v":36},"e":{"c":6,"v":36},"f":{"c":7,"v":5},"g":{"c":8,"v":18},"h":{"c":9,"v":10},"i":{"c":10,"v":27},"j":{"c":11,"v":15},"k":{"c":12,"v":29},"l":{"c":16,"v":10},"m":{"c":19,"v":2},"n":{"c":21,"v":19},"o":{"c":23,"v":12},"p":{"c":25,"v":4}},"MatTrans":{"tDecalA":{"position":{"x":0.04,"y":0.04,"normalized":{"x":0.707106769,"y":0.707106769,"normalized":{"x":0.7071068,"y":0.7071068,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.05656854,"sqrMagnitude":0.0032},"scale":0.08},"tDecalB":{"position":{"x":0.48,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.48,"sqrMagnitude":0.2304},"scale":0.3},"tPattern":{"position":{"y":0.04,"normalized":{"y":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.04,"sqrMagnitude":0.0016},"angle":-90.0,"scale":0.2}},"publicName":{"data":"Omneco LRG"}}}`,
    ), {
        name: "Hel Rifle",
        type: "rifle",
        gunArchetype: {
            gunFoldAnim: gearFoldAnimations.Stock_Pistol_1_reload_1,
            offset: new Vector3(0, 0, 0.2)
        },
        model: () => new HelRifle()
    }
);

GearDatablock.set(
    Identifier.create("Gear", undefined, 
        `{"Ver":1,"Name":"Hacking Tool","Packet":{"Comps":{"Length":5,"a":{"c":2,"v":15},"b":{"c":3,"v":53},"c":{"c":4,"v":17},"d":{"c":5,"v":28}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Hacking Tool"}}}`,
    ), {
        name: "Hacking Tool",
        type: "rifle",
        model: () => new HackingTool()
    }
);