const { ItemDatablock } = await require("@asl/vanilla/datablocks/items/item.js", "asl");
const { PlayerAnimDatablock } = await require("@asl/vanilla/datablocks/player/animation.js", "asl");
const { Identifier } = await require("@asl/vanilla/parser/identifier.js", "asl");
const { ItemGLTFModel } = await require("@asl/vanilla/renderer/models/prebuilt/itemGLTF.js", "asl");
const { Keycard } = await require("@asl/vanilla/renderer/models/prebuilt/keycard.js", "asl");
const { Pack } = await require("@asl/vanilla/renderer/models/prebuilt/pack.js", "asl");
ItemDatablock.clear();
ItemDatablock.set(Identifier.create("Item", 102), {
  type: "consumable",
  serial: "MEDIPACK",
  model: () => new Pack(0xff0000)
});
ItemDatablock.set(Identifier.create("Item", 101), {
  type: "consumable",
  serial: "AMMOPACK",
  model: () => new Pack(0x00ff00)
});
ItemDatablock.set(Identifier.create("Item", 127), {
  type: "consumable",
  serial: "TOOL_REFILL",
  model: () => new Pack(0x0000ff)
});
ItemDatablock.set(Identifier.create("Item", 132), {
  type: "consumable",
  serial: "DISINFECT_PACK",
  model: () => new Pack(0x7b9fe8)
});
const GlowSticks = {
  type: "consumable",
  name: "Glow Sticks",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Consumables/glowstick.glb", () => {
      model.gltf.rotation.set(90 * Math.deg2rad, 0, -90 * Math.deg2rad);
      model.gltf.position.set(0, 0.1, 0);
    }, false);
    model.gltf.scale.set(0.02, 0.02, 0.02);
    model.equipOffsetPos = {
      x: 0,
      y: 0,
      z: 0
    };
    model.leftHand = undefined;
    return model;
  }
};
ItemDatablock.set(Identifier.create("Item", 114), GlowSticks); // default ones
ItemDatablock.set(Identifier.create("Item", 200), { ...GlowSticks, name: "Teal Glow Sticks" });
ItemDatablock.set(Identifier.create("Item", 201), { ...GlowSticks, name: "White Glow Sticks" });
ItemDatablock.set(Identifier.create("Item", 202), { ...GlowSticks, name: "Blue Glow Sticks" });
ItemDatablock.set(Identifier.create("Item", 203), { ...GlowSticks, name: "Yellow Glow Sticks" });
ItemDatablock.set(Identifier.create("Item", 204), { ...GlowSticks, name: "Pink Glow Sticks" });
ItemDatablock.set(Identifier.create("Item", 205), { ...GlowSticks, name: "Red Glow Sticks" });
ItemDatablock.set(Identifier.create("Item", 206), { ...GlowSticks, name: "Green Glow Sticks" });
ItemDatablock.set(Identifier.create("Item", 207), { ...GlowSticks, name: "Throwable Sun" });
ItemDatablock.set(Identifier.create("Item", 208), { ...GlowSticks, name: "Throwable Void" });
ItemDatablock.set(Identifier.create("Item", 209), { ...GlowSticks, name: "Absolution" });
ItemDatablock.set(Identifier.create("Item", 210), { ...GlowSticks, name: "Retribution" });
ItemDatablock.set(Identifier.create("Item", 30), {
  type: "consumable",
  name: "Long Range Flashlight",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Consumables/long range flashlight.glb", () => {
      model.gltf.scale.set(0.07, 0.07, 0.07);
      model.gltf.rotation.set(0, 90 * Math.deg2rad, 0);
      model.gltf.position.set(0, 0.1, 0);
    }, false);
    model.gltf.scale.set(0.1, 0.1, 0.1);
    model.gltf.rotateX(Math.PI);
    model.equipOffsetPos = {
      x: 0.07,
      y: 0,
      z: -0.15
    };
    model.leftHandGrip = {
      x: 0.2,
      y: 0,
      z: 0
    };
    model.offsetRot = {
      x: 0.707106829,
      y: 0,
      z: 0,
      w: 0.707106829
    };
    return model;
  }
});
const syringeModel = color => {
  return () => {
    const model = new ItemGLTFModel("../js3party/models/Consumables/syringe.glb", () => {
      model.gltf.scale.set(0.08, 0.08, 0.08);
      model.gltf.rotation.set(0, 90 * Math.deg2rad, 90 * Math.deg2rad);
      model.gltf.position.set(0.05, 0.04, 0);
    }, false);
    model.gltf.scale.set(0.1, 0.1, 0.1);
    model.gltf.rotateX(-90 * Math.deg2rad);
    model.material.color.set(color);
    model.equipOffsetPos = {
      x: 0,
      y: 0.1,
      z: -0.05
    };
    model.leftHandGrip = {
      x: 0.05,
      y: -0.1,
      z: 0
    };
    return model;
  };
};
ItemDatablock.set(Identifier.create("Item", 140), {
  type: "consumable",
  name: "I2-LP Syringe",
  model: syringeModel(0xff4444)
});
ItemDatablock.set(Identifier.create("Item", 142), {
  type: "consumable",
  name: "IIX Syringe",
  model: syringeModel(0xffff00)
});
ItemDatablock.set(Identifier.create("Item", 231), {
  type: "consumable",
  name: "REC Syringe",
  model: syringeModel(0xff9090)
});
ItemDatablock.set(Identifier.create("Item", 241), {
  type: "consumable",
  name: "REC_II Syringe",
  model: syringeModel(0xffa0a0)
});
ItemDatablock.set(Identifier.create("Item", 227), {
  type: "consumable",
  name: "IV-LP Syringe",
  model: syringeModel(0xffa0a0)
});
ItemDatablock.set(Identifier.create("Item", 224), {
  type: "consumable",
  name: "SPD Syringe",
  model: syringeModel(0x00cc00)
});
ItemDatablock.set(Identifier.create("Item", 225), {
  type: "consumable",
  name: "ADR Syringe",
  model: syringeModel(0x8080ff)
});
ItemDatablock.set(Identifier.create("Item", 228), {
  type: "consumable",
  name: "Virus Syringe",
  model: syringeModel(0x800000)
});
ItemDatablock.set(Identifier.create("Item", 232), {
  type: "consumable",
  name: "RGE Syringe",
  model: syringeModel(0x800000)
});
ItemDatablock.set(Identifier.create("Item", 234), {
  type: "consumable",
  name: "Hallowed Virus Syringe",
  model: syringeModel(0x800000)
});
ItemDatablock.set(Identifier.create("Item", 229), {
  type: "consumable",
  name: "Antibiotic Syringe",
  model: syringeModel(0xffffff)
});
ItemDatablock.set(Identifier.create("Item", 115), {
  type: "consumable",
  name: "Cfoam Grenade",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Consumables/cnade.glb", () => {
      model.gltf.rotation.set(0, 0, 90 * Math.deg2rad);
      model.gltf.position.set(0, 0.1, 0);
    }, false);
    model.gltf.scale.set(0.05, 0.05, 0.05);
    model.leftHand = undefined;
    model.equipOffsetPos = {
      x: 0,
      y: 0,
      z: 0
    };
    return model;
  }
});
ItemDatablock.set(Identifier.create("Item", 214), {
  type: "consumable",
  name: "Cfoam Grenade",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Consumables/cnade.glb", () => {
      model.gltf.rotation.set(0, 0, 90 * Math.deg2rad);
      model.gltf.position.set(0, 0.1, 0);
    }, false);
    model.gltf.scale.set(0.05, 0.05, 0.05);
    model.leftHand = undefined;
    model.equipOffsetPos = {
      x: 0,
      y: 0,
      z: 0
    };
    return model;
  }
});
ItemDatablock.set(Identifier.create("Item", 116), {
  type: "consumable",
  name: "Lock Melter",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Consumables/lock melter.glb", () => {
      model.gltf.position.set(0, 0.05, 0);
      model.gltf.rotation.set(0, 0, 90 * Math.deg2rad);
    }, false);
    model.gltf.scale.set(0.04, 0.04, 0.04);
    model.equipOffsetPos = {
      x: 0.1,
      y: 0,
      z: 0
    };
    model.leftHandGrip = {
      x: 0.1,
      y: 0,
      z: 0
    };
    return model;
  }
});
ItemDatablock.set(Identifier.create("Item", 117), {
  type: "consumable",
  name: "Fog Repeller",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Consumables/fog rep.glb", () => {
      model.gltf.position.set(0, 0.05, 0);
    }, false);
    model.gltf.scale.set(0.07, 0.07, 0.07);
    model.gltf.rotateY(90 * Math.deg2rad);
    model.equipOffsetPos = {
      x: 0.07,
      y: 0,
      z: 0
    };
    model.leftHandGrip = {
      x: 0.1,
      y: 0,
      z: -0.1
    };
    return model;
  },
  archetype: {
    equipAnim: PlayerAnimDatablock.Fogrepeller_Throw_Equip,
    throwAnim: PlayerAnimDatablock.Fogrepeller_Throw,
    chargeAnim: PlayerAnimDatablock.Fogrepeller_Throw_Charge,
    chargeIdleAnim: PlayerAnimDatablock.Fogrepeller_Throw_Charge_Idle
  }
});
ItemDatablock.set(Identifier.create("Item", 239), {
  type: "consumable",
  name: "Fog Repeller",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Consumables/fog rep.glb", () => {
      model.gltf.position.set(0, 0.05, 0);
    }, false);
    model.gltf.scale.set(0.07, 0.07, 0.07);
    model.gltf.rotateY(90 * Math.deg2rad);
    model.equipOffsetPos = {
      x: 0.07,
      y: 0,
      z: 0
    };
    model.leftHandGrip = {
      x: 0.1,
      y: 0,
      z: -0.1
    };
    return model;
  },
  archetype: {
    equipAnim: PlayerAnimDatablock.Fogrepeller_Throw_Equip,
    throwAnim: PlayerAnimDatablock.Fogrepeller_Throw,
    chargeAnim: PlayerAnimDatablock.Fogrepeller_Throw_Charge,
    chargeIdleAnim: PlayerAnimDatablock.Fogrepeller_Throw_Charge_Idle
  }
});
ItemDatablock.set(Identifier.create("Item", 139), {
  type: "consumable",
  name: "Explosive Tripmine",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Consumables/emine.glb", () => {
      model.gltf.position.set(0, 0.05, 0);
    }, false);
    model.gltf.scale.set(0.05, 0.05, 0.05);
    model.equipOffsetPos = {
      x: 0.07,
      y: 0,
      z: 0
    };
    model.leftHandGrip = {
      x: 0.1,
      y: 0,
      z: -0.1
    };
    return model;
  }
});
ItemDatablock.set(Identifier.create("Item", 219), {
  type: "consumable",
  name: "Explosive Tripmine Bundle",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Consumables/emine.glb", () => {
      model.gltf.position.set(0, 0.05, 0);
    }, false);
    model.gltf.scale.set(0.05, 0.05, 0.05);
    model.equipOffsetPos = {
      x: 0.07,
      y: 0,
      z: 0
    };
    model.leftHandGrip = {
      x: 0.1,
      y: 0,
      z: -0.1
    };
    return model;
  }
});
ItemDatablock.set(Identifier.create("Item", 144), {
  type: "consumable",
  name: "Cfoam Tripmine",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Consumables/ctrip.glb", () => {
      model.gltf.position.set(0, 0.05, 0);
    }, false);
    model.gltf.scale.set(0.05, 0.05, 0.05);
    model.equipOffsetPos = {
      x: 0.07,
      y: 0,
      z: 0
    };
    model.leftHandGrip = {
      x: 0.1,
      y: 0,
      z: -0.1
    };
    return model;
  }
});
ItemDatablock.set(Identifier.create("Item", 131), {
  type: "rifle",
  name: "Power Cell",
  serial: "CELL",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/BigPickups/cell.glb", () => {
      model.gltf.rotation.set(-90 * Math.deg2rad, 0, 90 * Math.deg2rad);
      model.gltf.scale.set(0.07, 0.07, 0.07);
    }, false);
    model.gltf.scale.set(0.04, 0.04, 0.04);
    model.gltf.rotateZ(Math.PI);
    model.equipOffsetPos = {
      x: 0,
      y: -0.17,
      z: -0.02
    };
    model.leftHandGrip = {
      x: 0.1,
      y: -0.2,
      z: 0
    };
    return model;
  }
});
ItemDatablock.set(Identifier.create("Item", 133), {
  type: "rifle",
  name: "Fog Turbine",
  serial: "FOG_TURBINE",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/BigPickups/fog turbine.glb", undefined, false);
    model.gltf.scale.set(0.2, 0.2, 0.2);
    model.gltf.rotation.set(0, 0, 0, "YXZ");
    model.equipOffsetPos = {
      x: 0.1,
      y: 0,
      z: 0
    };
    model.leftHandGrip = {
      x: 0.2,
      y: 0,
      z: 0.1
    };
    return model;
  }
});
const Neonate = {
  type: "rifle",
  name: "Neonate",
  serial: "NEONATE",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/BigPickups/neonate.glb", undefined, false);
    model.gltf.scale.set(0.1, 0.1, 0.1);
    model.gltf.rotation.set(-90 * Math.deg2rad, 180 * Math.deg2rad, -40 * Math.deg2rad);
    model.equipOffsetPos = {
      x: 0.1,
      y: -0.1,
      z: 0
    };
    model.leftHandGrip = {
      x: 0.1,
      y: -0.1,
      z: 0.1
    };
    return model;
  }
};
ItemDatablock.set(Identifier.create("Item", 137), Neonate);
ItemDatablock.set(Identifier.create("Item", 141), Neonate);
ItemDatablock.set(Identifier.create("Item", 143), Neonate);
ItemDatablock.set(Identifier.create("Item", 170), Neonate);
ItemDatablock.set(Identifier.create("Item", 145), Neonate);
ItemDatablock.set(Identifier.create("Item", 175), Neonate);
ItemDatablock.set(Identifier.create("Item", 177), Neonate);
const MatterWaveProjector = {
  type: "rifle",
  name: "Matter Wave Projector",
  serial: "MATTER_WAVE_PROJECTOR",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/BigPickups/matter wave projector.glb", undefined, false);
    model.gltf.scale.set(0.1, 0.1, 0.1);
    model.gltf.rotateZ(Math.PI);
    model.equipOffsetPos = {
      x: 0,
      y: -0.17,
      z: -0.02
    };
    model.leftHandGrip = {
      x: 0.1,
      y: -0.2,
      z: 0
    };
    return model;
  }
};
ItemDatablock.set(Identifier.create("Item", 164), MatterWaveProjector);
ItemDatablock.set(Identifier.create("Item", 166), MatterWaveProjector);
const DataSphere = {
  type: "rifle",
  name: "Data Sphere",
  serial: "DATA_SPHERE",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/BigPickups/data sphere.glb", undefined, false);
    model.gltf.scale.set(0.13, 0.13, 0.13);
    model.gltf.rotation.set(0, 0, 0, "YXZ");
    model.equipOffsetPos = {
      x: 0.1,
      y: 0,
      z: 0
    };
    model.leftHandGrip = {
      x: 0.2,
      y: 0,
      z: 0.1
    };
    return model;
  }
};
ItemDatablock.set(Identifier.create("Item", 151), DataSphere);
ItemDatablock.set(Identifier.create("Item", 222), { ...DataSphere, name: "Purple Data Sphere", serial: "PURPLE_DATA_SPHERE" });
ItemDatablock.set(Identifier.create("Item", 235), { ...DataSphere, name: "Corroding Sphere", serial: "CORRODING_SPHERE" });
ItemDatablock.set(Identifier.create("Item", 240), { ...DataSphere, name: "Empty Data Sphere", serial: "EMPTY_DATA_SPHERE" });
const CargoCrate = {
  type: "rifle",
  name: "Cargo Crate",
  serial: "CARGO",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/BigPickups/base cargo.glb", undefined, false);
    model.gltf.scale.set(0.1, 0.1, 0.1);
    model.gltf.rotateZ(Math.PI);
    model.gltf.rotateY(40 * Math.deg2rad);
    model.equipOffsetPos = {
      x: 0.1,
      y: -0.1,
      z: 0
    };
    model.leftHandGrip = {
      x: 0.1,
      y: -0.1,
      z: 0.1
    };
    return model;
  }
};
ItemDatablock.set(Identifier.create("Item", 138), CargoCrate);
ItemDatablock.set(Identifier.create("Item", 176), CargoCrate);
const HisecCargoCrate = {
  type: "rifle",
  name: "Hisec Cargo Crate",
  serial: "CARGO",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/BigPickups/hisec cargo.glb", undefined, false);
    model.gltf.scale.set(0.1, 0.1, 0.1);
    model.gltf.rotateZ(Math.PI);
    model.gltf.rotateY(40 * Math.deg2rad);
    model.equipOffsetPos = {
      x: 0.1,
      y: -0.1,
      z: 0
    };
    model.leftHandGrip = {
      x: 0.1,
      y: -0.1,
      z: 0.1
    };
    return model;
  }
};
ItemDatablock.set(Identifier.create("Item", 154), HisecCargoCrate);
ItemDatablock.set(Identifier.create("Item", 155), HisecCargoCrate);
ItemDatablock.set(Identifier.create("Item", 148), {
  type: "rifle",
  name: "Cryo",
  serial: "CRYO",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/BigPickups/cryo.glb", undefined, false);
    model.gltf.scale.set(0.1, 0.1, 0.1);
    model.gltf.rotateY(130 * Math.deg2rad);
    model.equipOffsetPos = {
      x: 0.1,
      y: -0.1,
      z: 0
    };
    model.leftHandGrip = {
      x: 0.1,
      y: -0.1,
      z: 0.1
    };
    return model;
  }
});
ItemDatablock.set(Identifier.create("Item", 173), {
  type: "rifle",
  name: "Collection Case",
  serial: "COLLECTION_CASE",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/BigPickups/collection case.glb", undefined, false);
    model.gltf.scale.set(0.15, 0.15, 0.15);
    model.gltf.rotateY(130 * Math.deg2rad);
    model.equipOffsetPos = {
      x: 0.1,
      y: -0.1,
      z: 0
    };
    model.leftHandGrip = {
      x: 0.1,
      y: -0.1,
      z: 0.1
    };
    return model;
  }
});
const DataCube = {
  type: "rifle",
  name: "Data Cube",
  serial: "DATA_CUBE",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Objective/data cube.glb", undefined, false);
    model.gltf.scale.set(0.03, 0.03, 0.03);
    model.equipOffsetPos = {
      x: 0.1,
      y: 0,
      z: 0
    };
    model.leftHandGrip = {
      x: 0.1,
      y: 0,
      z: 0
    };
    return model;
  }
};
ItemDatablock.set(Identifier.create("Item", 168), DataCube);
ItemDatablock.set(Identifier.create("Item", 165), DataCube);
ItemDatablock.set(Identifier.create("Item", 179), DataCube);
ItemDatablock.set(Identifier.create("Item", 178), DataCube);
ItemDatablock.set(Identifier.create("Item", 146), {
  type: "rifle",
  name: "Bulkhead Key",
  serial: "BULKHEAD_KEY",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Objective/bulkhead_key.glb", () => {
      model.gltf.position.set(0, 0.05, 0);
      model.gltf.rotation.set(-90 * Math.deg2rad, 0, 0);
    }, false);
    model.gltf.scale.set(0.3, 0.3, 0.3);
    return model;
  }
});
ItemDatablock.set(Identifier.create("Item", 27), {
  type: "rifle",
  name: "Key Red",
  serial: "KEY_RED",
  model: () => new Keycard(0xff0000)
});
ItemDatablock.set(Identifier.create("Item", 85), {
  type: "rifle",
  name: "Key Blue",
  serial: "KEY_BLUE",
  model: () => new Keycard(0x0000ff)
});
ItemDatablock.set(Identifier.create("Item", 86), {
  type: "rifle",
  name: "Key Green",
  serial: "KEY_GREEN",
  model: () => new Keycard(0x00ff00)
});
ItemDatablock.set(Identifier.create("Item", 87), {
  type: "rifle",
  name: "Key Yellow",
  serial: "KEY_YELLOW",
  model: () => new Keycard(0xffff00)
});
ItemDatablock.set(Identifier.create("Item", 88), {
  type: "rifle",
  name: "Key White",
  serial: "KEY_WHITE",
  model: () => new Keycard(0xffffff)
});
ItemDatablock.set(Identifier.create("Item", 89), {
  type: "rifle",
  name: "Key Black",
  serial: "KEY_BLACK",
  model: () => new Keycard(0x444444)
});
ItemDatablock.set(Identifier.create("Item", 90), {
  type: "rifle",
  name: "Key Grey",
  serial: "KEY_GREY",
  model: () => new Keycard(0xaaaaaa)
});
ItemDatablock.set(Identifier.create("Item", 91), {
  type: "rifle",
  name: "Key Orange",
  serial: "KEY_ORANGE",
  model: () => new Keycard(0xff8800)
});
ItemDatablock.set(Identifier.create("Item", 92), {
  type: "rifle",
  name: "Key Purple",
  serial: "KEY_PURPLE",
  model: () => new Keycard(0xb300ff)
});
ItemDatablock.set(Identifier.create("Item", 128), {
  type: "rifle",
  name: "Personnel Id",
  serial: "PID",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Objective/id.glb", () => {
      model.gltf.position.set(0, 0.01, 0);
      model.gltf.rotation.set(0, 0, 90 * Math.deg2rad);
    }, false);
    model.gltf.scale.set(0.05, 0.05, 0.05);
    return model;
  }
});
ItemDatablock.set(Identifier.create("Item", 129), {
  type: "rifle",
  name: "Partial Decoder",
  serial: "PD",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Objective/pdec.glb", () => {
      model.gltf.position.set(0, 0.1, 0);
    }, false);
    model.gltf.scale.set(0.05, 0.05, 0.05);
    return model;
  }
});
const HardDrive = {
  type: "rifle",
  name: "Hard Drive",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Objective/hdd.glb", () => {
      model.gltf.position.set(0, 0.05, 0);
      model.gltf.rotation.set(0, 0, -90 * Math.deg2rad);
    }, false);
    model.gltf.scale.set(0.05, 0.05, 0.05);
    return model;
  }
};
ItemDatablock.set(Identifier.create("Item", 147), HardDrive);
ItemDatablock.set(Identifier.create("Item", 180), HardDrive);
ItemDatablock.set(Identifier.create("Item", 183), HardDrive);
ItemDatablock.set(Identifier.create("Item", 149), {
  type: "rifle",
  name: "GLP 1",
  serial: "GLP",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Objective/glp1.glb", () => {
      model.gltf.position.set(0, 0.1, 0);
      model.gltf.rotation.set(0, 0, 0);
    }, false);
    model.gltf.scale.set(0.05, 0.05, 0.05);
    return model;
  }
});
ItemDatablock.set(Identifier.create("Item", 169), {
  type: "rifle",
  name: "GLP 2",
  serial: "GLP",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Objective/glp2.glb", () => {
      model.gltf.position.set(0, 0.05, 0);
      model.gltf.rotation.set(90 * Math.deg2rad, 0, 0);
    }, false);
    model.gltf.scale.set(0.05, 0.05, 0.05);
    return model;
  }
});
ItemDatablock.set(Identifier.create("Item", 150), {
  type: "rifle",
  name: "OSIP",
  serial: "OSIP",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Objective/osip.glb", () => {
      model.gltf.position.set(0, 0.2, 0);
    }, false);
    model.gltf.scale.set(0.05, 0.05, 0.05);
    return model;
  }
});
ItemDatablock.set(Identifier.create("Item", 153), {
  type: "rifle",
  name: "Plant Sample",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Objective/plant.glb", () => {
      model.gltf.position.set(0, 0.1, 0);
      model.gltf.rotation.set(0, 0, 90 * Math.deg2rad);
    }, false);
    model.gltf.scale.set(0.05, 0.05, 0.05);
    return model;
  }
});
const MemoryStick = {
  type: "rifle",
  name: "Memory Stick",
  model: () => {
    const model = new ItemGLTFModel("../js3party/models/Objective/mem stick.glb", () => {
      model.gltf.position.set(0, 0.1, 0);
      model.gltf.rotation.set(0, 0, 90 * Math.deg2rad);
    }, false);
    model.gltf.scale.set(0.05, 0.05, 0.05);
    return model;
  }
};
ItemDatablock.set(Identifier.create("Item", 171), MemoryStick);
ItemDatablock.set(Identifier.create("Item", 172), MemoryStick);