import { BufferGeometry, Color, ColorRepresentation, CylinderGeometry, Group, Material, Mesh, MeshPhongMaterial, MeshStandardMaterial, Object3D, Scene } from "three";
import { ModuleLoader } from "../../replay/moduleloader.js";
import { Mine, MineType } from "../parser/mine.js";
import { loadGLTF } from "./modeloader.js";

declare module "../../replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Mine": void;
        }

        interface RenderData {
            "Mine": Map<number, MineModel>;
        }
    }
}

const cylinder = new CylinderGeometry(1, 1, 1, 10, 10).translate(0, 0.5, 0).rotateX(Math.PI * 0.5);

let consumableMineAsset: BufferGeometry | undefined = undefined;
loadGLTF("../js3party/models/Consumables/emine.glb").then((model) => {
    consumableMineAsset = model;
    for (const { parent, material } of waitingConsumable) {
        parent.add(new Mesh(consumableMineAsset, material));
    }
});
const waitingConsumable: { parent: Object3D, material: Material }[] = [];
function getConsumableMineAsset(parent: Object3D, material: Material) {
    if (consumableMineAsset === undefined) {
        waitingConsumable.push({ parent, material });
    } else {
        parent.add(new Mesh(consumableMineAsset, material));
    }
}

let deployableMineAsset: BufferGeometry | undefined = undefined;
loadGLTF("../js3party/models/Consumables/depmine.glb").then((model) => {
    deployableMineAsset = model;
    for (const { parent, material } of waitingDeployable) {
        parent.add(new Mesh(deployableMineAsset, material));
    }
});
const waitingDeployable: { parent: Object3D, material: Material }[] = [];
function getDeployableMineAsset(parent: Object3D, material: Material) {
    if (deployableMineAsset === undefined) {
        waitingDeployable.push({ parent, material });
    } else {
        parent.add(new Mesh(deployableMineAsset, material));
    }
}

let cfoamMineAsset: BufferGeometry | undefined = undefined;
loadGLTF("../js3party/models/Consumables/ctrip.glb").then((model) => {
    cfoamMineAsset = model;
    for (const { parent, material } of waitingCfoam) {
        parent.add(new Mesh(cfoamMineAsset, material));
    }
});
const waitingCfoam: { parent: Object3D, material: Material }[] = [];
function getCfoamMineAsset(parent: Object3D, material: Material) {
    if (cfoamMineAsset === undefined) {
        waitingCfoam.push({ parent, material });
    } else {
        parent.add(new Mesh(cfoamMineAsset, material));
    }
}

class MineModel {
    readonly group: Group;

    readonly base: Group;
    readonly laser: Mesh;
    
    constructor(color: Color, type: MineType) {
        this.group = new Group();

        const material = new MeshPhongMaterial({ color });
        
        const laserMaterial = new MeshStandardMaterial({ color });
        laserMaterial.transparent = true;
        laserMaterial.opacity = 0.5;
        
        this.base = new Group();
        this.group.add(this.base);
        switch(type) {
        case "Explosive": getDeployableMineAsset(this.base, material); break;
        case "Cfoam": getCfoamMineAsset(this.base, material); break;
        case "ConsumableExplosive": getConsumableMineAsset(this.base, material); break;
        }
        this.base.scale.set(0.05, 0.05, 0.05);
        this.base.rotateX(90 * Math.deg2rad);
        
        this.laser = new Mesh(cylinder, laserMaterial);
        this.group.add(this.laser);
    }

    public update(mine: Mine) {
        this.group.quaternion.copy(mine.rotation);
        this.group.position.copy(mine.position);

        this.laser.scale.set(0.03, 0.03, mine.length);
    }

    public setVisible(visible: boolean) {
        this.group.visible = visible;
    }

    public addToScene(scene: Scene) {
        scene.add(this.group);
    }

    public removeFromScene(scene: Scene) {
        scene.remove(this.group);
    }
}

ModuleLoader.registerRender("Mine", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Mine", () => new Map());
            const mines = snapshot.getOrDefault("Vanilla.Mine", () => new Map());
            for (const [id, mine] of mines) {
                if (!models.has(id)) {
                    let color: ColorRepresentation;
                    switch(mine.type) {
                    case "Cfoam": color = 0x0000ff; break;
                    default: color = 0xff0000; break;
                    }
                    const model = new MineModel(new Color(color), mine.type);
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.update(mine);
                model.setVisible(mine.dimension === renderer.get("Dimension"));
            }

            for (const [id, model] of [...models.entries()]) {
                if (!mines.has(id)) {
                    model.removeFromScene(renderer.scene);
                    models.delete(id);
                }
            }
        } 
    }]);
});