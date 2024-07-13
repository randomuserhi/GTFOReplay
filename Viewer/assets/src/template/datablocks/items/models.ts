import { ColorRepresentation } from "@esm/three";
import { Datablock } from "../../../modules/datablocks/lib.js";
import { PlayerAnimDatablock } from "../../../modules/datablocks/player/animation.js";
import { Identifier } from "../../../modules/parser/identifier.js";
import { HumanAnimation } from "../../../modules/renderer/animations/human.js";
import { ItemModel } from "../../../modules/renderer/models/items.js";
import { ItemGLTFModel } from "../../../modules/renderer/models/prebuilt/itemGLTF.js";
import { Keycard } from "../../../modules/renderer/models/prebuilt/keycard.js";
import { Pack } from "../../../modules/renderer/models/prebuilt/pack.js";

export interface ItemArchetype {
    equipAnim?: HumanAnimation;
    throwAnim?: HumanAnimation;
    chargeAnim?: HumanAnimation;
    chargeIdleAnim?: HumanAnimation;
}

export interface ItemModelDatablock {
    model: () => ItemModel;
    archetype?: ItemArchetype;
}

export const ItemModelDatablock = new Datablock<Identifier, ItemModelDatablock>((identifier) => {
    if (identifier.type === "Unknown") return undefined;
    if (identifier.type !== "Item") throw new Error(`Identifier did not represent an item: ${identifier.hash}`);
    return identifier.id;
});

ItemModelDatablock.set(
    Identifier.create("Item", 102), {
        model: () => new Pack(0xff0000),
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 101), {
        model: () => new Pack(0x00ff00),
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 127), {
        model: () => new Pack(0x0000ff),
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 132), {
        model: () => new Pack(0x7b9fe8),
    },
);

const glowStickModel = () => {
    const model = new ItemGLTFModel("../js3party/models/Consumables/glowstick.glb", () => {
        model.gltf.rotation.set(90 * Math.deg2rad, 0, -90 * Math.deg2rad);
        model.gltf.position.set(0, 0.1, 0);
    });
    model.gltf.scale.set(0.02, 0.02, 0.02);

    model.equipOffsetPos = { x: 0, y: 0, z: 0 };
    model.leftHand = undefined;

    return model;
};
ItemModelDatablock.set(
    Identifier.create("Item", 114), {
        model: glowStickModel
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 174), {
        model: glowStickModel
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 30), {
        model: () => {
            const model = new ItemGLTFModel("../js3party/models/Consumables/long range flashlight.glb", () => {
                model.gltf.scale.set(0.07, 0.07, 0.07);
                model.gltf.rotation.set(0, 90 * Math.deg2rad, 0);
                model.gltf.position.set(0, 0.1, 0);
            });
            model.gltf.scale.set(0.1, 0.1, 0.1);
            model.gltf.rotateX(Math.PI);

            model.equipOffsetPos = { x: 0.07, y: 0, z: -0.15 };
            model.leftHandGrip = { x: 0.2, y: 0, z: 0 };
            model.offsetRot = { x: 0.707106829, y: 0, z: 0, w: 0.707106829 };

            return model;
        }
    },
);

