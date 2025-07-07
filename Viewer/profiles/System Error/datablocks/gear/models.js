const { Vector3 } = await require("three", "esm");
const { GearAnimDatablock } = await require("../../../vanilla/datablocks/gear/animation.js", "asl");
const { GearDatablock } = await require("../../../vanilla/datablocks/gear/models.js", "asl");
//const { GearGLTFModel } = await require("../../../vanilla/renderer/models/prebuilt/gearGLTF.js", "asl");
const { PlayerAnimDatablock } = await require("../../../vanilla/datablocks/player/animation.js", "asl");
const { Identifier } = await require("../../../vanilla/parser/identifier.js", "asl");
const { GearBuilder } = await require("../../../vanilla/renderer/models/gearbuilder.js", "asl");
const { HackingTool } = await require("../../../vanilla/renderer/models/prebuilt/hackingtool.js", "asl");
exports.hammerArchetype = {
  equipAnim: PlayerAnimDatablock.Equip_Melee,
  movementAnim: PlayerAnimDatablock.hammerMovement,
  jumpAnim: PlayerAnimDatablock.SledgeHammer_Jump,
  fallAnim: PlayerAnimDatablock.SledgeHammer_Fall,
  landAnim: PlayerAnimDatablock.SledgeHammer_Land,
  attackAnim: PlayerAnimDatablock.hammerSwing,
  chargeAnim: PlayerAnimDatablock.hammerCharge,
  chargeIdleAnim: PlayerAnimDatablock.hammerChargeIdle,
  releaseAnim: PlayerAnimDatablock.hammerRelease,
  shoveAnim: PlayerAnimDatablock.hammerShove
};
exports.spearArchetype = {
  equipAnim: PlayerAnimDatablock.Equip_Melee,
  movementAnim: PlayerAnimDatablock.spearMovement,
  jumpAnim: PlayerAnimDatablock.Spear_Jump,
  fallAnim: PlayerAnimDatablock.Spear_Fall,
  landAnim: PlayerAnimDatablock.Spear_Land,
  attackAnim: PlayerAnimDatablock.spearSwing,
  chargeAnim: PlayerAnimDatablock.spearCharge,
  chargeIdleAnim: PlayerAnimDatablock.spearChargeIdle,
  releaseAnim: PlayerAnimDatablock.spearRelease,
  shoveAnim: PlayerAnimDatablock.spearShove
};
exports.knifeArchetype = {
  equipAnim: PlayerAnimDatablock.Equip_Melee,
  movementAnim: PlayerAnimDatablock.knifeMovement,
  jumpAnim: PlayerAnimDatablock.Knife_Jump,
  fallAnim: PlayerAnimDatablock.Knife_Fall,
  landAnim: PlayerAnimDatablock.Knife_Land,
  attackAnim: PlayerAnimDatablock.knifeSwing,
  chargeAnim: PlayerAnimDatablock.knifeCharge,
  chargeIdleAnim: PlayerAnimDatablock.knifeChargeIdle,
  releaseAnim: PlayerAnimDatablock.knifeRelease,
  shoveAnim: PlayerAnimDatablock.knifeShove
};
exports.batArchetype = {
  equipAnim: PlayerAnimDatablock.Equip_Melee,
  movementAnim: PlayerAnimDatablock.batMovement,
  jumpAnim: PlayerAnimDatablock.Knife_Jump,
  fallAnim: PlayerAnimDatablock.Knife_Fall,
  landAnim: PlayerAnimDatablock.Knife_Land,
  attackAnim: PlayerAnimDatablock.batSwing,
  chargeAnim: PlayerAnimDatablock.batCharge,
  chargeIdleAnim: PlayerAnimDatablock.batChargeIdle,
  releaseAnim: PlayerAnimDatablock.batRelease,
  shoveAnim: PlayerAnimDatablock.batShove
};
GearDatablock.clear();


