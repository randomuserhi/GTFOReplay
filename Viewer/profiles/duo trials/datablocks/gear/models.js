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
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Inferno Z-11","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":100},"c":{"c":3,"v":108},"d":{"c":4,"v":100},"e":{"c":5,"v":100},"f":{"c":6,"v":3},"g":{"c":7,"v":2},"h":{"c":8,"v":17},"i":{"c":9,"v":6},"j":{"c":10,"v":12},"k":{"c":11,"v":12},"l":{"c":12,"v":100},"m":{"c":16,"v":13},"n":{"c":19,"v":2},"o":{"c":21,"v":10},"p":{"c":23,"v":3},"q":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.045,"y":0.025,"normalized":{"x":0.8741573,"y":0.48564294,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05147815,"sqrMagnitude":0.00265000015},"angle":90.0,"scale":0.1},"tDecalB":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":90.0,"scale":0.1},"tPattern":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Inferno Z-11"}}}`), {
  name: "Assault Rifle",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.transformPart("sight", {
        position: { x: 0, y: 0, z: -0.05 }
      },"deg");
    });
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"ShreddX","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":105},"c":{"c":3,"v":108},"d":{"c":4,"v":107},"e":{"c":5,"v":47},"f":{"c":6,"v":2},"g":{"c":7,"v":1},"h":{"c":8,"v":15},"i":{"c":9,"v":5},"j":{"c":10,"v":17},"k":{"c":11,"v":17},"l":{"c":12,"v":26},"m":{"c":16,"v":6},"n":{"c":19,"v":9},"o":{"c":21,"v":15},"p":{"c":23,"v":8},"q":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.07,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.07,"sqrMagnitude":0.0049},"angle":45.0,"scale":0.1},"tDecalB":{"position":{"x":0.075,"y":0.003,"normalized":{"x":0.999201059,"y":0.03996804,"normalized":{"x":0.99920094,"y":0.0399680361,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":1.00000012,"sqrMagnitude":1.00000024},"magnitude":0.07505997,"sqrMagnitude":0.005634},"angle":45.0,"scale":0.1},"tPattern":{"position":{"x":0.02,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.02,"sqrMagnitude":0.0004},"angle":200.0,"scale":0.5}},"publicName":{"data":"ShreddX"}}}`), {
  name: "The Grinder",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.transformPart("sight", {
        position: { x: 0, y: 0.0, z: -0.03 }
      },"deg");
    });
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Revision 774","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":104},"b":{"c":3,"v":108},"c":{"c":4,"v":125},"d":{"c":5,"v":36},"e":{"c":6,"v":36},"f":{"c":7,"v":5},"g":{"c":8,"v":18},"h":{"c":9,"v":10},"i":{"c":10,"v":27},"j":{"c":11,"v":15},"k":{"c":12,"v":104},"l":{"c":16,"v":9},"m":{"c":19,"v":2},"n":{"c":21,"v":22},"o":{"c":23,"v":8},"p":{"c":25,"v":4}},"MatTrans":{"tDecalA":{"position":{"x":0.04,"y":0.04,"normalized":{"x":0.707106769,"y":0.707106769,"normalized":{"x":0.7071068,"y":0.7071068,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.05656854,"sqrMagnitude":0.0032},"scale":0.08},"tDecalB":{"position":{"x":0.48,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.48,"sqrMagnitude":0.2304},"scale":0.3},"tPattern":{"position":{"y":0.04,"normalized":{"y":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.04,"sqrMagnitude":0.0016},"angle":-90.0,"scale":0.2}},"publicName":{"data":"Revision 774"}}}`), {
  name: "Combat Sniper",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.transformPart("sight", {
        position: { x: 0, y: 0.0, z: -0.08 }
      },"deg");
    });
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Buckland I-12","Packet":{"Comps":{"Length":16,"a":{"c":2,"v":108},"b":{"c":3,"v":156},"c":{"c":4,"v":120},"d":{"c":5,"v":4},"e":{"c":6,"v":4},"f":{"c":7,"v":4},"g":{"c":8,"v":7},"h":{"c":9,"v":1},"i":{"c":10,"v":24},"j":{"c":11,"v":24},"k":{"c":12,"v":108},"l":{"c":16,"v":12},"m":{"c":19,"v":10},"n":{"c":21,"v":40},"o":{"c":25,"v":2}},"MatTrans":{"tDecalA":{"position":{"x":0.11,"y":0.01,"normalized":{"x":0.99589324,"y":0.090535745,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.110453606,"sqrMagnitude":0.0122},"angle":0.07,"scale":0.07},"tDecalB":{"position":{"x":0.105,"y":0.005,"normalized":{"x":0.9988681,"y":0.0475651473,"normalized":{"x":0.998868167,"y":0.04756515,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.105118982,"sqrMagnitude":0.01105},"angle":0.07,"scale":0.07},"tPattern":{"position":{"x":0.25,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.25,"sqrMagnitude":0.0625},"angle":180.0,"scale":0.5}},"publicName":{"data":"Buckland I-12"}}}`), {
  name: "Surefire",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.transformPart("sight", {
        position: { x: 0, y: 0.0, z: -0.132 }
      },"deg");
    });
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Vanguard K-86","Packet":{"Comps":{"Length":16,"a":{"c":2,"v":107},"b":{"c":3,"v":108},"c":{"c":4,"v":48},"d":{"c":5,"v":48},"e":{"c":6,"v":2},"f":{"c":7,"v":1},"g":{"c":8,"v":19},"h":{"c":9,"v":9},"i":{"c":10,"v":10},"j":{"c":11,"v":10},"k":{"c":12,"v":45},"l":{"c":16,"v":23},"m":{"c":19,"v":18},"n":{"c":23,"v":8},"o":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.05,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05,"sqrMagnitude":0.00250000018},"scale":0.3},"tDecalB":{"position":{"x":0.1,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.1,"sqrMagnitude":0.0100000007},"scale":0.3},"tPattern":{"angle":-135.0,"scale":0.2}},"publicName":{"data":"Vanguard K-86"}}}`), {
  name: "Compact Pistol",
  type: "pistol", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"TAC-99","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":1},"b":{"c":2,"v":101},"c":{"c":3,"v":108},"d":{"c":4,"v":102},"e":{"c":5,"v":42},"f":{"c":6,"v":3},"g":{"c":7,"v":2},"h":{"c":8,"v":17},"i":{"c":9,"v":6},"j":{"c":10,"v":12},"k":{"c":11,"v":12},"l":{"c":12,"v":41},"m":{"c":16,"v":20},"n":{"c":19,"v":101},"o":{"c":21,"v":21},"p":{"c":23,"v":20},"q":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.045,"y":0.025,"normalized":{"x":0.8741573,"y":0.48564294,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05147815,"sqrMagnitude":0.00265000015},"angle":90.0,"scale":0.1},"tDecalB":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":90.0,"scale":0.1},"tPattern":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":-90.0,"scale":0.1}},"publicName":{"data":"TAC-99"}}}`), {
  name: "Tactical Rifle",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.transformPart("sight", {
        position: { x: 0, y: 0.0, z: 0.12 }
      },"deg");
    });
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"WMG 22-IL","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":112},"c":{"c":3,"v":108},"d":{"c":4,"v":130},"e":{"c":5,"v":33},"f":{"c":6,"v":33},"g":{"c":7,"v":3},"h":{"c":8,"v":10},"i":{"c":9,"v":10},"j":{"c":10,"v":13},"k":{"c":11,"v":14},"l":{"c":12,"v":18},"m":{"c":16,"v":14},"n":{"c":19,"v":8},"o":{"c":21,"v":10},"p":{"c":23,"v":14},"q":{"c":25,"v":6}},"MatTrans":{"tDecalA":{"position":{"x":0.1,"y":0.02,"normalized":{"x":0.9805806,"y":0.19611612,"normalized":{"x":0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.101980396,"sqrMagnitude":0.010400001},"angle":180.0,"scale":0.4},"tDecalB":{"position":{"x":-0.07,"y":0.03,"normalized":{"x":-0.919145,"y":0.3939193,"normalized":{"x":-0.919145048,"y":0.393919319,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.0761577338,"sqrMagnitude":0.0058},"angle":-90.0,"scale":0.05},"tPattern":{"angle":-90.0,"scale":0.1}},"publicName":{"data":"WMG 22-IL"}}}`), {
  name: "Heavy Machinegun",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.transformPart("sight", {
        position: { x: 0, y: 0.0, z: -0.1 }
      },"deg");
    });
    return model;
  }
});