const syringeModel = (color: ColorRepresentation) => {
    return () => {
        const model = new ItemGLTFModel("../js3party/models/Consumables/syringe.glb", () => {
            model.gltf.scale.set(0.08, 0.08, 0.08);
            model.gltf.rotation.set(0, 90 * Math.deg2rad, 90 * Math.deg2rad);
            model.gltf.position.set(0.05, 0.04, 0);
        });
        model.gltf.scale.set(0.1, 0.1, 0.1);
        model.gltf.rotateX(-90 * Math.deg2rad);
        model.material.color.set(color);

        model.equipOffsetPos = { x: 0, y: 0.1, z: -0.05 };
        model.leftHandGrip = { x: 0.05, y: -0.1, z: 0 };

        return model;
    };
};
ItemModelDatablock.set(
    Identifier.create("Item", 140), {
        model: syringeModel(0xff4444)
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 142), {
        model: syringeModel(0xffff00)
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 115), {
        model: () => {
            const model = new ItemGLTFModel("../js3party/models/Consumables/cnade.glb", () => {
                model.gltf.rotation.set(0, 0, 90 * Math.deg2rad);
                model.gltf.position.set(0, 0.1, 0);
            });
            model.gltf.scale.set(0.05, 0.05, 0.05);

            model.leftHand = undefined;
            model.equipOffsetPos = { x: 0, y: 0, z: 0 };

            return model;
        }
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 116), {
        model: () => {
            const model = new ItemGLTFModel("../js3party/models/Consumables/lock melter.glb", () => {
                model.gltf.position.set(0, 0.05, 0);
                model.gltf.rotation.set(0, 0, 90 * Math.deg2rad);
            });
            model.gltf.scale.set(0.04, 0.04, 0.04);
            
            model.equipOffsetPos = { x: 0.1, y: 0, z: 0 };
            model.leftHandGrip = { x: 0.1, y: 0, z: 0 };
            
            return model;
        }
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 117), {
        model: () => {
            const model = new ItemGLTFModel("../js3party/models/Consumables/fog rep.glb", () => {
                model.gltf.position.set(0, 0.05, 0);
            });
            model.gltf.scale.set(0.07, 0.07, 0.07);
            model.gltf.rotateY(90 * Math.deg2rad);

            model.equipOffsetPos = { x: 0.07, y: 0, z: 0 };
            model.leftHandGrip = { x: 0.1, y: 0, z: -0.1 };

            return model;
        },
        archetype: {
            equipAnim: PlayerAnimDatablock.obtain("Fogrepeller_Throw_Equip"),
            throwAnim: PlayerAnimDatablock.obtain("Fogrepeller_Throw"),
            chargeAnim: PlayerAnimDatablock.obtain("Fogrepeller_Throw_Charge"),
            chargeIdleAnim: PlayerAnimDatablock.obtain("Fogrepeller_Throw_Charge_Idle")
        },
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 139), {
        model: () => {
            const model = new ItemGLTFModel("../js3party/models/Consumables/emine.glb", () => {
                model.gltf.position.set(0, 0.05, 0);
            });
            model.gltf.scale.set(0.05, 0.05, 0.05);

            model.equipOffsetPos = { x: 0.07, y: 0, z: 0 };
            model.leftHandGrip = { x: 0.1, y: 0, z: -0.1 };

            return model;
        }
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 144), {
        model: () => {
            const model = new ItemGLTFModel("../js3party/models/Consumables/ctrip.glb", () => {
                model.gltf.position.set(0, 0.05, 0);
            });
            model.gltf.scale.set(0.05, 0.05, 0.05);

            model.equipOffsetPos = { x: 0.07, y: 0, z: 0 };
            model.leftHandGrip = { x: 0.1, y: 0, z: -0.1 };

            return model;
        }
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 131), {
        model: () => {
            const model = new ItemGLTFModel("../js3party/models/BigPickups/cell.glb", () => {
                model.gltf.rotation.set(-90 * Math.deg2rad, 0, 90 * Math.deg2rad);
                model.gltf.scale.set(0.07, 0.07, 0.07);
            });
            model.gltf.scale.set(0.04, 0.04, 0.04);
            model.gltf.rotateZ(Math.PI);

            model.equipOffsetPos = { x: 0, y: -0.17, z: -0.02 };
            model.leftHandGrip = { x: 0.1, y: -0.2, z: 0 };

            return model;
        }
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 133), {
        model: () => {
            const model = new ItemGLTFModel(".../js3party/models/BigPickups/fog turbine.glb");
            model.gltf.scale.set(0.2, 0.2, 0.2);
            model.gltf.rotation.set(0, 0, 0, "YXZ");

            model.equipOffsetPos = { x: 0.1, y: 0, z: 0 };
            model.leftHandGrip = { x: 0.2, y: 0, z: 0.1 };

            return model;
        }
    },
);

