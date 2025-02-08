const { EnemyDatablock } = await require("../../../vanilla/datablocks/enemy/enemy.js", "asl");
const { Identifier } = await require("../../../vanilla/parser/identifier.js", "asl");
const { BigFlyerModel } = await require("../../../vanilla/renderer/enemy/models/bigflyer.js", "asl");
const { FlyerModel } = await require("../../../vanilla/renderer/enemy/models/flyer.js", "asl");
const { HumanoidEnemyModel } = await require("../../../vanilla/renderer/enemy/models/humanoid.js", "asl");
const { SquidModel } = await require("../../../vanilla/renderer/enemy/models/squid.js", "asl");
const { GiantGeneratorModel } = await require("../../giantgeneratormodel.js", "asl");
EnemyDatablock.clear();
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
      },
      color: 0xFF1A1A
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 11), {
  name: "Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF1A1A
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 150), {
  name: "Giant Generator",
  model: (wrapper, enemy) => {
    const model = new GiantGeneratorModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF1A1A
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 151), {
  name: "Giant Generated",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      neckScale: { 
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      headScale: { 
        x: 0.65,
        y: 0.65,
        z: 0.65
      },
      armScale: { 
        x: 0.001,
        y: 0.001,
        z: 0.001
      },
      color: 0xFF1A1A
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 152), {
  name: "Giant Generated",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      neckScale: { 
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      headScale: { 
        x: 0.65,
        y: 0.65,
        z: 0.65
      },
      armScale: { 
        x: 0.001,
        y: 0.001,
        z: 0.001
      },
      color: 0xFF1A1A
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 12), {
  name: "Mindless",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: { 
        x: 0.01,
        y: 0.01,
        z: 0.01
      },
      color: 0xFF1A1A
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 20), {
  name: "Terror Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF1A1A
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 142), {
  name: "Crystalline Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF1A1A
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 13), {
  name: "Giant Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF1A1A
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 21), {
  name: "Giant Terror Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF1A1A
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
      color: 0xFF1A1A
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 15), {
  name: "Giiant Elite Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF1A1A
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
      color: 0xFF1A1A
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 17), {
  name: "Giant Infested Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF1A1A
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 18), {
  name: "Afflicted Striker",
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
      color: 0xFF1A1A
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 19), {
  name: "Giant Afflicted Striker",
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
      color: 0xFF1A1A
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 22), {
  name: "King Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      neckScale: { 
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      headScale: { 
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
        y: 1.2,
        z: 1.2
      },
      color: 0x970000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 23), {
  name: "Elite King Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      neckScale: { 
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      headScale: { 
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
        y: 1.2,
        z: 1.2
      },
      color: 0x970000
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
      headScale: { 
        x: 1.0,
        y: 1.0,
        z: 1.0
      },
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
      color: 0xFF6400
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 25), {
  name: "Bruiser",
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
        y: 1.3,
        z: 1.1
      },
      legScale: { 
        x: 0.8,
        y: 1.3,
        z: 1.05
      },
      color: 0xFF6400
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 143), {
  name: "Crystalline Bruiser",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      chestScale: { 
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      armScale: { 
        x: 1.1,
        y: 1.3,
        z: 1.1
      },
      color: 0xFF6400
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
      headScale: { 
        x: 1.0,
        y: 1.0,
        z: 1.0
      },
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
      color: 0xFF6400
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 27), {
  name: "Elite Brawler",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: { 
        x: 1.0,
        y: 1.0,
        z: 1.0
      },
      chestScale: { 
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      legScale: { 
        x: 0.8,
        y: 1.3,
        z: 1.05
      },
      color: 0xFF6400
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 28), {
  name: "King Brawler",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: { 
        x: 1.0,
        y: 1.0,
        z: 1.0
      },
      chestScale: { 
        x: 1.25,
        y: 1.25,
        z: 1.25
      },
      legScale: { 
        x: 0.8,
        y: 1.3,
        z: 1.05
      },
      color: 0xFF6400
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 29), {
  name: "Shrieker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      armScale: { 
        x: 1.1,
        y: 1.3,
        z: 1.1
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0x5900FF
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
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0x5900FF
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
      armScale: { 
        x: 1.1,
        y: 1.3,
        z: 1.1
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0x5900FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 32), {
  name: "Heavy Charger",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      neckScale: { 
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      chestScale: { 
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
      color: 0x5900FF
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
      color: 0x5900FF
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
      color: 0x5900FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 144), {
  name: "Crystalline Charger",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      chestScale: { 
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
      color: 0x5900FF
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
      color: 0x5900FF
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
      color: 0x5900FF
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
      color: 0x5900FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 34), {
  name: "Mutant",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      armScale: { 
        x: 1.1,
        y: 1.3,
        z: 1.1
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0x5900FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 35), {
  name: "Giant Mutant",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
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
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0x5900FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 36), {
  name: "Elite Charger",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      neckScale: { 
        x: 1.15,
        y: 1.15,
        z: 1.15
      },
      armScale: { 
        x: 1.3,
        y: 1.3,
        z: 1.3
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0x5900FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 37), {
  name: "Giant Elite Charger",
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
      color: 0x5900FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 38), {
  name: "Infested Charger",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      neckScale: { 
        x: 1.15,
        y: 1.15,
        z: 1.15
      },
      armScale: { 
        x: 1.3,
        y: 1.3,
        z: 1.3
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0x5900FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 39), {
  name: "Giant Infested Charger",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      neckScale: { 
        x: 1.05,
        y: 1.05,
        z: 1.05
      },
      headScale: { 
        x: 0.85,
        y: 0.85,
        z: 0.85
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
      color: 0x5900FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 40), {
  name: "Afflicted Baby Charger",
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
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0x5900FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 41), {
  name: "Afflicted Charger",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      neckScale: { 
        x: 1.15,
        y: 1.15,
        z: 1.15
      },
      armScale: { 
        x: 1.3,
        y: 1.3,
        z: 1.3
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0x5900FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 42), {
  name: "Giant Afflicted Charger",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      neckScale: { 
        x: 1.05,
        y: 1.05,
        z: 1.05
      },
      headScale: { 
        x: 0.85,
        y: 0.85,
        z: 0.85
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
      color: 0x5900FF
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
      color: 0x5900FF
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
      color: 0x5900FF
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
      color: 0x5900FF
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
      color: 0x5900FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 148), {
  name: "Crystalline King",
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
      color: 0x5900FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 49), {
  name: "Frankling",
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
      color: 0xFFF000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 50), {
  name: "Chonk",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      armScale: { 
        x: 0.9,
        y: 0.9,
        z: 0.9
      },
      legScale: { 
        x: 0.9,
        y: 0.9,
        z: 0.9
      },
      color: 0xFFF000
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
      color: 0xFFF000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 56), {
  name: "Grappler Frank",
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
      color: 0xFFF000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 145), {
  name: "Crystalline Frank",
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
      color: 0xFFF000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 52), {
  name: "Crawling Chonk",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      armScale: { 
        x: 0.9,
        y: 0.9,
        z: 0.9
      },
      legScale: { 
        x: 0.9,
        y: 0.9,
        z: 0.9
      },
      color: 0xFFF000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 126), {
  name: "Crawling Grappler Chonk",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      armScale: { 
        x: 0.9,
        y: 0.9,
        z: 0.9
      },
      legScale: { 
        x: 0.9,
        y: 0.9,
        z: 0.9
      },
      color: 0xFFF000
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
      },
      color: 0xFFF000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 54), {
  name: "Infested Frank",
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
      color: 0xFFF000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 55), {
  name: "Afflicted Frank",
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
      color: 0xFFF000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 57), {
  name: "Frank King",
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
      color: 0xFFF000
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
      },
      color: 0xFF0068
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 59), {
  name: "Giant Shooter",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: { 
        x: 0.8,
        y: 0.8,
        z: 0.8
      },
      armScale: { 
        x: 0.85,
        y: 0.85,
        z: 0.85
      },
      parts: {
        head: {
          type: "Shooter"
        }
      },
      color: 0xFF0068
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 61), {
  name: "Giant Sniper Shooter",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: { 
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      armScale: { 
        x: 0.85,
        y: 0.85,
        z: 0.85
      },
      parts: {
        head: {
          type: "Shooter"
        }
      },
      color: 0xFF0068
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 65), {
  name: "Giant Burst Shooter",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: { 
        x: 0.8,
        y: 0.8,
        z: 0.8
      },
      armScale: { 
        x: 0.85,
        y: 0.85,
        z: 0.85
      },
      parts: {
        head: {
          type: "Shooter"
        }
      },
      color: 0xFF0068
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 67), {
  name: "Giant Melee Shooter",
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
      },
      color: 0xFF0068
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 69), {
  name: "Giant Surge Shooter",
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
      },
      color: 0xFF0068
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 70), {
  name: "Hybrid",
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
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      parts: {
        head: {
          type: "Hybrid"
        }
      },
      color: 0xFF0068
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 60), {
  name: "Sniper Shooter",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: { 
        x: 1.25,
        y: 1.25,
        z: 1.25
      },
      parts: {
        head: {
          type: "Shooter"
        }
      },
      color: 0xFF0068
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 62), {
  name: "Veil",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      neckScale: { 
        x: 0.01,
        y: 0.01,
        z: 0.01
      },
      headScale: { 
        x: 2.0,
        y: 2.0,
        z: 2.0
      },
      chestScale: { 
        x: 0.01,
        y: 0.01,
        z: 0.01
      },
      armScale: { 
        x: 0.01,
        y: 0.01,
        z: 0.01
      },
      legScale: { 
        x: 0.01,
        y: 0.01,
        z: 0.01
      },
      posOffset: {
        x: 0.0,
        y: 3.5,
        z: 0.0
      },
      rotOffset: {
        x: Math.deg2rad * 45,
        y: Math.deg2rad * 0,
        z: Math.deg2rad * 0
      },
      parts: {
        head: {
          type: "Shooter"
        }
      },
      color: 0xFF0068
    });
    wrapper.tmpHeight = 3 * enemy.scale;
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 63), {
  name: "Flash Veil",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      neckScale: { 
        x: 0.01,
        y: 0.01,
        z: 0.01
      },
      headScale: { 
        x: 2.0,
        y: 2.0,
        z: 2.0
      },
      chestScale: { 
        x: 0.01,
        y: 0.01,
        z: 0.01
      },
      armScale: { 
        x: 0.01,
        y: 0.01,
        z: 0.01
      },
      legScale: { 
        x: 0.01,
        y: 0.01,
        z: 0.01
      },
      parts: {
        head: {
          type: "Shooter"
        }
      },
      color: 0xFF0068
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 124), {
  name: "Shadow Veil",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      transparent: true,
      neckScale: { 
        x: 0.01,
        y: 0.01,
        z: 0.01
      },
      headScale: { 
        x: 2.0,
        y: 2.0,
        z: 2.0
      },
      chestScale: { 
        x: 0.01,
        y: 0.01,
        z: 0.01
      },
      armScale: { 
        x: 0.01,
        y: 0.01,
        z: 0.01
      },
      legScale: { 
        x: 0.01,
        y: 0.01,
        z: 0.01
      },
      posOffset: {
        x: 0.0,
        y: 3.5,
        z: 0.0
      },
      rotOffset: {
        x: Math.deg2rad * 45,
        y: Math.deg2rad * 0,
        z: Math.deg2rad * 0
      },
      parts: {
        head: {
          type: "Shooter"
        }
      },
      color: 0xFF0068
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 125), {
  name: "Armoured Veil",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      neckScale: { 
        x: 0.01,
        y: 0.01,
        z: 0.01
      },
      headScale: { 
        x: 2.0,
        y: 2.0,
        z: 2.0
      },
      chestScale: { 
        x: 0.01,
        y: 0.01,
        z: 0.01
      },
      armScale: { 
        x: 0.01,
        y: 0.01,
        z: 0.01
      },
      legScale: { 
        x: 0.01,
        y: 0.01,
        z: 0.01
      },
      posOffset: {
        x: 0.0,
        y: 3.5,
        z: 0.0
      },
      rotOffset: {
        x: Math.deg2rad * 45,
        y: Math.deg2rad * 0,
        z: Math.deg2rad * 0
      },
      parts: {
        head: {
          type: "Shooter"
        }
      },
      color: 0xcc0046
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 64), {
  name: "Burst Shooter",
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
      color: 0xFF0068
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
      },
      color: 0xFF0068
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
      },
      color: 0xFF0068
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 146), {
  name: "Crystalline Shooter",
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
      color: 0xFF0068
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
      },
      color: 0xFF0068
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 72), {
  name: "Giant Elite Shooter",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: { 
        x: 0.8,
        y: 0.8,
        z: 0.8
      },
      armScale: { 
        x: 0.85,
        y: 0.85,
        z: 0.85
      },
      parts: {
        head: {
          type: "Shooter"
        }
      },
      color: 0xFF0068
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
      color: 0xFF0068
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 74), {
  name: "Giant Infested Shooter",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: { 
        x: 1.1,
        y: 1.0,
        z: 1.0
      },
      parts: {
        head: {
          type: "Shooter"
        }
      },
      color: 0xFF0068
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 75), {
  name: "Afflicted Shooter",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: { 
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      chestScale: { 
        x: 1.15,
        y: 1.15,
        z: 1.15
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
      },
      color: 0xFF0068
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 76), {
  name: "Giant Afflicted Shooter",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: { 
        x: 1.1,
        y: 1.0,
        z: 1.0
      },
      parts: {
        head: {
          type: "Shooter"
        }
      },
      color: 0xFF0068
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
      headScale: { 
        x: 1.2,
        y: 1.0,
        z: 1.0
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0x00FFAE
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 78), {
  name: "Giant Sidestepper",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: { 
        x: 1.2,
        y: 1.0,
        z: 1.0
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0x00FFAE
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 79), {
  name: "Shadowstepper",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      transparent: true,
      headScale: { 
        x: 1.2,
        y: 1.0,
        z: 1.0
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0x00FFAE
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 80), {
  name: "Wraith",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      transparent: true,
      headScale: { 
        x: 1.2,
        y: 1.0,
        z: 1.0
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0x00FFAE
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
      transparent: true,
      headScale: { 
        x: 1.2,
        y: 1.0,
        z: 1.0
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0x00FFAE
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 157), {
  name: "Phantom Queen",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: { 
        x: 1.2,
        y: 1.0,
        z: 1.0
      },
      color: 0x00FFAE
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 147), {
  name: "Crystalline Sidestepper",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: { 
        x: 1.2,
        y: 1.0,
        z: 1.0
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0x00FFAE
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
      },
      color: 0xFFFFFF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 83), {
  name: "Giant Scout",
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
      },
      color: 0xFFFFFF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 84), {
  name: "Elite Scout",
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
      },
      color: 0xFFFFFF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 85), {
  name: "Tendril Burst Scout",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: { 
        x: 1.3,
        y: 1.3,
        z: 1.3
      },
      chestScale: { 
        x: 1.25,
        y: 1.25,
        z: 1.25
      },
      armScale: { 
        x: 1.15,
        y: 1.15,
        z: 1.15
      },
      parts: {
        head: {
          type: "Shooter"
        }
      },
      color: 0xFFFFFF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 86), {
  name: "Paranoid Scout",
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
      },
      color: 0xFFFFFF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 153), {
  name: "Baby Scout",
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
      },
      color: 0xFFFFFF
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
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 163), {
  name: "Queen Hybrid",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      neckScale: { 
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      headScale: { 
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      chestScale: { 
        x: 1.4,
        y: 1.4,
        z: 1.4
      },
      armScale: { 
        x: 1.3,
        y: 1.3,
        z: 1.3
      },
      legScale: { 
        x: 1.4,
        y: 1.4,
        z: 1.4
      },
      parts: {
        head: {
          type: "Hybrid"
        }
      },
      color: 0xFF0068
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
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 98), {
  name: "Aggressive Tank",
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
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 99), {
  name: "Crawling Tank",
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
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 106), {
  name: "Mother",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 107), {
  name: "Queen Mother",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: { 
        x: 0.65,
        y: 0.65,
        z: 0.65
      },
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 100), {
  name: "Queen Tank",
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
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 101), {
  name: "Afflicted Tank",
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
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 102), {
  name: "Afflicted Queen Tank",
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
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 103), {
  name: "Patriarch",
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
      color: 0xEC00FF
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
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 105), {
  name: "The Immortal",
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
      color: 0xEC00FF
    });
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
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 109), {
  name: "Afflicted Mother",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: { 
        x: 0.65,
        y: 0.65,
        z: 0.65
      },
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 110), {
  name: "Charging Mother",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 164), {
  name: "Queen Charging Mother",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 136), {
  name: "Explosive Tank",
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
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 137), {
  name: "Explosive Queen Tank",
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
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 138), {
  name: "Explosive Queen Mother",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: { 
        x: 0.65,
        y: 0.65,
        z: 0.65
      },
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 140), {
  name: "Explosive Charging Mother",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 154), {
  name: "The Immortal Scout",
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
      color: 0xEC00FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 111), {
  name: "Fogger",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      neckScale: { 
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      headScale: { 
        x: 0.8,
        y: 0.8,
        z: 0.8
      },
      chestScale: { 
        x: 0.8,
        y: 0.8,
        z: 0.8
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
      parts: {
        head: {
          type: "Shooter"
        }
      },
      color: 0x707070
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 112), {
  name: "Gasser",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      neckScale: { 
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      headScale: { 
        x: 0.8,
        y: 0.8,
        z: 0.8
      },
      chestScale: { 
        x: 0.8,
        y: 0.8,
        z: 0.8
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
      parts: {
        head: {
          type: "Shooter"
        }
      },
      color: 0x23FF00
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 113), {
  name: "Flashbanger",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 114), {
  name: "Exploder",
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
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      parts: {
        head: {
          type: "Hybrid"
        }
      },
      color: 0xff884d
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 165), {
  name: "The Lost",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      neckScale: { 
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      headScale: { 
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      chestScale: { 
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      armScale: { 
        x: 1.2,
        y: 1.2,
        z: 1.6
      },
      legScale: { 
        x: 1.4,
        y: 0.8,
        z: 0.8
      },
      color: 0xff884d
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 115), {
  name: "Giant Exploder",
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
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      parts: {
        head: {
          type: "Hybrid"
        }
      },
      color: 0xff884d
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 116), {
  name: "Bombarder",
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
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      parts: {
        head: {
          type: "Hybrid"
        }
      },
      color: 0xff884d
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 123), {
  name: "Corruptor",
  model: (wrapper, enemy) => {
    const model = new FlyerModel();
    const scale = 1.3 * enemy.scale;
    model.anchor.scale.set(scale, scale, scale);
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 127), {
  name: "Explosive Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xff884d
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 128), {
  name: "Explosive Brawler",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      armScale: { 
        x: 1.1,
        y: 1.3,
        z: 1.1
      },
      color: 0xff884d
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 129), {
  name: "Explosive Grappler",
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
      color: 0xff884d
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 130), {
  name: "Explosive Chonk",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      armScale: { 
        x: 0.9,
        y: 0.9,
        z: 0.9
      },
      legScale: { 
        x: 0.9,
        y: 0.9,
        z: 0.9
      },
      color: 0xff884d
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 131), {
  name: "Explosive Frank",
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
      color: 0xff884d
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 132), {
  name: "Explosiive Grappler Frank",
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
      color: 0xff884d
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 133), {
  name: "Explosive Melee Shooter",
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
      },
      color: 0xff884d
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 134), {
  name: "Explosive Sidestepper",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: { 
        x: 1.2,
        y: 1.0,
        z: 1.0
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0xff884d
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 135), {
  name: "Giant Explosive Sidestepper",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: { 
        x: 1.2,
        y: 1.0,
        z: 1.0
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0xff884d
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 139), {
  name: "Explosive Baby Striker",
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
      },
      color: 0xff884d
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 141), {
  name: "Explosive Giant Grappler",
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
      color: 0xff884d
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 117), {
  name: "Flyer",
  model: (wrapper, enemy) => {
    const model = new FlyerModel();
    const scale = 1.3 * enemy.scale;
    model.anchor.scale.set(scale, scale, scale);
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 118), {
  name: "Queen Flyer",
  model: (wrapper, enemy) => {
    const model = new FlyerModel();
    const scale = 1.3 * enemy.scale;
    model.anchor.scale.set(scale, scale, scale);
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 119), {
  name: "Barrage Flyer",
  model: (wrapper, enemy) => {
    const model = new FlyerModel();
    const scale = 1.3 * enemy.scale;
    model.anchor.scale.set(scale, scale, scale);
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 120), {
  name: "Surge Flyer",
  model: (wrapper, enemy) => {
    const model = new FlyerModel();
    const scale = 1.3 * enemy.scale;
    model.anchor.scale.set(scale, scale, scale);
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 121), {
  name: "Veil Flyer",
  model: (wrapper, enemy) => {
    const model = new FlyerModel();
    const scale = 1.3 * enemy.scale;
    model.anchor.scale.set(scale, scale, scale);
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 122), {
  name: "Elite Flyer",
  model: (wrapper, enemy) => {
    const model = new FlyerModel();
    const scale = 1.3 * enemy.scale;
    model.anchor.scale.set(scale, scale, scale);
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 158), {
  name: "Chaos Infector",
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
      color: 0x5900FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 159), {
  name: "Chaos Exploder",
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
      color: 0x5900FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 160), {
  name: "Chaos Bleeder",
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
      color: 0x5900FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 161), {
  name: "Chaos Grappler",
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
      color: 0x5900FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 162), {
  name: "Cloaker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
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
      },
      parts: {
        head: {
          type: "Hybrid"
        }
      },
      color: 0x00FFAE
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 166), {
  name: "The Flesh",
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
      color: 0xFFF000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 167), {
  name: "Fleshling",
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
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0x5900FF
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 168), {
  name: "The Visitor",
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
        y: 1.8,
        z: 1.2
      },
      legScale: { 
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      parts: {
        head: {
          type: "Charger"
        }
      },
      color: 0x5100FF
    });
    return model;
  }
});

