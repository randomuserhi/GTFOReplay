import { EnemyDatablock } from "../../../vanilla/datablocks/enemy/enemy.js";
import type { Enemy } from "../../../vanilla/parser/enemy/enemy.js";
import { Identifier } from "../../../vanilla/parser/identifier.js";
import type { EnemyModelWrapper } from "../../../vanilla/renderer/enemy/lib.js";
import { BigFlyerModel } from "../../../vanilla/renderer/enemy/models/bigflyer.js";
import { FlyerModel } from "../../../vanilla/renderer/enemy/models/flyer.js";
import { HumanoidEnemyModel } from "../../../vanilla/renderer/enemy/models/humanoid.js";
import { SquidModel } from "../../../vanilla/renderer/enemy/models/squid.js";

EnemyDatablock.clear();

const shooterScale = 0.8;

EnemyDatablock.set(Identifier.create("Enemy", 0), {
    name: "Unknown",
    maxHealth: Infinity
});

EnemyDatablock.set(Identifier.create("Enemy", 20), {
    name: "Scout",
    maxHealth: 42,
    model: (wrapper, enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            parts: {
                head: {
                    type: "Shooter"
                }
            },

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

            scale: enemy.scale * shooterScale,
        });
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 40), {
    name: "Shadow Scout",
    maxHealth: 42,
    model: (wrapper, enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
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

            scale: enemy.scale * shooterScale,

            transparent: true
        });
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 41), {
    name: "Charger Scout",
    maxHealth: 60,
    model: (wrapper, enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            parts: {
                head: {
                    type: "Charger"
                }
            },

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

            scale: enemy.scale,
            
            color: 0x880000
        });
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 21), {
    name: "Shadow",
    maxHealth: 20,
    model: (wrapper, enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            transparent: true,

            scale: enemy.scale
        });
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 35), {
    name: "Big Shadow",
    maxHealth: 120,
    model: (wrapper, enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            transparent: true,

            headScale: {
                x: 0.65,
                y: 0.65,
                z: 0.65,
            },
            chestScale: {
                x: 1,
                y: 0.7,
                z: 1,
            },
            armScale: {
                x: 1.2,
                y: 1,
                z: 1.2,
            },

            scale: enemy.scale
        });
        return model;
    }
});

const Baby: EnemyDatablock = {
    name: "Baby",
    maxHealth: 5,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            armScale: {
                x: 1,
                y: 0.8,
                z: 0.8,
            },
            legScale: {
                x: 1,
                y: 0.8,
                z: 0.8,
            },
            chestScale: {
                x: 1.3,
                y: 1.3,
                z: 1.3,
            },
    
            scale: enemy.scale
        });
        return model;
    }
};
EnemyDatablock.set(Identifier.create("Enemy", 38), Baby);
EnemyDatablock.set(Identifier.create("Enemy", 48), Baby);
EnemyDatablock.set(Identifier.create("Enemy", 63), {
    ...Baby,
    name: "Nightmare Baby",
});

const Striker: EnemyDatablock = {
    name: "Striker",
    maxHealth: 20,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: enemy.scale
        });
        return model;
    }
};
EnemyDatablock.set(Identifier.create("Enemy", 13), Striker);
EnemyDatablock.set(Identifier.create("Enemy", 31), Striker);
EnemyDatablock.set(Identifier.create("Enemy", 32), Striker);
EnemyDatablock.set(Identifier.create("Enemy", 24), Striker);
EnemyDatablock.set(Identifier.create("Enemy", 49), Striker);

const BigStriker: EnemyDatablock = {
    name: "BigStriker",
    maxHealth: 120,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
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
};
EnemyDatablock.set(Identifier.create("Enemy", 16), BigStriker);
EnemyDatablock.set(Identifier.create("Enemy", 28), BigStriker);
EnemyDatablock.set(Identifier.create("Enemy", 50), BigStriker);

const Shooter: EnemyDatablock = {
    name: "Shooter",
    maxHealth: 30,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: shooterScale * enemy.scale,
    
            parts: {
                head: {
                    type: "Shooter"
                }
            },
        });
        return model;
    }
};
EnemyDatablock.set(Identifier.create("Enemy", 26), Shooter);
EnemyDatablock.set(Identifier.create("Enemy", 51), Shooter);
EnemyDatablock.set(Identifier.create("Enemy", 11), Shooter);