const neonateModel = () => {
    const model = new ItemGLTFModel("../js3party/models/BigPickups/neonate.glb");
    model.gltf.scale.set(0.1, 0.1, 0.1);
    model.gltf.rotation.set(-90 * Math.deg2rad, 180 * Math.deg2rad, -40 * Math.deg2rad);

    model.equipOffsetPos = { x: 0.1, y: -0.1, z: 0 };
    model.leftHandGrip = { x: 0.1, y: -0.1, z: 0.1 };

    return model;
};
ItemModelDatablock.set(
    Identifier.create("Item", 137), {
        model: neonateModel
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 141), {
        model: neonateModel
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 143), {
        model: neonateModel
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 170), {
        model: neonateModel
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 145), {
        model: neonateModel
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 175), {
        model: neonateModel
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 177), {
        model: neonateModel
    },
);

const matterWaveProjectorModel = () => {
    const model = new ItemGLTFModel("../js3party/models/BigPickups/matter wave projector.glb");
    model.gltf.scale.set(0.1, 0.1, 0.1);
    model.gltf.rotateZ(Math.PI);

    model.equipOffsetPos = { x: 0, y: -0.17, z: -0.02 };
    model.leftHandGrip = { x: 0.1, y: -0.2, z: 0 };

    return model;
};
ItemModelDatablock.set(
    Identifier.create("Item", 164), {
        model: matterWaveProjectorModel
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 166), {
        model: matterWaveProjectorModel
    },
);

const dataSphereModel = () => {
    const model = new ItemGLTFModel("../js3party/models/BigPickups/data sphere.glb");
    model.gltf.scale.set(0.13, 0.13, 0.13);
    model.gltf.rotation.set(0, 0, 0, "YXZ");

    model.equipOffsetPos = { x: 0.1, y: 0, z: 0 };
    model.leftHandGrip = { x: 0.2, y: 0, z: 0.1 };

    return model;
};
ItemModelDatablock.set(
    Identifier.create("Item", 151), {
        model: dataSphereModel
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 181), {
        model: dataSphereModel
    },
);

const cargoCrateModel = () => {
    const model = new ItemGLTFModel("../js3party/models/BigPickups/base cargo.glb");
    model.gltf.scale.set(0.1, 0.1, 0.1);
    model.gltf.rotateZ(Math.PI);
    model.gltf.rotateY(40 * Math.deg2rad);

    model.equipOffsetPos = { x: 0.1, y: -0.1, z: 0 };
    model.leftHandGrip = { x: 0.1, y: -0.1, z: 0.1 };

    return model;
};
ItemModelDatablock.set(
    Identifier.create("Item", 138), {
        model: cargoCrateModel
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 176), {
        model: cargoCrateModel
    },
);

const hisecCargoModel = () => {
    const model = new ItemGLTFModel("../js3party/models/BigPickups/hisec cargo.glb");
    model.gltf.scale.set(0.1, 0.1, 0.1);
    model.gltf.rotateZ(Math.PI);
    model.gltf.rotateY(40 * Math.deg2rad);

    model.equipOffsetPos = { x: 0.1, y: -0.1, z: 0 };
    model.leftHandGrip = { x: 0.1, y: -0.1, z: 0.1 };

    return model;
};
ItemModelDatablock.set(
    Identifier.create("Item", 154), {
        model: hisecCargoModel
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 155), {
        model: hisecCargoModel
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 148), {
        model: () => {
            const model = new ItemGLTFModel("../js3party/models/BigPickups/cryo.glb");
            model.gltf.scale.set(0.1, 0.1, 0.1);
            model.gltf.rotateY(130 * Math.deg2rad);
        
            model.equipOffsetPos = { x: 0.1, y: -0.1, z: 0 };
            model.leftHandGrip = { x: 0.1, y: -0.1, z: 0.1 };
        
            return model;
        }
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 173), {
        model: () => {
            const model = new ItemGLTFModel("../js3party/models/BigPickups/collection case.glb");
            model.gltf.scale.set(0.15, 0.15, 0.15);
            model.gltf.rotateY(130 * Math.deg2rad);
        
            model.equipOffsetPos = { x: 0.1, y: -0.1, z: 0 };
            model.leftHandGrip = { x: 0.1, y: -0.1, z: 0.1 };
        
            return model;
        }
    },
);

