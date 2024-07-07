import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { BoxGeometry, Group, Mesh, MeshPhongMaterial, Scene } from "@esm/three";
import { Ladder } from "../../parser/map/ladder.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.Ladders": void;
        }

        interface RenderData {
            "Ladders": LadderModel[];
        }
    }
}

const box = new BoxGeometry(1, 1, 1);
const material = new MeshPhongMaterial({
    color: 0x97aa94
});

class LadderModel {
    group: Group;

    constructor(ladder: Ladder) {
        this.group = new Group();

        const left = new Mesh(box, material);
        this.group.add(left);
        left.scale.set(0.5, ladder.height, 0.1);
        left.position.set(0, -ladder.height / 2, 0); 
        
        this.group.position.copy(ladder.top);
        this.group.quaternion.copy(ladder.rotation);
    }

    public addToScene(scene: Scene) {
        scene.add(this.group);
    }

    public setVisible(visible: boolean) {
        this.group.visible = visible;
    }
}

ModuleLoader.registerRender("Vanilla.Ladders", (name, api) => {
    const initPasses = api.getInitPasses();
    api.setInitPasses([{ 
        name, pass: (renderer, header) => {
            const ladders = header.getOrDefault("Vanilla.Map.Ladders", () => []);
            const models = renderer.getOrDefault("Ladders", () => []);
            for (const ladder of ladders) {
                const model = new LadderModel(ladder);
                model.addToScene(renderer.scene);
                models.push(model);
            }
        } 
    }, ...initPasses]);

    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const ladders = snapshot.header.getOrDefault("Vanilla.Map.Ladders", () => []);
            const models = renderer.getOrDefault("Ladders", () => []);
            for (let i = 0; i < ladders.length; ++i) {
                models[i].setVisible(ladders[i].dimension === renderer.get("Dimension"));
            }
        } 
    }]);
});