EnemyDatablock.set(Identifier.create("Enemy", 18), {
    name: "Big Shooter",
    maxHealth: 150,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: shooterScale * enemy.scale,
            headScale: {
                x: 0.8,
                y: 0.8,
                z: 0.8
            },
            chestScale: {
                x: 1.0,
                y: 1.0,
                z: 1.0
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
        });
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 33), {
    name: "Hybrid",
    maxHealth: 150,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: shooterScale * enemy.scale,

            parts: {
                head: {
                    type: "Hybrid"
                }
            },

            armScale: {
                x: 1.1,
                y: 1.1,
                z: 1.1
            },
            chestScale: {
                x: 1.2,
                y: 1.2,
                z: 1.2
            },
            headScale: {
                x: 1.1,
                y: 1.1,
                z: 1.1
            },
        });
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 30), {
    name: "Charger",
    maxHealth: 30,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: enemy.scale,

            parts: {
                head: {
                    type: "Charger"
                }
            },

            armScale: {
                x: 1.3,
                y: 1.3,
                z: 1.3
            },

            color: 0x880000
        });
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 39), {
    name: "Big Charger",
    maxHealth: 120,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
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
                x: 1,
                y: 1,
                z: 1
            },

            color: 0x880000
        });
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 29), {
    name: "Tank",
    maxHealth: 1000,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: enemy.scale,
        });
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 36), {
    name: "Mother",
    maxHealth: 1000,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: enemy.scale,
            rotOffset: {
                x: 0,
                y: 180,
                z: 0
            },
        });
        wrapper.tmpHeight = 1 * enemy.scale;
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 37), {
    name: "Big Mother",
    maxHealth: 2500,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: enemy.scale,
            rotOffset: {
                x: 0,
                y: 180,
                z: 0
            },
        });
        wrapper.tmpHeight = 1 * enemy.scale;
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 55), {
    name: "Mega Mother",
    maxHealth: 5000,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: enemy.scale,
            rotOffset: {
                x: 0,
                y: 180,
                z: 0
            },
        });
        wrapper.tmpHeight = 1 * enemy.scale;
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 46), {
    name: "Snatcher",
    maxHealth: 225,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: enemy.scale * 1.5,
        });
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 47), {
    name: "Immortal Tank",
    maxHealth: Infinity,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: enemy.scale * 1.2,
        });
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 42), {
    name: "Flyer",
    maxHealth: 16.2,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new FlyerModel();
        const scale = 1.3 * enemy.scale;
        model.anchor.scale.set(scale, scale, scale);
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 45), {
    name: "Big Flyer",
    maxHealth: 150,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new BigFlyerModel();
        const scale = enemy.scale;
        model.anchor.scale.set(scale, scale, scale);
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 43), {
    name: "Squid",
    maxHealth: 6000,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new SquidModel();
        const scale = enemy.scale;
        model.anchor.scale.set(scale, scale, scale);
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 44), {
    name: "Squid",
    maxHealth: 6000,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new SquidModel();
        const scale = enemy.scale;
        model.anchor.scale.set(scale, scale, scale);
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 53), {
    name: "Nightmare Striker",
    maxHealth: 37,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: enemy.scale,

            armScale: {
                x: 1.2,
                y: 1.2,
                z: 1.2
            },
            headScale: {
                x: 0,
                y: 0,
                z: 0
            },
            legScale: {
                x: 0.97,
                y: 0.97,
                z: 0.97
            },
            chestScale: {
                x: 1.05,
                y: 1.05,
                z: 1.05
            }
        });
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 52), {
    name: "Nightmare Shooter",
    maxHealth: 18,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: enemy.scale * shooterScale,

            armScale: {
                x: 0.2,
                y: 0.2,
                z: 0.2
            },
            headScale: {
                x: 0,
                y: 0,
                z: 0
            },
            legScale: {
                x: 1.1,
                y: 1.1,
                z: 1.1
            },
        });
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 54), {
    name: "Zoomer Scout",
    maxHealth: 42,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: enemy.scale * shooterScale,

            parts: {
                head: {
                    type: "Shooter"
                }
            },

            headScale: {
                x: 1.3,
                y: 1.3,
                z: 1.3
            },
            armScale: {
                x: 1.1,
                y: 1.1,
                z: 1.1,
            },
        });
        wrapper.tmpHeight = 1 * enemy.scale;
        return model;
    }
});


EnemyDatablock.set(Identifier.create("Enemy", 56), {
    name: "Nightmare Scout",
    maxHealth: 161,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: enemy.scale * shooterScale,

            armScale: {
                x: 0.2,
                y: 0.2,
                z: 0.2
            },
            headScale: {
                x: 0,
                y: 0,
                z: 0
            },
            legScale: {
                x: 1.1,
                y: 1.1,
                z: 1.1
            },
        });
        return model;
    }
});

EnemyDatablock.set(Identifier.create("Enemy", 62), {
    name: "Potatoe",
    maxHealth: 640,
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: enemy.scale,

            armScale: {
                x: 0.2,
                y: 0.2,
                z: 0.2
            },
            headScale: {
                x: 0,
                y: 0,
                z: 0
            },
        });
        return model;
    }
});