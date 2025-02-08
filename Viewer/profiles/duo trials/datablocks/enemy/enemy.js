const { EnemyDatablock } = await require("../../../vanilla/datablocks/enemy/enemy.js", "asl");
const { Identifier } = await require("../../../vanilla/parser/identifier.js", "asl");
const { BigFlyerModel } = await require("../../../vanilla/renderer/enemy/models/bigflyer.js", "asl");
const { FlyerModel } = await require("../../../vanilla/renderer/enemy/models/flyer.js", "asl");
const { HumanoidEnemyModel } = await require("../../../vanilla/renderer/enemy/models/humanoid.js", "asl");
const { SquidModel } = await require("../../../vanilla/renderer/enemy/models/squid.js", "asl");
const { BloodMassModel } = await require("../../bloodymass.js", "asl");
EnemyDatablock.clear();

EnemyDatablock.set(Identifier.create("Enemy", 0), {
  name: "Unknown",
  maxHealth: Infinity,

  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale
    });
    return model;
  }
});

const shooterScale = 0.8;

EnemyDatablock.set(Identifier.create("Enemy", 10), {
  name: "Baby Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: {
        x: 2.0,
        y: 2.0,
        z: 2.0
      },
      chestScale: {
        x: 1.3,
        y: 1.3,
        z: 1.3
      },
      armScale: {
        x: 1.0,
        y: 0.8,
        z: 0.8
      },
      legScale: {
        x: 1.0,
        y: 0.8,
        z: 0.8
      }
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 11), {
  name: "Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 14), {
  name: "Elite Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      chestScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 16), {
  name: "Infested Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      chestScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      color: 0xff8080
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 24), {
  name: "Brawler",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      chestScale: {
        x: 1.0,
        y: 1.2375,
        z: 1.0
      },
      armScale: {
        x: 1.1,
        y: 1.3,
        z: 1.1
      },
      legScale: {
        x: 0.8,
        y: 1.3,
        z: 1.05
      },
      color: 0xff5733
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 26), {
  name: "Giant Brawler",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      chestScale: {
        x: 1.25,
        y: 1.25,
        z: 1.25
      },
      armScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      legScale: {
        x: 0.8,
        y: 1.3,
        z: 1.05
      },
      color: 0xff5733
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 51), {
  name: "Frank",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: {
        x: 0.65,
        y: 0.65,
        z: 0.65
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 53), {
  name: "Elite Frank",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: {
        x: 0.65,
        y: 0.65,
        z: 0.65
      },
      chestScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      legScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      }
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 58), {
  name: "Shooter",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: {
        x: 1.25,
        y: 1.0,
        z: 1.0
      },
      parts: {
        head: {
          type: "Shooter"
        }
      }
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 66), {
  name: "Melee Shooter",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: {
        x: 1.2,
        y: 1.0,
        z: 1.0
      },
      chestScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      parts: {
        head: {
          type: "Shooter"
        }
      }
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 68), {
  name: "Surge Shooter",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: {
        x: 1.2,
        y: 1.0,
        z: 1.0
      },
      chestScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      parts: {
        head: {
          type: "Shooter"
        }
      }
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 71), {
  name: "Elite Shooter",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: {
        x: 1.25,
        y: 1.0,
        z: 1.0
      },
      parts: {
        head: {
          type: "Shooter"
        }
      }
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 73), {
  name: "Infested Shooter",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: {
        x: 1.25,
        y: 1.0,
        z: 1.0
      },
      parts: {
        head: {
          type: "Shooter"
        }
      },
      color: 0xff8080
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 174), {
  name: "Withered Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      chestScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      color: 0xa00000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 176), {
  name: "Withered Frank",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: {
        x: 0.65,
        y: 0.65,
        z: 0.65
      },
      chestScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      legScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      color: 0xa00000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 183), {
  name: "Withered Charger",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      neckScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      armScale: {
        x: 1.2,
        y: 1.3,
        z: 1.2
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0xa00000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 179), {
  name: "Hallowed Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      chestScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      color: 0xcc0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 180), {
  name: "Hallowed Shooter",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: {
        x: 1.25,
        y: 1.0,
        z: 1.0
      },
      parts: {
        head: {
          type: "Shooter"
        }
      },
      color: 0xcc0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 192), {
  name: "Hallowed King Charger",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: {
        x: 0.7,
        y: 0.7,
        z: 0.7
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0xcc0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 70), {
  name: "Hybrid",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: shooterScale * enemy.scale,
      headScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      chestScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      armScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      parts: {
        head: {
          type: "Hybrid"
        }
      }
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 162), {
  name: "Cloaker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: shooterScale * enemy.scale,
      parts: {
        head: {
          type: "Hybrid"
        }
      },
      neckScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      chestScale: {
        x: 1.25,
        y: 1.25,
        z: 1.25
      },
      armScale: {
        x: 1.2,
        y: 1.3,
        z: 1.2
      }
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 197), {
  name: "Shadow",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      transparent: true,
      scale: enemy.scale
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 198), {
  name: "Shadow Frank",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      transparent: true,
      headScale: {
        x: 0.65,
        y: 0.65,
        z: 0.65
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      scale: enemy.scale
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 82), {
  name: "Scout",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: {
        x: 1.3,
        y: 1.3,
        z: 1.3
      },
      armScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      parts: {
        head: {
          type: "Shooter"
        }
      }
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 85), {
  name: "Charger Scout",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: {
        x: 1.3,
        y: 1.3,
        z: 1.3
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      color: 0x880000,
      parts: {
        head: {
          type: "Charger"
        }
      }
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 86), {
  name: "Shadow Scout",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: {
        x: 1.3,
        y: 1.3,
        z: 1.3
      },
      armScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      transparent: true,
      parts: {
        head: {
          type: "Shooter"
        }
      }
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 30), {
  name: "Baby Charger",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: {
        x: 2.0,
        y: 2.0,
        z: 2.0
      },
      armScale: {
        x: 1.0,
        y: 0.8,
        z: 0.8
      },
      legScale: {
        x: 1.0,
        y: 0.8,
        z: 0.8
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0x880000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 31), {
  name: "Charger",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      parts: {
        head: {
          type: "Charger"
        }
      },
      armScale: {
        x: 1.1,
        y: 1.3,
        z: 1.1
      },
      color: 0x880000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 33), {
  name: "Giant Charger",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      parts: {
        head: {
          type: "Charger"
        }
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      headScale: {
        x: 0.7,
        y: 0.7,
        z: 0.7
      },
      color: 0x880000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 43), {
  name: "King Charger",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      parts: {
        head: {
          type: "Charger"
        }
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      headScale: {
        x: 0.7,
        y: 0.7,
        z: 0.7
      },
      color: 0x880000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 44), {
  name: "Emperor Charger",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      parts: {
        head: {
          type: "Charger"
        }
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      headScale: {
        x: 0.7,
        y: 0.7,
        z: 0.7
      },
      color: 0x880000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 34), {
  name: "Mutant Charger",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      parts: {
        head: {
          type: "Charger"
        }
      },
      armScale: {
        x: 1.1,
        y: 1.3,
        z: 1.1
      },
      color: 0x884444
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 35), {
  name: "Giant Mutant Charger",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      parts: {
        head: {
          type: "Charger"
        }
      },
      neckScale: {
        x: 1.3,
        y: 1.3,
        z: 1.3
      },
      armScale: {
        x: 1.3,
        y: 1.7,
        z: 1.3
      },
      legScale: {
        x: 1.2,
        y: 1.4,
        z: 1.2
      },
      color: 0x884444
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 47), {
  name: "Grappler",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      parts: {
        head: {
          type: "Charger"
        }
      },
      neckScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      armScale: {
        x: 1.2,
        y: 1.3,
        z: 1.2
      },
      color: 0xc080ff
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 48), {
  name: "Giant Grappler",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      parts: {
        head: {
          type: "Charger"
        }
      },
      headScale: {
        x: 0.7,
        y: 0.7,
        z: 0.7
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      color: 0xc080ff
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 155), {
  name: "King Grappler",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      parts: {
        head: {
          type: "Charger"
        }
      },
      headScale: {
        x: 0.7,
        y: 0.7,
        z: 0.7
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      color: 0xc080ff
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 45), {
  name: "Bleeder",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      parts: {
        head: {
          type: "Charger"
        }
      },
      neckScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      armScale: {
        x: 1.2,
        y: 1.3,
        z: 1.2
      },
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 46), {
  name: "Giant Bleeder",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      parts: {
        head: {
          type: "Charger"
        }
      },
      headScale: {
        x: 0.7,
        y: 0.7,
        z: 0.7
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 156), {
  name: "King Bleeder",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      parts: {
        head: {
          type: "Charger"
        }
      },
      headScale: {
        x: 0.7,
        y: 0.7,
        z: 0.7
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 77), {
  name: "Sidestepper",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      parts: {
        head: {
          type: "Charger"
        }
      },
      headScale: {
        x: 1.2,
        y: 1.0,
        z: 1.0
      },
      color: 0x882000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 81), {
  name: "Phantom",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      parts: {
        head: {
          type: "Charger"
        }
      },
      headScale: {
        x: 1.2,
        y: 1.0,
        z: 1.0
      },
      transparent: true,
      color: 0x00ff80
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 169), {
  name: "Bloody Mass",
  model: (wrapper, enemy) => {
    const model = new BloodMassModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xc00000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 177), {
  name: "Bloody Mass", // spawned by infestation, auto bleedout
  model: (wrapper, enemy) => {
    const model = new BloodMassModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xc00000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 170), {
  name: "Bloody Infestation",
  model: (wrapper, enemy) => {
    const model = new BloodMassModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xc00000,
      tendrilScale: {
        x: 2.0,
        y: 1.5,
        z: 2.0
      }
    });
  	wrapper.tmpHeight = enemy.scale * 2.9;
    return model;
  },
  maxHealth: Infinity
});

EnemyDatablock.set(Identifier.create("Enemy", 172), {
  name: "Pouncer",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * 1.5
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 96), {
  name: "Medium Tank",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      chestScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      armScale: {
        x: 0.7,
        y: 0.7,
        z: 0.7
      },
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 97), {
  name: "Tank",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      chestScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      armScale: {
        x: 0.7,
        y: 0.7,
        z: 0.7
      },
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 99), {
  name: "Tank",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      chestScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      armScale: {
        x: 0.7,
        y: 0.7,
        z: 0.7
      },
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 104), {
  name: "Matriarch",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      chestScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      armScale: {
        x: 0.7,
        y: 0.7,
        z: 0.7
      },
      color: 0x880000,
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 106), {
  name: "Mother",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale
    });
    wrapper.tmpHeight = 1 * enemy.scale;
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 108), {
  name: "Armoured Mother",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: {
        x: 0.65,
        y: 0.65,
        z: 0.65
      },
      color: 0x880000
    });
    wrapper.tmpHeight = 1 * enemy.scale;
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 110), {
  name: "Charging Mother",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xaacc00
    });
    wrapper.tmpHeight = 1 * enemy.scale;
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 195), {
  name: "Revenant",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: {
        x: 1.5,
        y: 1.5,
        z: 1.5
      },
      chestScale: {
        x: 1.25,
        y: 1.7,
        z: 1.25
      },
      armScale: {
        x: 1.2,
        y: 1.8,
        z: 1.2
      },
      legScale: {
        x: 1.2,
        y: 1.8,
        z: 1.2
      },
      color: 0x220000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 196), {
  name: "Specter",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: {
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      chestScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      armScale: {
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      color: 0x220000
    });
    return model;
  }
});