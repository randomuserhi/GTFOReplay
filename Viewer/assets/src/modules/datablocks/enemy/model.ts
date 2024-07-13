import { Model } from "../../library/models/lib.js";
import type { EnemyAnimState } from "../../parser/enemy/animation.js";
import { Enemy } from "../../parser/enemy/enemy.js";
import { Identifier } from "../../parser/identifier.js";
import type { EnemyModelWrapper } from "../../renderer/enemy/lib.js";
import { BigFlyerModel } from "../../renderer/enemy/models/bigflyer.js";
import { FlyerModel } from "../../renderer/enemy/models/flyer.js";
import { HumanoidEnemyModel } from "../../renderer/enemy/models/humanoid.js";
import { SquidModel } from "../../renderer/enemy/models/squid.js";
import { Datablock } from "../lib.js";

export interface EnemyModelDatablock {
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => Model<[enemy: Enemy, anim: EnemyAnimState]>;
    tmpHeight?: number;
}

export const EnemyModelDatablock = new Datablock<Identifier, EnemyModelDatablock>((identifier) => {
    if (identifier.type === "Unknown") return undefined;
    if (identifier.type !== "Enemy") throw new Error(`Identifier did not represent an Enemy: ${identifier.hash}`);
    return identifier.id;
});

const shooterScale = 0.8;

EnemyModelDatablock.set(Identifier.create("Enemy", 20), {
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

EnemyModelDatablock.set(Identifier.create("Enemy", 40), {
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

EnemyModelDatablock.set(Identifier.create("Enemy", 41), {
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

EnemyModelDatablock.set(Identifier.create("Enemy", 21), {
    model: (wrapper, enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            transparent: true,

            scale: enemy.scale
        });
        return model;
    }
});

EnemyModelDatablock.set(Identifier.create("Enemy", 35), {
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

const baby = (wrapper: EnemyModelWrapper, enemy: Enemy) => {
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
};
EnemyModelDatablock.set(Identifier.create("Enemy", 38), {
    model: baby
});
EnemyModelDatablock.set(Identifier.create("Enemy", 48), {
    model: baby
});
EnemyModelDatablock.set(Identifier.create("Enemy", 63), {
    model: baby
});

const striker = (wrapper: EnemyModelWrapper, enemy: Enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
        scale: enemy.scale
    });
    return model;
};
EnemyModelDatablock.set(Identifier.create("Enemy", 13), {
    model: striker
});
EnemyModelDatablock.set(Identifier.create("Enemy", 32), {
    model: striker
});
EnemyModelDatablock.set(Identifier.create("Enemy", 31), {
    model: striker
});
EnemyModelDatablock.set(Identifier.create("Enemy", 24), {
    model: striker
});
EnemyModelDatablock.set(Identifier.create("Enemy", 49), {
    model: striker
});

const bigStriker = (wrapper: EnemyModelWrapper, enemy: Enemy) => {
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
};
EnemyModelDatablock.set(Identifier.create("Enemy", 16), {
    model: bigStriker
});
EnemyModelDatablock.set(Identifier.create("Enemy", 28), {
    model: bigStriker
});
EnemyModelDatablock.set(Identifier.create("Enemy", 50), {
    model: bigStriker
});

const shooter = (wrapper: EnemyModelWrapper, enemy: Enemy) => {
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
};
EnemyModelDatablock.set(Identifier.create("Enemy", 26), {
    model: shooter
});
EnemyModelDatablock.set(Identifier.create("Enemy", 51), {
    model: shooter
});
EnemyModelDatablock.set(Identifier.create("Enemy", 11), {
    model: shooter
});

EnemyModelDatablock.set(Identifier.create("Enemy", 18), {
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

EnemyModelDatablock.set(Identifier.create("Enemy", 33), {
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

EnemyModelDatablock.set(Identifier.create("Enemy", 30), {
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

EnemyModelDatablock.set(Identifier.create("Enemy", 39), {
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

EnemyModelDatablock.set(Identifier.create("Enemy", 29), {
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: enemy.scale,
        });
        return model;
    }
});

const mum = (wrapper: EnemyModelWrapper, enemy: Enemy) => {
    const model = new HumanoidEnemyModel(wrapper);
    model.applySettings({
        scale: enemy.scale,
        rotOffset: {
            x: 0,
            y: 180,
            z: 0
        },
    });
    wrapper.tmpHeight = 1;
    return model;
};
EnemyModelDatablock.set(Identifier.create("Enemy", 36), {
    model: mum
});
EnemyModelDatablock.set(Identifier.create("Enemy", 37), {
    model: mum
});
EnemyModelDatablock.set(Identifier.create("Enemy", 55), {
    model: mum
});

EnemyModelDatablock.set(Identifier.create("Enemy", 46), {
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: enemy.scale * 1.5,
        });
        return model;
    }
});

EnemyModelDatablock.set(Identifier.create("Enemy", 47), {
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new HumanoidEnemyModel(wrapper);
        model.applySettings({
            scale: enemy.scale * 1.2,
        });
        return model;
    }
});

EnemyModelDatablock.set(Identifier.create("Enemy", 42), {
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new FlyerModel();
        const scale = 1.3 * enemy.scale;
        model.anchor.scale.set(scale, scale, scale);
        return model;
    }
});

EnemyModelDatablock.set(Identifier.create("Enemy", 45), {
    model: (wrapper: EnemyModelWrapper, enemy: Enemy) => {
        const model = new BigFlyerModel();
        const scale = enemy.scale;
        model.anchor.scale.set(scale, scale, scale);
        return model;
    }
});

const squid = (wrapper: EnemyModelWrapper, enemy: Enemy) => {
    const model = new SquidModel();
    const scale = enemy.scale;
    model.anchor.scale.set(scale, scale, scale);
    return model;
};
EnemyModelDatablock.set(Identifier.create("Enemy", 43), {
    model: squid
});
EnemyModelDatablock.set(Identifier.create("Enemy", 44), {
    model: squid
});

EnemyModelDatablock.set(Identifier.create("Enemy", 53), {
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

EnemyModelDatablock.set(Identifier.create("Enemy", 52), {
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

EnemyModelDatablock.set(Identifier.create("Enemy", 54), {
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
        wrapper.tmpHeight = 1;
        return model;
    }
});

EnemyModelDatablock.set(Identifier.create("Enemy", 56), {
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

EnemyModelDatablock.set(Identifier.create("Enemy", 62), {
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
