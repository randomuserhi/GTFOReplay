import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Color, ColorRepresentation, CylinderGeometry, Group, Mesh, MeshStandardMaterial, Scene } from "@esm/three";
import { MineInstanceDatablock } from "../../datablocks/items/mineinstance.js";
import { getPlayerColor } from "../../datablocks/player/player.js";
import { Factory } from "../../library/factory.js";
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
    
    constructor(playerColor: Color, item: Identifier) {
        this.group = new Group();

        let datablock = MineInstanceDatablock.get(item);
        if (datablock === undefined) {
            datablock = MineInstanceDatablock.obtain(Identifier.unknown);
        }

        const laserMaterial = new MeshStandardMaterial({ color: datablock.laserColor === undefined ? 0xff0000 : datablock.laserColor });
        laserMaterial.transparent = true;
        laserMaterial.opacity = 0.5;
        laserMaterial.depthWrite = false;
        
        this.base = new Group();
        this.group.add(this.base);
        if (datablock.model !== undefined) datablock.model(this.base, playerColor);
        
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