const datacubeModel = () => {
    const model = new ItemGLTFModel("../js3party/models/Objective/data cube.glb");
    model.gltf.scale.set(0.03, 0.03, 0.03);

    model.equipOffsetPos = { x: 0.1, y: 0, z: 0 };
    model.leftHandGrip = { x: 0.1, y: 0, z: 0 };

    return model;
};
ItemModelDatablock.set(
    Identifier.create("Item", 168), {
        model: datacubeModel
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 165), {
        model: datacubeModel
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 179), {
        model: datacubeModel
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 178), {
        model: datacubeModel
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 146), {
        model: () => {
            const model = new ItemGLTFModel("../js3party/models/Objective/bulkhead_key.glb", () => {
                model.gltf.position.set(0, 0.05, 0);
                model.gltf.rotation.set(-90 * Math.deg2rad, 0, 0);
            });
            model.gltf.scale.set(0.3, 0.3, 0.3);
        
            return model;
        }
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 27), {
        model: () => new Keycard(0xff0000)
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 85), {
        model: () => new Keycard(0x0000ff)
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 86), {
        model: () => new Keycard(0x00ff00)
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 87), {
        model: () => new Keycard(0xffff00)
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 88), {
        model: () => new Keycard(0xffffff)
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 89), {
        model: () => new Keycard(0x444444)
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 90), {
        model: () => new Keycard(0xaaaaaa)
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 91), {
        model: () => new Keycard(0xff8800)
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 92), {
        model: () => new Keycard(0xb300ff)
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 128), {
        model: () => {
            const model = new ItemGLTFModel("../js3party/models/Objective/id.glb", () => {
                model.gltf.position.set(0, 0.01, 0);
                model.gltf.rotation.set(0, 0, 90 * Math.deg2rad);
            });
        
            return model;
        }
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 129), {
        model: () => {
            const model = new ItemGLTFModel("../js3party/models/Objective/pdec.glb", () => {
                model.gltf.position.set(0, 0.1, 0);
            });
        
            return model;
        }
    },
);

const hardDriveModel = () => {
    const model = new ItemGLTFModel("../js3party/models/Objective/hdd.glb", () => {
        model.gltf.position.set(0, 0.05, 0);
        model.gltf.rotation.set(0, 0, -90 * Math.deg2rad);
    });

    return model;
};
ItemModelDatablock.set(
    Identifier.create("Item", 147), {
        model: hardDriveModel
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 180), {
        model: hardDriveModel
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 183), {
        model: hardDriveModel
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 149), {
        model: () => {
            const model = new ItemGLTFModel("../js3party/models/Objective/glp1.glb", () => {
                model.gltf.position.set(0, 0.1, 0);
                model.gltf.rotation.set(0, 0, 0);
            });

            return model;
        }
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 169), {
        model: () => {
            const model = new ItemGLTFModel("../js3party/models/Objective/glp2.glb", () => {
                model.gltf.position.set(0, 0.05, 0);
                model.gltf.rotation.set(90 * Math.deg2rad, 0, 0);
            });
        
            return model;
        }
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 150), {
        model: () => {
            const model = new ItemGLTFModel("../js3party/models/Objective/osip.glb", () => {
                model.gltf.position.set(0, 0.2, 0);
            });
        
            return model;
        }
    },
);

ItemModelDatablock.set(
    Identifier.create("Item", 153), {
        model: () => {
            const model = new ItemGLTFModel("../js3party/models/Objective/plant.glb", () => {
                model.gltf.position.set(0, 0.1, 0);
                model.gltf.rotation.set(0, 0, 90 * Math.deg2rad);
            });
        
            return model;
        }
    },
);

const memoryStickModel = () => {
    const model = new ItemGLTFModel("../js3party/models/Objective/mem stick.glb", () => {
        model.gltf.position.set(0, 0.1, 0);
        model.gltf.rotation.set(0, 0, 90 * Math.deg2rad);
    });

    return model;
};
ItemModelDatablock.set(
    Identifier.create("Item", 171), {
        model: memoryStickModel
    },
);
ItemModelDatablock.set(
    Identifier.create("Item", 172), {
        model: memoryStickModel
    },
);