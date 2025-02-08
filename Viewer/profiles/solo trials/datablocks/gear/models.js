const { Vector3 } = await require("three", "esm");
const { GearAnimDatablock } = await require("../../../vanilla/datablocks/gear/animation.js", "asl");
const { GearDatablock } = await require("../../../vanilla/datablocks/gear/models.js", "asl");
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

// Melees
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Santonian HDH","Packet":{"Comps":{"Length":8,"a":{"c":2,"v":14},"b":{"c":3,"v":100},"c":{"c":4,"v":13},"d":{"c":44,"v":2},"e":{"c":46,"v":4},"f":{"c":48,"v":9},"g":{"c":50,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Santonian HDH"}}}`), {
  model: gearJSON => new GearBuilder(gearJSON),
  type: "melee",
  meleeArchetype: exports.hammerArchetype,
  name: "Sledgehammer"
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Mastaba Fixed Blade","Packet":{"Comps":{"Length":7,"a":{"c":2,"v":27},"b":{"c":3,"v":161},"c":{"c":4,"v":39},"d":{"c":44,"v":12},"e":{"c":48,"v":14},"f":{"c":50,"v":10}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Mastaba Fixed Blade"}}}`), {
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    model.equipOffsetPos = {
      x: 0,
      y: 0.05,
      z: -0.1
    };
    model.equipOffsetRot = {
      x: 0.3420201,
      y: 0,
      z: 0,
      w: 0.9396926
    };
    return model;
  },
  type: "melee",
  meleeArchetype: exports.knifeArchetype,
  name: "Assassin Knife"
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"MACO Drillhead","Packet":{"Comps":{"Length":7,"a":{"c":2,"v":28},"b":{"c":3,"v":162},"c":{"c":4,"v":40},"d":{"c":44,"v":13},"e":{"c":48,"v":15},"f":{"c":50,"v":11}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"MACO Drillhead"}}}`), {
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    model.equipOffsetPos = {
      x: 0.1,
      y: 0.3,
      z: 0
    };
    model.equipOffsetRot = {
      x: 0,
      y: 0,
      z: -0.1736482,
      w: 0.9848078
    };
    return model;
  },
  type: "melee",
  meleeArchetype: exports.spearArchetype,
  name: "Combat Spear"
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Kovac Peacekeeper","Packet":{"Comps":{"Length":7,"a":{"c":2,"v":29},"b":{"c":3,"v":163},"c":{"c":4,"v":41},"d":{"c":44,"v":14},"e":{"c":48,"v":16},"f":{"c":50,"v":12}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Kovac Peacekeeper"}}}`), {
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    model.leftHand = undefined;
    model.equipOffsetPos = {
      x: 0,
      y: 0.1,
      z: 0
    };
    return model;
  },
  type: "melee",
  meleeArchetype: exports.batArchetype,
  name: "Bat"
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Mastaba Ascended Blade","Packet":{"Comps":{"Length":8,"a":{"c":2,"v":31},"b":{"c":3,"v":215},"c":{"c":4,"v":134},"d":{"c":42,"v":12},"e":{"c":44,"v":12},"f":{"c":48,"v":15},"g":{"c":50,"v":10}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Mastaba Ascended Blade"}}}`), {
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHand = undefined;
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: -0.01
      };
      model.equipOffsetRot = {
        x: 0,
        y: 0,
        z: 0.1736482,
        w: 0.9848078
      };

      model.transformPart("head", {
        position: { x: 0, y: -0.125, z: -0.015 },
        scale: { x: 2, y: 4, z: 1 },
        rotation: { x: 0, y: 315, z: 0 } 
        }, "deg");
      model.transformPart("screen", {
        position: { x: 0, y: -0.125, z: -0.025 },
        scale: { x: 2, y: 4, z: 1.0 },
        rotation: { x: 0, y: 135, z: 0 } 
        }, "deg");
      model.transformPart("handle", {
        position: { x: 0, y: -0.05, z: -0.02 },
        scale: { x: 1, y: 0.25, z: 2 },
        rotation: { x: 0, y: 315, z: 180 } 
        }, "deg");
      model.transformPart("pommel", {
        position: { x: 0, y: -0.06, z: -0.02 },
        scale: { x: 1, y: 1, z: 1 },
        rotation: { x: 0, y: 315, z: 0 } 
        }, "deg");
    })

    return model;
  },
  type: "melee",
  meleeArchetype: exports.batArchetype,
  name: "Sword"
});

// Tools
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"D-tek Optron IV","Packet":{"Comps":{"Length":9,"a":{"c":2,"v":9},"b":{"c":3,"v":28},"c":{"c":4,"v":10},"d":{"c":27,"v":10},"e":{"c":30,"v":3},"f":{"c":33,"v":3},"g":{"c":40,"v":2},"h":{"c":42,"v":3}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"D-tek Optron IV"}}}`), {
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    model.leftHandGrip = {
      x: 0.1,
      y: -0.15,
      z: 0.12
    };
    model.equipOffsetPos = {
      x: 0,
      y: 0.1,
      z: 0.1
    };
    return model;
  },
  name: "Bio Tracker"
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Stalwart Flow G2","Packet":{"Comps":{"Length":12,"a":{"c":2,"v":11},"b":{"c":3,"v":73},"c":{"c":4,"v":15},"d":{"c":27,"v":15},"e":{"c":30,"v":5},"f":{"c":32,"v":4},"g":{"c":33,"v":4},"h":{"c":36,"v":1},"i":{"c":37,"v":2},"j":{"c":40,"v":2},"k":{"c":42,"v":7}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Stalwart Flow G2"}}}`), {
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    model.leftHandGrip = {
      x: 0.05,
      y: -0.1,
      z: 0.12
    };
    model.equipOffsetPos = {
      x: 0,
      y: 0.1,
      z: 0.1
    };
    return model;
  },
  name: "C-Foam Launcher"
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Krieger O4","Packet":{"Comps":{"Length":10,"a":{"c":2,"v":13},"b":{"c":3,"v":37},"c":{"c":4,"v":14},"d":{"c":27,"v":12},"e":{"c":30,"v":2},"f":{"c":33,"v":2},"g":{"c":37,"v":1},"h":{"c":40,"v":1},"i":{"c":42,"v":6}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Krieger O4"}}}`), {
  model: gearJSON => {
    const model = new GearBuilder(gearJSON);
    model.leftHandGrip = {
      x: 0.05,
      y: -0.1,
      z: 0.07
    };
    model.equipOffsetPos = {
      x: 0,
      y: 0.1,
      z: 0.1
    };
    return model;
  },
  name: "Mine Deployer"
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Malice","Packet":{"Comps":{"Length":11,"a":{"c":1,"v":11},"b":{"c":2,"v":12},"c":{"c":3,"v":97},"d":{"c":4,"v":11},"e":{"c":5,"v":45},"f":{"c":12,"v":28},"g":{"c":16,"v":2},"h":{"c":27,"v":9},"i":{"c":40,"v":2},"j":{"c":42,"v":2}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Malice"}}}`), {
  model: gearJSON => new GearBuilder(gearJSON),
  name: "Friendly Sentry"
});

// Mains
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Mechanical Dismantler","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":100},"c":{"c":3,"v":108},"d":{"c":4,"v":100},"e":{"c":5,"v":33},"f":{"c":6,"v":3},"g":{"c":7,"v":2},"h":{"c":8,"v":17},"i":{"c":9,"v":6},"j":{"c":10,"v":12},"k":{"c":11,"v":12},"l":{"c":12,"v":27},"m":{"c":16,"v":14},"n":{"c":19,"v":8},"o":{"c":21,"v":16},"p":{"c":23,"v":18},"q":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.045,"y":0.025,"normalized":{"x":0.8741573,"y":0.48564294,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05147815,"sqrMagnitude":0.00265000015},"angle":90.0,"scale":0.1},"tDecalB":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":90.0,"scale":0.1},"tPattern":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Mechanical Dismantler"}}}`), {
  name: "Mechanical Rifle",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Stock_Pistol_1_reload_1, // fix this? pistol reload doesn't look quite right but this does nothing
    offset: new Vector3(0, 0, 0.4)
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.05,
        y: -0.1,
        z: 0.2
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.08,
        z: -0.04
      };

      model.transformPart("sight", {
        position: { x: 0, y: 0, z: -0.175 }
      });
    })
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Mechanical Shredder","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":102},"c":{"c":3,"v":108},"d":{"c":4,"v":102},"e":{"c":5,"v":42},"f":{"c":6,"v":3},"g":{"c":7,"v":2},"h":{"c":8,"v":17},"i":{"c":9,"v":6},"j":{"c":10,"v":12},"k":{"c":11,"v":12},"l":{"c":12,"v":17},"m":{"c":16,"v":12},"n":{"c":19,"v":8},"o":{"c":21,"v":21},"p":{"c":23,"v":2},"q":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.045,"y":0.025,"normalized":{"x":0.8741573,"y":0.48564294,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05147815,"sqrMagnitude":0.00265000015},"angle":90.0,"scale":0.1},"tDecalB":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":90.0,"scale":0.1},"tPattern":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Mechanical Shredder"}}}`), {
  name: "HEL Assault Rifle",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.3)
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.02,
        y: -0.08,
        z: 0.2
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: -0.04
      };
    })
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Nightmare","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":113},"c":{"c":3,"v":108},"d":{"c":4,"v":102},"e":{"c":5,"v":57},"f":{"c":6,"v":1},"g":{"c":7,"v":2},"h":{"c":8,"v":17},"i":{"c":9,"v":6},"j":{"c":10,"v":12},"k":{"c":11,"v":12},"l":{"c":12,"v":14},"m":{"c":16,"v":6},"n":{"c":19,"v":3},"o":{"c":21,"v":45},"p":{"c":23,"v":2},"q":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.045,"y":0.025,"normalized":{"x":0.8741573,"y":0.48564294,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05147815,"sqrMagnitude":0.00265000015},"angle":90.0,"scale":0.1},"tDecalB":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":90.0,"scale":0.1},"tPattern":{"position":{"x":0.05,"y":0.03,"normalized":{"x":0.8574929,"y":0.51449573,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05830952,"sqrMagnitude":0.00340000028},"angle":-90.0,"scale":0.1}},"publicName":{"data":"Nightmare"}}}`), {
  name: "Tech Rifle",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.3)
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.02,
        y: -0.08,
        z: 0.18
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: -0.05
      };

      model.transformPart("sight", {
        position: { x: 0, y: 0, z: -0.085 }
      });
    })
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Cyclone","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":107},"c":{"c":3,"v":108},"d":{"c":4,"v":107},"e":{"c":5,"v":47},"f":{"c":6,"v":2},"g":{"c":7,"v":1},"h":{"c":8,"v":15},"i":{"c":9,"v":5},"j":{"c":10,"v":17},"k":{"c":11,"v":17},"l":{"c":12,"v":26},"m":{"c":16,"v":12},"n":{"c":19,"v":9},"o":{"c":21,"v":15},"p":{"c":23,"v":8},"q":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.07,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.07,"sqrMagnitude":0.0049},"angle":45.0,"scale":0.1},"tDecalB":{"position":{"x":0.075,"y":0.003,"normalized":{"x":0.999201059,"y":0.03996804,"normalized":{"x":0.99920094,"y":0.0399680361,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":1.00000012,"sqrMagnitude":1.00000024},"magnitude":0.07505997,"sqrMagnitude":0.005634},"angle":45.0,"scale":0.1},"tPattern":{"position":{"x":0.02,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.02,"sqrMagnitude":0.0004},"angle":200.0,"scale":0.5}},"publicName":{"data":"Cyclone"}}}`), {
  name: "Metalstorm SMG",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.3)
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.02,
        y: -0.12,
        z: 0.12
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: -0.08
      };

      model.transformPart("sight", {
        position: { x: 0, y: 0, z: -0.085 }
      });
    })
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Eternal","Packet":{"Comps":{"Length":19,"a":{"c":1,"v":2},"b":{"c":2,"v":106},"c":{"c":3,"v":108},"d":{"c":4,"v":106},"e":{"c":5,"v":52},"f":{"c":6,"v":2},"g":{"c":7,"v":1},"h":{"c":8,"v":19},"i":{"c":9,"v":9},"j":{"c":10,"v":10},"k":{"c":11,"v":10},"l":{"c":12,"v":15},"m":{"c":16,"v":12},"n":{"c":19,"v":9},"o":{"c":21,"v":21},"p":{"c":23,"v":17},"q":{"c":25,"v":2},"r":{"c":42,"v":9}},"MatTrans":{"tDecalA":{"position":{"x":0.05,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.05,"sqrMagnitude":0.00250000018},"scale":0.3},"tDecalB":{"position":{"x":0.1,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.1,"sqrMagnitude":0.0100000007},"scale":0.3},"tPattern":{"angle":-135.0,"scale":0.2}},"publicName":{"data":"Eternal"}}}`), {
  name: "Ethereal SMG",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.3)
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.02,
        y: -0.07,
        z: 0.18
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: -0.08
      };

      model.transformPart("sight", {
        position: { x: 0, y: 0, z: 0.065 }
      });
      model.transformPart("mag", {
        position: { x: 0, y: 0.05, z: -0.01 }
      });
    })
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Splitfire SMG","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":1},"b":{"c":2,"v":109},"c":{"c":3,"v":108},"d":{"c":4,"v":109},"e":{"c":5,"v":55},"f":{"c":6,"v":2},"g":{"c":7,"v":1},"h":{"c":8,"v":15},"i":{"c":9,"v":5},"j":{"c":10,"v":17},"k":{"c":11,"v":17},"l":{"c":12,"v":14},"m":{"c":16,"v":6},"n":{"c":19,"v":5},"o":{"c":21,"v":11},"p":{"c":23,"v":8},"q":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.07,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.07,"sqrMagnitude":0.0049},"angle":45.0,"scale":0.1},"tDecalB":{"position":{"x":0.075,"y":0.003,"normalized":{"x":0.999201059,"y":0.03996804,"normalized":{"x":0.99920094,"y":0.0399680361,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":1.00000012,"sqrMagnitude":1.00000024},"magnitude":0.07505997,"sqrMagnitude":0.005634},"angle":45.0,"scale":0.1},"tPattern":{"position":{"x":0.02,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.02,"sqrMagnitude":0.0004},"angle":200.0,"scale":0.5}},"publicName":{"data":"Splitfire SMG"}}}`), {
  name: "XHM SMG",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.3)
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.02,
        y: -0.09,
        z: 0.18
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: -0.08
      };

      model.transformPart("sight", {
        position: { x: 0, y: 0, z: -0.08 }
      });
    })
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Reaver","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":103},"b":{"c":3,"v":108},"c":{"c":4,"v":103},"d":{"c":5,"v":42},"e":{"c":6,"v":3},"f":{"c":7,"v":2},"g":{"c":8,"v":9},"h":{"c":9,"v":8},"i":{"c":10,"v":10},"j":{"c":11,"v":10},"k":{"c":12,"v":27},"l":{"c":16,"v":8},"m":{"c":19,"v":3},"n":{"c":21,"v":18},"o":{"c":23,"v":3},"p":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.03,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.03,"sqrMagnitude":0.0009},"scale":0.3},"tDecalB":{"position":{"x":0.1,"y":0.02,"normalized":{"x":0.9805806,"y":0.19611612,"normalized":{"x":0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.101980396,"sqrMagnitude":0.010400001},"scale":0.3},"tPattern":{"position":{"x":0.32,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.32,"sqrMagnitude":0.1024},"scale":0.6}},"publicName":{"data":"Reaver"}}}`), {
  name: "Vision Rifle",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.3)
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.02,
        y: -0.09,
        z: 0.18
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: -0.05
      };

      model.transformPart("sight", {
        position: { x: 0, y: 0, z: -0.12 }
      });
    })
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Hexagram","Packet":{"Comps":{"Length":15,"a":{"c":1,"v":2},"b":{"c":2,"v":140},"c":{"c":3,"v":211},"d":{"c":4,"v":7},"e":{"c":5,"v":29},"f":{"c":6,"v":29},"g":{"c":8,"v":19},"h":{"c":9,"v":10},"i":{"c":10,"v":17},"j":{"c":11,"v":17},"k":{"c":12,"v":36},"l":{"c":16,"v":16},"m":{"c":19,"v":14},"n":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.115,"y":-0.02,"normalized":{"x":0.9852118,"y":-0.171341166,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.116726175,"sqrMagnitude":0.0136250006},"angle":45.0,"scale":0.05},"tDecalB":{"position":{"x":0.115,"y":-0.02,"normalized":{"x":0.9852118,"y":-0.171341166,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.116726175,"sqrMagnitude":0.0136250006},"scale":0.06},"tPattern":{"position":{"x":0.07,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.07,"sqrMagnitude":0.0049},"angle":120.0,"scale":0.08}},"publicName":{"data":"Hexagram"}}}`), {
  name: "Glyphic Revolver",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Revolver_Front_1_Reload_1
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.05,
        y: -0.1,
        z: 0.08
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: 0
      };
    })
    return model;
  }
});