// Mains
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Sheltaldo MP","Packet":{"Comps":{"Length":16,"a":{"c":2,"v":8},"b":{"c":3,"v":108},"c":{"c":4,"v":8},"d":{"c":5,"v":1},"e":{"c":6,"v":1},"f":{"c":7,"v":1},"g":{"c":8,"v":16},"h":{"c":9,"v":15},"i":{"c":10,"v":27},"j":{"c":11,"v":27},"k":{"c":12,"v":39},"l":{"c":16,"v":21},"m":{"c":19,"v":18},"n":{"c":21,"v":19},"o":{"c":23,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":-0.098,"y":-0.07,"normalized":{"x":-0.813733459,"y":-0.5812382,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.120432556,"sqrMagnitude":0.014504},"scale":0.05},"tDecalB":{"position":{"x":-0.098,"y":-0.07,"normalized":{"x":-0.813733459,"y":-0.5812382,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.120432556,"sqrMagnitude":0.014504},"scale":0.04},"tPattern":{"position":{"x":-0.09,"y":-0.03,"normalized":{"x":-0.9486833,"y":-0.316227764,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.09486833,"sqrMagnitude":0.009000001},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Sheltaldo MP"}}}`), {
  name: "Marksman Pistol",
  type: "pistol", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Rapton Triff 3P","Packet":{"Comps":{"Length":17,"a":{"c":1,"v":2},"b":{"c":2,"v":8},"c":{"c":3,"v":108},"d":{"c":4,"v":21},"e":{"c":5,"v":1},"f":{"c":6,"v":1},"g":{"c":7,"v":1},"h":{"c":8,"v":19},"i":{"c":9,"v":12},"j":{"c":10,"v":20},"k":{"c":11,"v":20},"l":{"c":12,"v":45},"m":{"c":16,"v":18},"n":{"c":19,"v":18},"o":{"c":23,"v":8},"p":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":-0.09,"y":0.03,"normalized":{"x":-0.9486833,"y":0.316227764,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.09486833,"sqrMagnitude":0.009000001},"scale":0.2},"tDecalB":{"position":{"x":-0.1,"y":0.04,"normalized":{"x":-0.9284767,"y":0.371390671,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.1077033,"sqrMagnitude":0.0116000008},"scale":0.2},"tPattern":{"position":{"x":-0.07,"y":0.03,"normalized":{"x":-0.919145,"y":0.3939193,"normalized":{"x":-0.919145048,"y":0.393919319,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.0761577338,"sqrMagnitude":0.0058},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Rapton Triff 3P"}}}`), {
  name: "Frenzy",
  type: "pistol", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Van Auken SPTR","Packet":{"Comps":{"Length":17,"a":{"c":1,"v":2},"b":{"c":2,"v":2},"c":{"c":3,"v":108},"d":{"c":4,"v":2},"e":{"c":5,"v":2},"f":{"c":6,"v":2},"g":{"c":7,"v":1},"h":{"c":8,"v":15},"i":{"c":9,"v":5},"j":{"c":10,"v":17},"k":{"c":11,"v":17},"l":{"c":12,"v":26},"m":{"c":16,"v":6},"n":{"c":19,"v":9},"o":{"c":23,"v":8},"p":{"c":25,"v":2}},"MatTrans":{"tDecalA":{"position":{"x":0.07,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.07,"sqrMagnitude":0.0049},"angle":45.0,"scale":0.1},"tDecalB":{"position":{"x":0.075,"y":0.003,"normalized":{"x":0.999201059,"y":0.03996804,"normalized":{"x":0.99920094,"y":0.0399680361,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":1.00000012,"sqrMagnitude":1.00000024},"magnitude":0.07505997,"sqrMagnitude":0.005634},"angle":45.0,"scale":0.1},"tPattern":{"position":{"x":0.02,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.02,"sqrMagnitude":0.0004},"angle":200.0,"scale":0.5}},"publicName":{"data":"Van Auken SPTR"}}}`), {
  name: "Stinger",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Hanaway PSB","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":1},"b":{"c":2,"v":4},"c":{"c":3,"v":108},"d":{"c":4,"v":4},"e":{"c":5,"v":34},"f":{"c":6,"v":34},"g":{"c":7,"v":5},"h":{"c":8,"v":13},"i":{"c":9,"v":9},"j":{"c":10,"v":10},"k":{"c":11,"v":10},"l":{"c":12,"v":19},"m":{"c":16,"v":2},"n":{"c":19,"v":10},"o":{"c":21,"v":15},"p":{"c":23,"v":5},"q":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":0.035,"y":0.045,"normalized":{"x":0.6139406,"y":0.789352238,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.0570087731,"sqrMagnitude":0.00325},"scale":0.3},"tDecalB":{"position":{"x":0.03,"y":0.04,"normalized":{"x":0.599999964,"y":0.799999952,"normalized":{"x":0.6,"y":0.8,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.05,"sqrMagnitude":0.0025},"scale":0.2},"tPattern":{"position":{"y":0.03,"normalized":{"y":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.03,"sqrMagnitude":0.0009},"angle":-90.0,"scale":0.3}},"publicName":{"data":"Hanaway PSB"}}}`), {
  name: "Double tap rifle",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Malatack SBM","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":1},"c":{"c":3,"v":108},"d":{"c":4,"v":1},"e":{"c":5,"v":3},"f":{"c":6,"v":3},"g":{"c":7,"v":2},"h":{"c":8,"v":17},"i":{"c":9,"v":6},"j":{"c":10,"v":12},"k":{"c":11,"v":12},"l":{"c":12,"v":28},"m":{"c":16,"v":9},"n":{"c":19,"v":3},"o":{"c":21,"v":16},"p":{"c":23,"v":7},"q":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.045,"y":0.025,"normalized":{"x":0.8741573,"y":0.48564294,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05147815,"sqrMagnitude":0.00265000015},"angle":90.0,"scale":0.1},"tDecalB":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":90.0,"scale":0.1},"tPattern":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Malatack SBM"}}}`), {
  name: "Machine Auto Assault Rifle",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Hannekker IMR","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":1},"b":{"c":3,"v":108},"c":{"c":4,"v":1},"d":{"c":5,"v":42},"e":{"c":6,"v":3},"f":{"c":7,"v":2},"g":{"c":8,"v":9},"h":{"c":9,"v":8},"i":{"c":10,"v":10},"j":{"c":11,"v":10},"k":{"c":12,"v":14},"l":{"c":16,"v":8},"m":{"c":19,"v":1},"n":{"c":21,"v":20},"o":{"c":23,"v":1},"p":{"c":25,"v":5}},"MatTrans":{"tDecalA":{"position":{"x":0.03,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.03,"sqrMagnitude":0.0009},"scale":0.3},"tDecalB":{"position":{"x":0.1,"y":0.02,"normalized":{"x":0.9805806,"y":0.19611612,"normalized":{"x":0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.101980396,"sqrMagnitude":0.010400001},"scale":0.3},"tPattern":{"position":{"x":0.32,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.32,"sqrMagnitude":0.1024},"scale":0.6}},"publicName":{"data":"Hannekker IMR"}}}`), {
  name: "Rifle",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Buckland SBS III","Packet":{"Comps":{"Length":14,"a":{"c":2,"v":16},"b":{"c":3,"v":156},"c":{"c":4,"v":20},"d":{"c":5,"v":37},"e":{"c":6,"v":4},"f":{"c":8,"v":17},"g":{"c":9,"v":5},"h":{"c":10,"v":18},"i":{"c":11,"v":18},"j":{"c":12,"v":47},"k":{"c":16,"v":22},"l":{"c":19,"v":21},"m":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.51,"y":-0.05,"normalized":{"x":0.9952285,"y":-0.09757143,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.5124451,"sqrMagnitude":0.262599975},"scale":0.3},"tDecalB":{"position":{"x":0.5,"y":-0.07,"normalized":{"x":0.990341663,"y":-0.138647839,"normalized":{"x":0.9903418,"y":-0.138647854,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.9999999,"sqrMagnitude":0.9999998},"magnitude":0.504876256,"sqrMagnitude":0.2549},"scale":0.3},"tPattern":{"angle":-90.0,"scale":0.3}},"publicName":{"data":"Buckland SBS III"}}}`), {
  name: "Sawed-Off Burst Shotgun",
  type: "pistol", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});