// Specials
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Caliber IF-4","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":102},"c":{"c":3,"v":109},"d":{"c":4,"v":102},"e":{"c":5,"v":102},"f":{"c":6,"v":1},"g":{"c":7,"v":2},"h":{"c":8,"v":17},"i":{"c":9,"v":6},"j":{"c":10,"v":12},"k":{"c":11,"v":12},"l":{"c":12,"v":102},"m":{"c":16,"v":9},"n":{"c":19,"v":8},"o":{"c":21,"v":45},"p":{"c":23,"v":3},"q":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.045,"y":0.025,"normalized":{"x":0.8741573,"y":0.48564294,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05147815,"sqrMagnitude":0.00265000015},"angle":90.0,"scale":0.1},"tDecalB":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":90.0,"scale":0.1},"tPattern":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Caliber IF-4"}}}`), {
  name: "Battle Rifle",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.transformPart("sight", {
        position: { x: 0, y: 0, z: -0.12 }
      },"deg");
    });
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"SUS A-Mong","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":106},"c":{"c":3,"v":109},"d":{"c":4,"v":107},"e":{"c":5,"v":47},"f":{"c":6,"v":2},"g":{"c":7,"v":1},"h":{"c":8,"v":15},"i":{"c":9,"v":5},"j":{"c":10,"v":17},"k":{"c":11,"v":17},"l":{"c":12,"v":25},"m":{"c":16,"v":12},"n":{"c":19,"v":5},"o":{"c":21,"v":12},"p":{"c":23,"v":8},"q":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.07,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.07,"sqrMagnitude":0.0049},"angle":45.0,"scale":0.1},"tDecalB":{"position":{"x":0.075,"y":0.003,"normalized":{"x":0.999201059,"y":0.03996804,"normalized":{"x":0.99920094,"y":0.0399680361,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":1.00000012,"sqrMagnitude":1.00000024},"magnitude":0.07505997,"sqrMagnitude":0.005634},"angle":45.0,"scale":0.1},"tPattern":{"position":{"x":0.02,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.02,"sqrMagnitude":0.0004},"angle":200.0,"scale":0.5}},"publicName":{"data":"SUS A-Mong"}}}`), {
  name: "Quadrail SMG",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.transformPart("sight", {
        position: { x: 0, y: 0.0, z: -0.1 }
      },"deg");
    });
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Buckland S-44","Packet":{"Comps":{"Length":17,"a":{"c":1,"v":2},"b":{"c":2,"v":109},"c":{"c":3,"v":110},"d":{"c":4,"v":120},"e":{"c":5,"v":4},"f":{"c":6,"v":4},"g":{"c":7,"v":4},"h":{"c":8,"v":17},"i":{"c":9,"v":5},"j":{"c":10,"v":18},"k":{"c":11,"v":18},"l":{"c":12,"v":109},"m":{"c":16,"v":6},"n":{"c":19,"v":10},"o":{"c":21,"v":42},"p":{"c":25,"v":2}},"MatTrans":{"tDecalA":{"position":{"x":0.51,"y":-0.05,"normalized":{"x":0.9952285,"y":-0.09757143,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.5124451,"sqrMagnitude":0.262599975},"scale":0.3},"tDecalB":{"position":{"x":0.5,"y":-0.07,"normalized":{"x":0.990341663,"y":-0.138647839,"normalized":{"x":0.9903418,"y":-0.138647854,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.9999999,"sqrMagnitude":0.9999998},"magnitude":0.504876256,"sqrMagnitude":0.2549},"scale":0.3},"tPattern":{"angle":-90.0,"scale":0.3}},"publicName":{"data":"Buckland S-44"}}}`), {
  name: "Shockwave",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.transformPart("sight", {
        position: { x: 0, y: 0.0, z: -0.095 }
      },"deg");
    });
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Raid SS-6","Packet":{"Comps":{"Length":15,"a":{"c":2,"v":38},"b":{"c":3,"v":109},"c":{"c":4,"v":42},"d":{"c":5,"v":29},"e":{"c":6,"v":29},"f":{"c":7,"v":2},"g":{"c":8,"v":19},"h":{"c":9,"v":10},"i":{"c":10,"v":17},"j":{"c":11,"v":17},"k":{"c":12,"v":111},"l":{"c":16,"v":17},"m":{"c":19,"v":15},"n":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.115,"y":-0.02,"normalized":{"x":0.9852118,"y":-0.171341166,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.116726175,"sqrMagnitude":0.0136250006},"angle":45.0,"scale":0.05},"tDecalB":{"position":{"x":0.115,"y":-0.02,"normalized":{"x":0.9852118,"y":-0.171341166,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.116726175,"sqrMagnitude":0.0136250006},"scale":0.06},"tPattern":{"position":{"x":0.07,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.07,"sqrMagnitude":0.0049},"angle":120.0,"scale":0.08}},"publicName":{"data":"Raid SS-6"}}}`), {
  name: "Impaler",
  type: "pistol", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Redeemer K-79","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":103},"c":{"c":3,"v":109},"d":{"c":4,"v":102},"e":{"c":5,"v":42},"f":{"c":6,"v":1},"g":{"c":7,"v":2},"h":{"c":8,"v":17},"i":{"c":9,"v":6},"j":{"c":10,"v":12},"k":{"c":11,"v":12},"l":{"c":12,"v":103},"m":{"c":16,"v":8},"n":{"c":19,"v":12},"o":{"c":21,"v":9},"p":{"c":23,"v":3},"q":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.045,"y":0.025,"normalized":{"x":0.8741573,"y":0.48564294,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05147815,"sqrMagnitude":0.00265000015},"angle":90.0,"scale":0.1},"tDecalB":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":90.0,"scale":0.1},"tPattern":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Redeemer K-79"}}}`), {
  name: "Precision Rifle",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.transformPart("sight", {
        position: { x: 0, y: 0.0, z: -0.08 }
      },"deg");
    });
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"WMG 24-SP","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":113},"c":{"c":3,"v":109},"d":{"c":4,"v":131},"e":{"c":5,"v":113},"f":{"c":6,"v":33},"g":{"c":7,"v":3},"h":{"c":8,"v":10},"i":{"c":9,"v":10},"j":{"c":10,"v":13},"k":{"c":11,"v":14},"l":{"c":12,"v":113},"m":{"c":16,"v":11},"n":{"c":19,"v":3},"o":{"c":21,"v":24},"p":{"c":23,"v":7},"q":{"c":25,"v":6}},"MatTrans":{"tDecalA":{"position":{"x":0.1,"y":0.02,"normalized":{"x":0.9805806,"y":0.19611612,"normalized":{"x":0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.101980396,"sqrMagnitude":0.010400001},"angle":180.0,"scale":0.4},"tDecalB":{"position":{"x":-0.07,"y":0.03,"normalized":{"x":-0.919145,"y":0.3939193,"normalized":{"x":-0.919145048,"y":0.393919319,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.0761577338,"sqrMagnitude":0.0058},"angle":-90.0,"scale":0.05},"tPattern":{"angle":-90.0,"scale":0.1}},"publicName":{"data":"WMG 24-SP"}}}`), {
  name: "Shrapnel Machinegun",
  type: "rifle", // "pistol" also valid
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.transformPart("sight", {
        position: { x: 0, y: 0, z: 0.07 }
      },"deg");
    });
    return model;
  }
});

// Tools
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"D-tek Optron IV","Packet":{"Comps":{"Length":10,"a":{"c":2,"v":9},"b":{"c":3,"v":28},"c":{"c":4,"v":10},"d":{"c":25,"v":4},"e":{"c":27,"v":10},"f":{"c":30,"v":3},"g":{"c":33,"v":3},"h":{"c":40,"v":2},"i":{"c":42,"v":3}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"D-tek Optron IV"}}}`), {
  name: "Bio Tracker",
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.transformPart("flashlight", {
        rotation: { x: 0, y: 2, z: 0 }
      },"deg");
    });
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
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Skull Splitter","Packet":{"Comps":{"Length":11,"a":{"c":1,"v":11},"b":{"c":2,"v":12},"c":{"c":3,"v":97},"d":{"c":4,"v":11},"e":{"c":5,"v":45},"f":{"c":12,"v":28},"g":{"c":16,"v":2},"h":{"c":27,"v":9},"i":{"c":40,"v":2},"j":{"c":42,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Skull Splitter"}}}`), {
  name: "Assault Sentry",
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});

// Melees
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Redeemer","Packet":{"Comps":{"Length":8,"a":{"c":2,"v":14},"b":{"c":3,"v":100},"c":{"c":4,"v":13},"d":{"c":44,"v":2},"e":{"c":46,"v":4},"f":{"c":48,"v":9},"g":{"c":50,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Redeemer"}}}`), {
  name: "Sledgehammer",
  type: "melee",
  meleeArchetype: exports.hammerArchetype, // valid choices: hammerArchetype, spearArchetype, knifeArchetype, batArchetype
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Stalker","Packet":{"Comps":{"Length":7,"a":{"c":2,"v":27},"b":{"c":3,"v":161},"c":{"c":4,"v":39},"d":{"c":44,"v":12},"e":{"c":48,"v":14},"f":{"c":50,"v":10}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Stalker"}}}`), {
  name: "Assassin Knife",
  type: "melee",
  meleeArchetype: exports.knifeArchetype, // valid choices: hammerArchetype, spearArchetype, knifeArchetype, batArchetype
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Courage","Packet":{"Comps":{"Length":7,"a":{"c":2,"v":28},"b":{"c":3,"v":162},"c":{"c":4,"v":40},"d":{"c":44,"v":13},"e":{"c":48,"v":15},"f":{"c":50,"v":11}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Courage"}}}`), {
  name: "Combat Spear",
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
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Executioner","Packet":{"Comps":{"Length":8,"a":{"c":2,"v":31},"b":{"c":3,"v":215},"c":{"c":4,"v":134},"d":{"c":42,"v":12},"e":{"c":44,"v":12},"f":{"c":48,"v":15},"g":{"c":50,"v":10}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Executioner"}}}`), {
  name: "Hatchet",
  type: "melee",
  meleeArchetype: exports.batArchetype, // valid choices: hammerArchetype, spearArchetype, knifeArchetype, batArchetype
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.transformPart("screen", {
        position: { x: 0, y: 0.225, z: 0.01 },
        scale: { x: 2.0, y: 2.0, z: 1.1 },
        rotation: { x: 0, y: 325, z: 0 }
      },"deg");
      model.transformPart("head", {
        position: { x: 0, y: 0.375, z: -0.015 },
        scale: { x: 1.0, y: 1, z: 0.55 },
        rotation: { x: 0, y: 145, z: 0 }
      },"deg");
      model.transformPart("handle", {
        position: { x: 0, y: 0.14, z: 0.0 },
        scale: { x: 1, y: 1.1, z: 1 },
        rotation: { x: 0, y: 325, z: 180 }
      },"deg");
      model.transformPart("pommel", {
        position: { x: 0, y: 0.38, z: 0.0 },
        scale: { x: 2.0, y: 1.0, z: 0.5 },
        rotation: { x: 0, y: 325, z: 0 }
      },"deg");
    });
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Maul","Packet":{"Comps":{"Length":8,"a":{"c":2,"v":14},"b":{"c":3,"v":100},"c":{"c":4,"v":13},"d":{"c":44,"v":3},"e":{"c":46,"v":5},"f":{"c":48,"v":2},"g":{"c":50,"v":5}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Maul"}}}`), {
  name: "Sledgehammer",
  type: "melee",
  meleeArchetype: exports.hammerArchetype, // valid choices: hammerArchetype, spearArchetype, knifeArchetype, batArchetype
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Mallet","Packet":{"Comps":{"Length":8,"a":{"c":2,"v":14},"b":{"c":3,"v":100},"c":{"c":4,"v":13},"d":{"c":44,"v":6},"e":{"c":46,"v":9},"f":{"c":48,"v":10},"g":{"c":50,"v":8}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Mallet"}}}`), {
  name: "Sledgehammer",
  type: "melee",
  meleeArchetype: exports.hammerArchetype, // valid choices: hammerArchetype, spearArchetype, knifeArchetype, batArchetype
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Gavel","Packet":{"Comps":{"Length":8,"a":{"c":2,"v":14},"b":{"c":3,"v":100},"c":{"c":4,"v":13},"d":{"c":44,"v":5},"e":{"c":46,"v":3},"f":{"c":48,"v":12},"g":{"c":50,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Gavel"}}}`), {
  name: "Sledgehammer",
  type: "melee",
  meleeArchetype: exports.hammerArchetype, // valid choices: hammerArchetype, spearArchetype, knifeArchetype, batArchetype
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    return model;
  }
});

// Hacking Tool
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Hacking Tool","Packet":{"Comps":{"Length":5,"a":{"c":2,"v":15},"b":{"c":3,"v":53},"c":{"c":4,"v":17},"d":{"c":5,"v":28}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Hacking Tool"}}}`), {
  name: "Hacking Tool",
  type: "rifle",
  model: () => new HackingTool()
});
