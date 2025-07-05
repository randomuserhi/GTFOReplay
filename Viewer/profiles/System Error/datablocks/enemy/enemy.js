const { EnemyDatablock } = await require("@asl/vanilla/datablocks/enemy/enemy.js", "asl");
const { Identifier } = await require("@asl/vanilla/parser/identifier.js", "asl");
const { BigFlyerModel } = await require("@asl/vanilla/renderer/enemy/models/bigflyer.js", "asl");
const { FlyerModel } = await require("@asl/vanilla/renderer/enemy/models/flyer.js", "asl");
const { HumanoidEnemyModel } = await require("@asl/vanilla/renderer/enemy/models/humanoid.js", "asl");
const { SquidModel } = await require("@asl/vanilla/renderer/enemy/models/squid.js", "asl");
EnemyDatablock.clear();
const shooterScale = 0.8;
EnemyDatablock.set(Identifier.create("Enemy", 0), {
  name: "Unknown",
  maxHealth: Infinity
});

EnemyDatablock.set(Identifier.create("Enemy", 13), {
  name: "Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 32), {
  name: "Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 31), {
  name: "Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 24), {
  name: "Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 30), {
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
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 16), {
  name: "Giant Striker",
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
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 89), {
  name: "Mini Giant Striker",
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
        x: 1.8,
        y: 1.8,
        z: 1.8
      },
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 62), {
  name: "Striker_Big_nightmare",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      neckScale: { 
        x: 0.1,
        y: 0.1,
        z: 0.1
      },
      headScale: { 
        x: 0.1,
        y: 0.1,
        z: 0.1
      },
      armScale: { 
        x: 0.2,
        y: 0.2,
        z: 0.2
      },
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 39), {
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
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 52), {
  name: "Shooter_Spread",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: { 
        x: 0.1,
        y: 0.1,
        z: 0.1
      },
      armScale: { 
        x: 0.2,
        y: 0.2,
        z: 0.2
      },
      legScale: { 
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 28), {
  name: "Giant Striker",
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
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 35), {
  name: "Shadow Giant",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      transparent: true,
      headScale: { 
        x: 0.65,
        y: 0.65,
        z: 0.65
      },
      chestScale: { 
        x: 1.0,
        y: 0.7,
        z: 1.0
      },
      armScale: { 
        x: 1.2,
        y: 1.0,
        z: 1.2
      },
      legScale: { 
        x: 1.0,
        y: 0.7,
        z: 1.0
      },
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 19), {
  name: "Striker_Boss",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: { 
        x: 0.65,
        y: 0.65,
        z: 0.65
      },
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 38), {
  name: "Baby",
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
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 63), {
  name: "Striker_Child_Nightmare",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      neckScale: { 
        x: 0.2,
        y: 0.2,
        z: 0.2
      },
      chestScale: { 
        x: 0.5,
        y: 0.5,
        z: 0.5
      },
      armScale: { 
        x: 0.5,
        y: 0.5,
        z: 0.5
      },
      legScale: { 
        x: 0.5,
        y: 0.5,
        z: 0.5
      },
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 26), {
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
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 11), {
  name: "Shooter",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      parts: {
            head: {
            type: "Shooter"
            }
        },
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 18), {
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
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 33), {
  name: "Hybrid",
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
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 34), {
  name: "Infection Shooter",
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
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 36), {
  name: "Mother",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 37), {
  name: "Big Mother",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: { 
        x: 0.65,
        y: 0.65,
        z: 0.65
      },
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 55), {
  name: "Mega Mother",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: { 
        x: 0.65,
        y: 0.65,
        z: 0.65
      },
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 20), {
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
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 56), {
  name: "Nightmare Scout",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      headScale: { 
        x: 0.0,
        y: 0.0,
        z: 0.0
      },
      armScale: { 
        x: 0.2,
        y: 0.2,
        z: 0.2
      },
      legScale: { 
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 54), {
  name: "Zoomer Scout",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: { 
        x: 1.2,
        y: 1.2,
        z: 1.2
      },
      parts: {
            head: {
            type: "Shooter"
            }
        },
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 41), {
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
      parts: {
            head: {
            type: "Charger"
            }
        },
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 40), {
  name: "Shadow Scout",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      transparent: true,
      headScale: { 
        x: 1.3,
        y: 1.3,
        z: 1.3
      },
      armScale: { 
        x: 1.25,
        y: 1.25,
        z: 1.25
      },
      legScale: { 
        x: 1.1,
        y: 1.1,
        z: 1.1
      },
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 22), {
  name: "Cocoon",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 21), {
  name: "Shadow",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      transparent: true,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 29), {
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
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 47), {
  name: "Immortal",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      neckScale: { 
        x: 0.8,
        y: 0.8,
        z: 0.8
      },
      headScale: { 
        x: 0.6,
        y: 0.6,
        z: 0.6
      },
      chestScale: { 
        x: 1.8,
        y: 1.6,
        z: 1.6
      },
      armScale: { 
        x: 0.5,
        y: 0.5,
        z: 0.5
      },
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 42), {
  name: "Flyer",
  model: (wrapper, enemy) => {
    const model = new FlyerModel();
    const scale = 1.3 * enemy.scale;
    model.anchor.scale.set(scale, scale, scale);
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 45), {
  name: "Big Flyer",
  model: (wrapper, enemy) => {
    const model = new BigFlyerModel();
    const scale = enemy.scale;
    model.anchor.scale.set(scale, scale, scale);
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 43), {
  name: "Squidward",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 44), {
  name: "SquidBoss_Big",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 46), {
  name: "Snatcher",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * 1.5,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 58), {
  name: "SquidBoss_Big_Complex",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 61), {
  name: "SquidBoss_VS",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 75), {
  name: "Door Breaker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      armScale: { 
        x: 2.0,
        y: 2.0,
        z: 2.0
      },
      parts: {
          head: {
            type: "Charger"
          }
        },
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 76), {
  name: "Bleeder Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 77), {
  name: "Bleeder Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 78), {
  name: "Bleeder Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 79), {
  name: "Bleeder Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 80), {
  name: "Giant Bleeder Striker",
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
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 81), {
  name: "Giant Bleeder Striker",
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
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 82), {
  name: "Shooter Core",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      neckScale: { 
        x: 5.0,
        y: 5.0,
        z: 5.0
      },
      headScale: { 
        x: 3.0,
        y: 3.0,
        z: 3.0
      },
      armScale: { 
        x: 0.25,
        y: 0.25,
        z: 0.25
      },
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 83), {
  name: "Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 84), {
  name: "Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 85), {
  name: "Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 86), {
  name: "Striker",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 87), {
  name: "Giant Striker",
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
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 88), {
  name: "Giant Striker",
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
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 90), {
  name: "Boss mixture",
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
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 91), {
  name: "test",
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
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 92), {
  name: "Miniboss Scout",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      headScale: { 
        x: 1.4,
        y: 1.4,
        z: 1.4
      },
      chestScale: { 
        x: 0.6,
        y: 0.6,
        z: 0.7
      },
      armScale: { 
        x: 1.1,
        y: 1.15,
        z: 1.15
      },
      legScale: { 
        x: 1.0,
        y: 1.26,
        z: 1.26
      },
      parts: {
            head: {
            type: "Hybrid"
            }
        },
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 93), {
  name: "Birther Scout",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 94), {
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
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 95), {
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
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 96), {
  name: "Shooter_Hibernate_exploder",
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
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 97), {
  name: "Shooter_Wave_exploder",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale * shooterScale,
      parts: {
            head: {
            type: "Shooter"
            }
        },
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 98), {
  name: "Shooter_Big_exploder",
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
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 99), {
  name: "boxer",
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
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 100), {
  name: "Bleed_Tank",
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
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 101), {
  name: "Big_Tank",
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
      color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 102), {
  name: "Shooter_Big_RapidFire_tank",
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
        color: 0xFF0000
    });
    return model;
  }
});

EnemyDatablock.set(Identifier.create("Enemy", 103), {
  name: "nightmare_birther",
  model: (wrapper, enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
      scale: enemy.scale,
      neckScale: { 
        x: 0.1,
        y: 0.1,
        z: 0.1
      },
      headScale: { 
        x: 0.1,
        y: 0.1,
        z: 0.1
      },
      chestScale: { 
        x: 2.0,
        y: 2.0,
        z: 2.0
      },
      armScale: { 
        x: 0.2,
        y: 0.2,
        z: 0.2
      },
      legScale: { 
        x: 0.1,
        y: 0.1,
        z: 0.1
      },
      color: 0xFF0000
    });
    return model;
  }
});