// Specials
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Buckland HD257","Packet":{"Comps":{"Length":16,"a":{"c":2,"v":6},"b":{"c":3,"v":110},"c":{"c":4,"v":6},"d":{"c":5,"v":4},"e":{"c":6,"v":4},"f":{"c":7,"v":4},"g":{"c":8,"v":7},"h":{"c":9,"v":1},"i":{"c":10,"v":24},"j":{"c":11,"v":24},"k":{"c":12,"v":22},"l":{"c":16,"v":12},"m":{"c":19,"v":12},"n":{"c":21,"v":5},"o":{"c":25,"v":2}},"MatTrans":{"tDecalA":{"position":{"x":0.11,"y":0.01,"normalized":{"x":0.99589324,"y":0.090535745,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.110453606,"sqrMagnitude":0.0122},"angle":0.07,"scale":0.07},"tDecalB":{"position":{"x":0.105,"y":0.005,"normalized":{"x":0.9988681,"y":0.0475651473,"normalized":{"x":0.998868167,"y":0.04756515,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.105118982,"sqrMagnitude":0.01105},"angle":0.07,"scale":0.07},"tPattern":{"position":{"x":0.25,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.25,"sqrMagnitude":0.0625},"angle":180.0,"scale":0.5}},"publicName":{"data":"Buckland HD257"}}}`), {
  name: "Heavy Shotgun",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Buckland BF114","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":6},"c":{"c":3,"v":110},"d":{"c":4,"v":6},"e":{"c":5,"v":4},"f":{"c":6,"v":4},"g":{"c":7,"v":4},"h":{"c":8,"v":17},"i":{"c":9,"v":5},"j":{"c":10,"v":18},"k":{"c":11,"v":18},"l":{"c":12,"v":12},"m":{"c":16,"v":6},"n":{"c":19,"v":13},"o":{"c":21,"v":40},"p":{"c":23,"v":14},"q":{"c":25,"v":2}},"MatTrans":{"tDecalA":{"position":{"x":0.51,"y":-0.05,"normalized":{"x":0.9952285,"y":-0.09757143,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.5124451,"sqrMagnitude":0.262599975},"scale":0.3},"tDecalB":{"position":{"x":0.5,"y":-0.07,"normalized":{"x":0.990341663,"y":-0.138647839,"normalized":{"x":0.9903418,"y":-0.138647854,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.9999999,"sqrMagnitude":0.9999998},"magnitude":0.504876256,"sqrMagnitude":0.2549},"scale":0.3},"tPattern":{"angle":-90.0,"scale":0.3}},"publicName":{"data":"Buckland BF114"}}}`), {
  name: "Burst Shotgun",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Mastaba HBDXX","Packet":{"Comps":{"Length":14,"a":{"c":2,"v":7},"b":{"c":3,"v":109},"c":{"c":4,"v":7},"d":{"c":5,"v":29},"e":{"c":6,"v":29},"f":{"c":8,"v":7},"g":{"c":9,"v":14},"h":{"c":10,"v":20},"i":{"c":11,"v":35},"j":{"c":12,"v":36},"k":{"c":16,"v":16},"l":{"c":19,"v":21},"m":{"c":25,"v":2}},"MatTrans":{"tDecalA":{"position":{"x":0.17,"y":0.02,"normalized":{"x":0.993150651,"y":0.116841249,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.171172425,"sqrMagnitude":0.0293},"scale":0.06},"tDecalB":{"position":{"x":0.17,"y":-0.015,"normalized":{"x":0.9961299,"y":-0.08789381,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.170660481,"sqrMagnitude":0.0291250013},"scale":0.2},"tPattern":{"position":{"x":0.24,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.24,"sqrMagnitude":0.0576},"scale":0.5}},"publicName":{"data":"Mastaba HBDXX"}}}`), {
  name: "Blunt Revolver",
  type: "pistol", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"TechMan Arbilum IX","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":3},"c":{"c":3,"v":109},"d":{"c":4,"v":3},"e":{"c":5,"v":33},"f":{"c":6,"v":33},"g":{"c":7,"v":3},"h":{"c":8,"v":10},"i":{"c":9,"v":10},"j":{"c":10,"v":13},"k":{"c":11,"v":14},"l":{"c":12,"v":32},"m":{"c":16,"v":6},"n":{"c":19,"v":5},"o":{"c":21,"v":18},"p":{"c":23,"v":14},"q":{"c":25,"v":6}},"MatTrans":{"tDecalA":{"position":{"x":0.1,"y":0.02,"normalized":{"x":0.9805806,"y":0.19611612,"normalized":{"x":0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.101980396,"sqrMagnitude":0.010400001},"angle":180.0,"scale":0.4},"tDecalB":{"position":{"x":-0.07,"y":0.03,"normalized":{"x":-0.919145,"y":0.3939193,"normalized":{"x":-0.919145048,"y":0.393919319,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.0761577338,"sqrMagnitude":0.0058},"angle":-90.0,"scale":0.05},"tPattern":{"angle":-90.0,"scale":0.1}},"publicName":{"data":"TechMan Arbilum IX"}}}`), {
  name: "HEL Machinegun",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"TechMan Arbuta VIII","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":19},"c":{"c":3,"v":109},"d":{"c":4,"v":3},"e":{"c":5,"v":39},"f":{"c":6,"v":33},"g":{"c":7,"v":3},"h":{"c":8,"v":10},"i":{"c":9,"v":10},"j":{"c":10,"v":13},"k":{"c":11,"v":14},"l":{"c":12,"v":27},"m":{"c":16,"v":6},"n":{"c":19,"v":3},"o":{"c":21,"v":5},"p":{"c":23,"v":7},"q":{"c":25,"v":6}},"MatTrans":{"tDecalA":{"position":{"x":0.1,"y":0.02,"normalized":{"x":0.9805806,"y":0.19611612,"normalized":{"x":0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.101980396,"sqrMagnitude":0.010400001},"angle":180.0,"scale":0.4},"tDecalB":{"position":{"x":-0.07,"y":0.03,"normalized":{"x":-0.919145,"y":0.3939193,"normalized":{"x":-0.919145048,"y":0.393919319,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.0761577338,"sqrMagnitude":0.0058},"angle":-90.0,"scale":0.05},"tPattern":{"angle":-90.0,"scale":0.1}},"publicName":{"data":"TechMan Arbuta VIII"}}}`), {
  name: "Heavy Machinegun",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"K├╢nen Anucio X100","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":5},"b":{"c":3,"v":109},"c":{"c":4,"v":5},"d":{"c":5,"v":36},"e":{"c":6,"v":36},"f":{"c":7,"v":5},"g":{"c":8,"v":18},"h":{"c":9,"v":10},"i":{"c":10,"v":27},"j":{"c":11,"v":15},"k":{"c":12,"v":21},"l":{"c":16,"v":9},"m":{"c":19,"v":2},"n":{"c":21,"v":46},"o":{"c":23,"v":5},"p":{"c":25,"v":4}},"MatTrans":{"tDecalA":{"position":{"x":0.04,"y":0.04,"normalized":{"x":0.707106769,"y":0.707106769,"normalized":{"x":0.7071068,"y":0.7071068,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.05656854,"sqrMagnitude":0.0032},"scale":0.08},"tDecalB":{"position":{"x":0.48,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.48,"sqrMagnitude":0.2304},"scale":0.3},"tPattern":{"position":{"y":0.04,"normalized":{"y":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.04,"sqrMagnitude":0.0016},"angle":-90.0,"scale":0.2}},"publicName":{"data":"K├╢nen Anucio X100"}}}`), {
  name: "Accuracy Rifle",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Omnucio LRG 7","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":20},"b":{"c":3,"v":109},"c":{"c":4,"v":5},"d":{"c":5,"v":36},"e":{"c":6,"v":36},"f":{"c":7,"v":5},"g":{"c":8,"v":18},"h":{"c":9,"v":10},"i":{"c":10,"v":27},"j":{"c":11,"v":15},"k":{"c":12,"v":29},"l":{"c":16,"v":1},"m":{"c":19,"v":8},"n":{"c":21,"v":7},"o":{"c":23,"v":19},"p":{"c":25,"v":4}},"MatTrans":{"tDecalA":{"position":{"x":0.04,"y":0.04,"normalized":{"x":0.707106769,"y":0.707106769,"normalized":{"x":0.7071068,"y":0.7071068,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.05656854,"sqrMagnitude":0.0032},"scale":0.08},"tDecalB":{"position":{"x":0.48,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.48,"sqrMagnitude":0.2304},"scale":0.3},"tPattern":{"position":{"y":0.04,"normalized":{"y":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.04,"sqrMagnitude":0.0016},"angle":-90.0,"scale":0.2}},"publicName":{"data":"Omnucio LRG 7"}}}`), {
  name: "Distance Rifle",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});