// Secondaries
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Rift Welder","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":130},"c":{"c":3,"v":109},"d":{"c":4,"v":130},"e":{"c":5,"v":33},"f":{"c":6,"v":33},"g":{"c":7,"v":3},"h":{"c":8,"v":10},"i":{"c":9,"v":10},"j":{"c":10,"v":13},"k":{"c":11,"v":14},"l":{"c":12,"v":18},"m":{"c":16,"v":8},"n":{"c":19,"v":2},"o":{"c":21,"v":10},"p":{"c":23,"v":14},"q":{"c":25,"v":6}},"MatTrans":{"tDecalA":{"position":{"x":0.1,"y":0.02,"normalized":{"x":0.9805806,"y":0.19611612,"normalized":{"x":0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.101980396,"sqrMagnitude":0.010400001},"angle":180.0,"scale":0.4},"tDecalB":{"position":{"x":-0.07,"y":0.03,"normalized":{"x":-0.919145,"y":0.3939193,"normalized":{"x":-0.919145048,"y":0.393919319,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.0761577338,"sqrMagnitude":0.0058},"angle":-90.0,"scale":0.05},"tPattern":{"angle":-90.0,"scale":0.1}},"publicName":{"data":"Rift Welder"}}}`), {
  name: "Rift Machinegun",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.4)
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.02,
        y: -0.14,
        z: 0.25
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: -0.03
      };

      model.transformPart("sight", {
        position: { x: 0, y: 0, z: -0.12 }
      });
    })
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Overheat","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":131},"c":{"c":3,"v":109},"d":{"c":4,"v":131},"e":{"c":5,"v":39},"f":{"c":6,"v":33},"g":{"c":7,"v":3},"h":{"c":8,"v":10},"i":{"c":9,"v":10},"j":{"c":10,"v":13},"k":{"c":11,"v":14},"l":{"c":12,"v":29},"m":{"c":16,"v":11},"n":{"c":19,"v":3},"o":{"c":21,"v":13},"p":{"c":23,"v":7},"q":{"c":25,"v":6}},"MatTrans":{"tDecalA":{"position":{"x":0.1,"y":0.02,"normalized":{"x":0.9805806,"y":0.19611612,"normalized":{"x":0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.101980396,"sqrMagnitude":0.010400001},"angle":180.0,"scale":0.4},"tDecalB":{"position":{"x":-0.07,"y":0.03,"normalized":{"x":-0.919145,"y":0.3939193,"normalized":{"x":-0.919145048,"y":0.393919319,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.0761577338,"sqrMagnitude":0.0058},"angle":-90.0,"scale":0.05},"tPattern":{"angle":-90.0,"scale":0.1}},"publicName":{"data":"Overheat"}}}`), {
  name: "Heatsink Machinegun",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.4)
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.02,
        y: -0.10,
        z: 0.3
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: -0.05
      };
    })
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Splitfire Cannon","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":1},"b":{"c":2,"v":133},"c":{"c":3,"v":109},"d":{"c":4,"v":133},"e":{"c":5,"v":55},"f":{"c":6,"v":33},"g":{"c":7,"v":3},"h":{"c":8,"v":18},"i":{"c":9,"v":8},"j":{"c":10,"v":27},"k":{"c":11,"v":26},"l":{"c":12,"v":19},"m":{"c":16,"v":8},"n":{"c":19,"v":12},"o":{"c":21,"v":45},"p":{"c":23,"v":6},"q":{"c":25,"v":6}},"MatTrans":{"tDecalA":{"position":{"x":-0.05,"y":0.01,"normalized":{"x":-0.9805806,"y":0.19611612,"normalized":{"x":-0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.0509901978,"sqrMagnitude":0.00260000024},"scale":0.1},"tDecalB":{"position":{"x":-0.05,"y":0.01,"normalized":{"x":-0.9805806,"y":0.19611612,"normalized":{"x":-0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.0509901978,"sqrMagnitude":0.00260000024},"scale":0.1},"tPattern":{"position":{"x":0.17,"y":0.05,"normalized":{"x":0.9593655,"y":0.282166332,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.177200451,"sqrMagnitude":0.0314000025},"angle":-135.0,"scale":0.2}},"publicName":{"data":"Splitfire Cannon"}}}`), {
  name: "XHM Cannon",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.4)
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.02,
        y: -0.08,
        z: 0.22
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: -0.03
      };

      model.transformPart("sight", {
        position: { x: 0, y: 0, z: -0.13 }
      });
      model.transformPart("receiver", {
        position: { x: 0, y: -0.035, z: 0 },
        scale: { x: 1.3, y: 1, z: 2 }
      });
    });
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Leviathan","Packet":{"Comps":{"Length":16,"a":{"c":2,"v":120},"b":{"c":3,"v":110},"c":{"c":4,"v":120},"d":{"c":5,"v":4},"e":{"c":6,"v":4},"f":{"c":7,"v":4},"g":{"c":8,"v":7},"h":{"c":9,"v":1},"i":{"c":10,"v":24},"j":{"c":11,"v":24},"k":{"c":12,"v":22},"l":{"c":16,"v":12},"m":{"c":19,"v":10},"n":{"c":21,"v":40},"o":{"c":25,"v":2}},"MatTrans":{"tDecalA":{"position":{"x":0.11,"y":0.01,"normalized":{"x":0.99589324,"y":0.090535745,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.110453606,"sqrMagnitude":0.0122},"angle":0.07,"scale":0.07},"tDecalB":{"position":{"x":0.105,"y":0.005,"normalized":{"x":0.9988681,"y":0.0475651473,"normalized":{"x":0.998868167,"y":0.04756515,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.105118982,"sqrMagnitude":0.01105},"angle":0.07,"scale":0.07},"tPattern":{"position":{"x":0.25,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.25,"sqrMagnitude":0.0625},"angle":180.0,"scale":0.5}},"publicName":{"data":"Leviathan"}}}`), {
  name: "Dragon Shotgun",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Front_AutoShotgun_2_Parts_Reload,
    offset: new Vector3(0, 0.01, 0.35)
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.02,
        y: -0.08,
        z: 0.3
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: 0.025
      };

      model.transformPart("sight", {
        position: { x: 0, y: 0, z: -0.13 }
      });
    });
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Resolve","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":1},"b":{"c":2,"v":123},"c":{"c":3,"v":110},"d":{"c":4,"v":120},"e":{"c":5,"v":46},"f":{"c":6,"v":4},"g":{"c":7,"v":4},"h":{"c":8,"v":19},"i":{"c":9,"v":10},"j":{"c":10,"v":19},"k":{"c":11,"v":19},"l":{"c":12,"v":29},"m":{"c":16,"v":12},"n":{"c":19,"v":10},"o":{"c":21,"v":40},"p":{"c":25,"v":3},"q":{"c":42,"v":16}},"MatTrans":{"tDecalA":{"position":{"x":0.06,"y":0.005,"normalized":{"x":0.9965458,"y":0.08304548,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.06020797,"sqrMagnitude":0.003625},"scale":0.08},"tDecalB":{"position":{"x":0.07,"y":0.01,"normalized":{"x":0.9899496,"y":0.141421363,"normalized":{"x":0.989949465,"y":0.141421348,"normalized":{"x":0.9899495,"y":0.141421363,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":1.00000012,"sqrMagnitude":1.00000024},"magnitude":0.0707106739,"sqrMagnitude":0.005},"scale":0.08},"tPattern":{"position":{"x":0.06,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.06,"sqrMagnitude":0.0036},"angle":-60.0,"scale":0.3}},"publicName":{"data":"Resolve"}}}`), {
  name: "Ethereal Shotgun",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Front_AutoShotgun_2_Parts_Reload,
    offset: new Vector3(0, 0.01, 0.35)
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.02,
        y: -0.1,
        z: 0.225
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: 0.025
      };

      model.transformPart("sight", {
        position: { x: 0, y: 0, z: -0.13 }
      });
    });
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Beelzebub","Packet":{"Comps":{"Length":17,"a":{"c":1,"v":2},"b":{"c":2,"v":121},"c":{"c":3,"v":110},"d":{"c":4,"v":120},"e":{"c":5,"v":4},"f":{"c":6,"v":4},"g":{"c":7,"v":4},"h":{"c":8,"v":17},"i":{"c":9,"v":5},"j":{"c":10,"v":18},"k":{"c":11,"v":18},"l":{"c":12,"v":20},"m":{"c":16,"v":6},"n":{"c":19,"v":10},"o":{"c":21,"v":42},"p":{"c":25,"v":2}},"MatTrans":{"tDecalA":{"position":{"x":0.51,"y":-0.05,"normalized":{"x":0.9952285,"y":-0.09757143,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.5124451,"sqrMagnitude":0.262599975},"scale":0.3},"tDecalB":{"position":{"x":0.5,"y":-0.07,"normalized":{"x":0.990341663,"y":-0.138647839,"normalized":{"x":0.9903418,"y":-0.138647854,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.9999999,"sqrMagnitude":0.9999998},"magnitude":0.504876256,"sqrMagnitude":0.2549},"scale":0.3},"tPattern":{"angle":-90.0,"scale":0.3}},"publicName":{"data":"Beelzebub"}}}`), {
  name: "Demon Shotgun",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Front_AutoShotgun_2_Parts_Reload,
    offset: new Vector3(0, 0.01, 0.35)
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.07,
        y: -0.1,
        z: 0.25
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: 0.025
      };

      model.transformPart("sight", {
        position: { x: 0, y: 0, z: -0.1 }
      });
    });
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Behemoth","Packet":{"Comps":{"Length":16,"a":{"c":2,"v":122},"b":{"c":3,"v":110},"c":{"c":4,"v":120},"d":{"c":5,"v":46},"e":{"c":6,"v":4},"f":{"c":7,"v":4},"g":{"c":8,"v":19},"h":{"c":9,"v":10},"i":{"c":10,"v":19},"j":{"c":11,"v":19},"k":{"c":12,"v":27},"l":{"c":16,"v":1},"m":{"c":19,"v":8},"n":{"c":21,"v":43},"o":{"c":25,"v":3}},"MatTrans":{"tDecalA":{"position":{"x":0.06,"y":0.005,"normalized":{"x":0.9965458,"y":0.08304548,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.06020797,"sqrMagnitude":0.003625},"scale":0.08},"tDecalB":{"position":{"x":0.07,"y":0.01,"normalized":{"x":0.9899496,"y":0.141421363,"normalized":{"x":0.989949465,"y":0.141421348,"normalized":{"x":0.9899495,"y":0.141421363,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":1.00000012,"sqrMagnitude":1.00000024},"magnitude":0.0707106739,"sqrMagnitude":0.005},"scale":0.08},"tPattern":{"position":{"x":0.06,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.06,"sqrMagnitude":0.0036},"angle":-60.0,"scale":0.3}},"publicName":{"data":"Behemoth"}}}`), {
  name: "Purge Shotgun",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Front_AutoShotgun_2_Parts_Reload,
    offset: new Vector3(0, 0.01, 0.35)
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.02,
        y: -0.1,
        z: 0.225
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: -0.05
      };

      model.transformPart("sight", {
        position: { x: 0, y: 0, z: -0.09 }
      });
    });
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Ionizer","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":124},"b":{"c":3,"v":109},"c":{"c":4,"v":124},"d":{"c":5,"v":36},"e":{"c":6,"v":36},"f":{"c":7,"v":5},"g":{"c":8,"v":18},"h":{"c":9,"v":10},"i":{"c":10,"v":27},"j":{"c":11,"v":15},"k":{"c":12,"v":29},"l":{"c":16,"v":8},"m":{"c":19,"v":2},"n":{"c":21,"v":19},"o":{"c":23,"v":13},"p":{"c":25,"v":4}},"MatTrans":{"tDecalA":{"position":{"x":0.04,"y":0.04,"normalized":{"x":0.707106769,"y":0.707106769,"normalized":{"x":0.7071068,"y":0.7071068,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.05656854,"sqrMagnitude":0.0032},"scale":0.08},"tDecalB":{"position":{"x":0.48,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.48,"sqrMagnitude":0.2304},"scale":0.3},"tPattern":{"position":{"y":0.04,"normalized":{"y":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.04,"sqrMagnitude":0.0016},"angle":-90.0,"scale":0.2}},"publicName":{"data":"Ionizer"}}}`), {
  name: "Void Sniper",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.45)
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.02,
        y: -0.1,
        z: 0.3
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: -0.03
      };

      model.transformPart("sight", {
        position: { x: 0, y: 0, z: -0.12 }
      });
    });
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Division","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":125},"b":{"c":3,"v":109},"c":{"c":4,"v":125},"d":{"c":5,"v":36},"e":{"c":6,"v":36},"f":{"c":7,"v":5},"g":{"c":8,"v":18},"h":{"c":9,"v":10},"i":{"c":10,"v":27},"j":{"c":11,"v":15},"k":{"c":12,"v":19},"l":{"c":16,"v":12},"m":{"c":19,"v":9},"n":{"c":21,"v":9},"o":{"c":23,"v":8},"p":{"c":25,"v":4}},"MatTrans":{"tDecalA":{"position":{"x":0.04,"y":0.04,"normalized":{"x":0.707106769,"y":0.707106769,"normalized":{"x":0.7071068,"y":0.7071068,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.05656854,"sqrMagnitude":0.0032},"scale":0.08},"tDecalB":{"position":{"x":0.48,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.48,"sqrMagnitude":0.2304},"scale":0.3},"tPattern":{"position":{"y":0.04,"normalized":{"y":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.04,"sqrMagnitude":0.0016},"angle":-90.0,"scale":0.2}},"publicName":{"data":"Division"}}}`), {
  name: "Vision Sniper",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.4)
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.02,
        y: -0.08,
        z: 0.225
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: -0.09
      };

      model.transformPart("sight", {
        position: { x: 0, y: 0, z: -0.1 }
      });
      model.transformPart("mag", {
        position: { x: 0, y: 0, z: -0.05 }
      });
    });
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"World Splitter","Packet":{"Comps":{"Length":17,"a":{"c":2,"v":127},"b":{"c":3,"v":110},"c":{"c":4,"v":5},"d":{"c":5,"v":36},"e":{"c":6,"v":36},"f":{"c":7,"v":5},"g":{"c":8,"v":18},"h":{"c":9,"v":10},"i":{"c":10,"v":27},"j":{"c":11,"v":15},"k":{"c":12,"v":29},"l":{"c":16,"v":11},"m":{"c":19,"v":1},"n":{"c":21,"v":24},"o":{"c":23,"v":16},"p":{"c":25,"v":4}},"MatTrans":{"tDecalA":{"position":{"x":0.04,"y":0.04,"normalized":{"x":0.707106769,"y":0.707106769,"normalized":{"x":0.7071068,"y":0.7071068,"magnitude":1.0,"sqrMagnitude":1.00000012},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.05656854,"sqrMagnitude":0.0032},"scale":0.08},"tDecalB":{"position":{"x":0.48,"normalized":{"x":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.48,"sqrMagnitude":0.2304},"scale":0.3},"tPattern":{"position":{"y":0.04,"normalized":{"y":1.0,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.04,"sqrMagnitude":0.0016},"angle":-90.0,"scale":0.2}},"publicName":{"data":"World Splitter"}}}`), {
  name: "Soul Sniper",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.45)
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.02,
        y: -0.1,
        z: 0.3
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: -0.035
      };

      model.transformPart("sight", {
        position: { x: 0, y: 0, z: -0.1 }
      });
      model.transformPart("mag", {
        position: { x: 0, y: 0, z: -0.05 }
      });
    });
    return model;
  }
});
GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Maelstrom","Packet":{"Comps":{"Length":18,"a":{"c":1,"v":2},"b":{"c":2,"v":139},"c":{"c":3,"v":212},"d":{"c":4,"v":131},"e":{"c":5,"v":39},"f":{"c":6,"v":33},"g":{"c":7,"v":3},"h":{"c":8,"v":10},"i":{"c":9,"v":10},"j":{"c":10,"v":13},"k":{"c":11,"v":14},"l":{"c":12,"v":18},"m":{"c":16,"v":14},"n":{"c":19,"v":2},"o":{"c":21,"v":5},"p":{"c":23,"v":7},"q":{"c":25,"v":4}},"MatTrans":{"tDecalA":{"position":{"x":0.1,"y":0.02,"normalized":{"x":0.9805806,"y":0.19611612,"normalized":{"x":0.9805807,"y":0.196116135,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.9999999},"magnitude":0.101980396,"sqrMagnitude":0.010400001},"angle":180.0,"scale":0.4},"tDecalB":{"position":{"x":-0.07,"y":0.03,"normalized":{"x":-0.919145,"y":0.3939193,"normalized":{"x":-0.919145048,"y":0.393919319,"magnitude":1.0,"sqrMagnitude":1.0},"magnitude":0.99999994,"sqrMagnitude":0.99999994},"magnitude":0.0761577338,"sqrMagnitude":0.0058},"angle":-90.0,"scale":0.05},"tPattern":{"angle":-90.0,"scale":0.1}},"publicName":{"data":"Maelstrom"}}}`), {
  name: "Wildfire Machinegun",
  type: "rifle",
  gunArchetype: {
    gunFoldAnim: GearAnimDatablock.Stock_Pistol_1_reload_1,
    offset: new Vector3(0, 0, 0.45)
  },
  model: gearJSON => {
    const model = new GearBuilder(gearJSON, (model) => {
      model.leftHandGrip = {
        x: 0.02,
        y: -0.15,
        z: 0.2
      };
      model.equipOffsetPos = {
        x: 0,
        y: 0.05,
        z: -0.01
      };
    });
    return model;
  }
});

GearDatablock.set(Identifier.create("Gear", undefined, `{"Ver":1,"Name":"Hacking Tool","Packet":{"Comps":{"Length":5,"a":{"c":2,"v":15},"b":{"c":3,"v":53},"c":{"c":4,"v":17},"d":{"c":5,"v":28}},"MatTrans":{"tDecalA":{"scale":0.1},"tDecalB":{"scale":0.1},"tPattern":{"scale":0.1}},"publicName":{"data":"Hacking Tool"}}}`), {
  name: "Hacking Tool",
  type: "rifle",
  model: () => new HackingTool()
});