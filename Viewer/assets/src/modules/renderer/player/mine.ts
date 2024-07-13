import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { BufferGeometry, Color, ColorRepresentation, CylinderGeometry, Group, Mesh, MeshPhongMaterial, MeshStandardMaterial, Scene } from "@esm/three";
import { getPlayerColor } from "../../datablocks/player/player.js";
import { Factory } from "../../library/factory.js";
import { loadGLTF } from "../../library/modelloader.js";
import { Identifier } from "../../parser/identifier.js";
import { Mine } from "../../parser/player/mine.js";

declare module "@esm/@root/replay/moduleloader.js" {
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

class MineModel {
    readonly group: Group;

    readonly base: Group;
    readonly laser: Mesh;
    
    constructor(color: Color, item: Identifier) {
        this.group = new Group();

        const material = new MeshPhongMaterial({ color });
        
        const laserMaterial = new MeshStandardMaterial({ color });
        laserMaterial.transparent = true;
        laserMaterial.opacity = 0.5;
        laserMaterial.depthWrite = false;
        
        this.base = new Group();
        this.group.add(this.base);
        const apply = (model: BufferGeometry) => this.base.add(new Mesh(model, material));
        switch(item.id) {
        case 144: loadGLTF("../js3party/models/Consumables/ctrip.glb").then(apply); break;
        case 139: loadGLTF("../js3party/models/Consumables/emine.glb").then(apply); break;
        default: loadGLTF("../js3party/models/Consumables/depmine.glb").then(apply); break;
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
            const models = renderer.getOrDefault("Mine", Factory("Map"));
            const mines = snapshot.getOrDefault("Vanilla.Mine", Factory("Map"));
            const players = snapshot.getOrDefault("Vanilla.Player", Factory("Map"));
            for (const [id, mine] of mines) {
                if (!models.has(id)) {
                    let color: ColorRepresentation = 0xffffff;
                    if (players.has(mine.owner)) color = getPlayerColor(players.get(mine.owner)!.slot);
                    const model = new MineModel(new Color(color), mine.item);
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