// Tools
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"D-tek Optron IV","Packet":{"Comps":{"Length":9,"a":{"c":2,"v":9},"b":{"c":3,"v":28},"c":{"c":4,"v":10},"d":{"c":27,"v":10},"e":{"c":30,"v":3},"f":{"c":33,"v":3},"g":{"c":40,"v":2},"h":{"c":42,"v":3}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"D-tek Optron IV"}}}`), {
  name: "Bio Tracker",
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Stalwart Flow G2","Packet":{"Comps":{"Length":12,"a":{"c":2,"v":11},"b":{"c":3,"v":73},"c":{"c":4,"v":15},"d":{"c":27,"v":15},"e":{"c":30,"v":5},"f":{"c":32,"v":4},"g":{"c":33,"v":4},"h":{"c":36,"v":1},"i":{"c":37,"v":2},"j":{"c":40,"v":2},"k":{"c":42,"v":7}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Stalwart Flow G2"}}}`), {
  name: "C-Foam Launcher",
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Krieger O4","Packet":{"Comps":{"Length":10,"a":{"c":2,"v":13},"b":{"c":3,"v":37},"c":{"c":4,"v":14},"d":{"c":27,"v":12},"e":{"c":30,"v":2},"f":{"c":33,"v":2},"g":{"c":37,"v":1},"h":{"c":40,"v":1},"i":{"c":42,"v":6}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Krieger O4"}}}`), {
  name: "Mine deployer",
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"RAD Labs Meduza","Packet":{"Comps":{"Length":11,"a":{"c":1,"v":11},"b":{"c":2,"v":12},"c":{"c":3,"v":97},"d":{"c":4,"v":11},"e":{"c":5,"v":45},"f":{"c":12,"v":28},"g":{"c":16,"v":2},"h":{"c":27,"v":9},"i":{"c":40,"v":2},"j":{"c":42,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"RAD Labs Meduza"}}}`), {
  name: "Assault Sentry",
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Autotek 51 RSG","Packet":{"Comps":{"Length":11,"a":{"c":1,"v":10},"b":{"c":2,"v":12},"c":{"c":3,"v":97},"d":{"c":4,"v":11},"e":{"c":5,"v":36},"f":{"c":12,"v":19},"g":{"c":16,"v":1},"h":{"c":27,"v":9},"i":{"c":40,"v":1},"j":{"c":42,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Autotek 51 RSG"}}}`), {
  name: "Angry Blind Sentry",
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Mechatronic B5 LFR","Packet":{"Comps":{"Length":11,"a":{"c":1,"v":13},"b":{"c":2,"v":12},"c":{"c":3,"v":97},"d":{"c":4,"v":11},"e":{"c":5,"v":4},"f":{"c":12,"v":13},"g":{"c":16,"v":2},"h":{"c":27,"v":9},"i":{"c":40,"v":2},"j":{"c":42,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Mechatronic B5 LFR"}}}`), {
  name: "Auto Shotgun Sentry",
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});

// Melees
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Heavy Ripper","Packet":{"Comps":{"Length":8,"a":{"c":2,"v":14},"b":{"c":3,"v":100},"c":{"c":4,"v":13},"d":{"c":44,"v":9},"e":{"c":46,"v":14},"f":{"c":48,"v":9},"g":{"c":50,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Heavy Ripper"}}}`), {
  name: "Sawblade Axe",
  type: "melee",
  meleeArchetype: exports.hammerArchetype, // valid choices: hammerArchetype, spearArchetype, knifeArchetype, batArchetype
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Bone Beater","Packet":{"Comps":{"Length":7,"a":{"c":2,"v":27},"b":{"c":3,"v":161},"c":{"c":4,"v":39},"d":{"c":44,"v":4},"e":{"c":48,"v":14},"f":{"c":50,"v":10}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Bone Beater"}}}`), {
  name: "Beater",
  type: "melee",
  meleeArchetype: exports.knifeArchetype, // valid choices: hammerArchetype, spearArchetype, knifeArchetype, batArchetype
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Silent Smacker","Packet":{"Comps":{"Length":7,"a":{"c":2,"v":29},"b":{"c":3,"v":163},"c":{"c":4,"v":41},"d":{"c":44,"v":15},"e":{"c":48,"v":16},"f":{"c":50,"v":12}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Silent Smacker"}}}`), {
  name: "Crowbar",
  type: "melee",
  meleeArchetype: exports.batArchetype, // valid choices: hammerArchetype, spearArchetype, knifeArchetype, batArchetype
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Specialized Torture","Packet":{"Comps":{"Length":7,"a":{"c":2,"v":28},"b":{"c":3,"v":162},"c":{"c":4,"v":40},"d":{"c":44,"v":17},"e":{"c":48,"v":15},"f":{"c":50,"v":11}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Specialized Torture"}}}`), {
  name: "Tactical Spear",
  type: "melee",
  meleeArchetype: exports.spearArchetype, // valid choices: hammerArchetype, spearArchetype, knifeArchetype, batArchetype
  baseItem: Identifier.create("Item", 162),
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    model.equipOffsetPos = { x: 0.1, y: 0.3, z: 0 };
	model.equipOffsetRot = { x: 0, y: 0, z: -0.1736482, w: 0.9848078 };
    return model;
  }
});

// Hacking Tool
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Hacking Tool","Packet":{"Comps":{"Length":5,"a":{"c":2,"v":15},"b":{"c":3,"v":53},"c":{"c":4,"v":17},"d":{"c":5,"v":28}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Hacking Tool"}}}`), {
  name: "Hacking Tool",
  type: "rifle",
  model: () => new HackingTool()
});
