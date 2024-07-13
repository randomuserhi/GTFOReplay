import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { BoxGeometry, Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Factory } from "../../library/factory.js";
import { Ladder } from "../../parser/map/ladder.js";
import { ObjectWrapper } from "../objectwrapper.js";

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

class LadderModel extends ObjectWrapper<Group> {
    root: Group;

    constructor(ladder: Ladder) {
        super();
        this.root = new Group();

        const left = new Mesh(box, material);
        this.root.add(left);
        left.scale.set(0.5, ladder.height, 0.1);
        left.position.set(0, -ladder.height / 2, 0); 
        
        this.root.position.copy(ladder.top);
        this.root.quaternion.copy(ladder.rotation);
    }
}

ModuleLoader.registerRender("Vanilla.Ladders", (name, api) => {
    const initPasses = api.getInitPasses();
    api.setInitPasses([{ 
        name, pass: (renderer, header) => {
            const ladders = header.getOrDefault("Vanilla.Map.Ladders", Factory("Array"));
            const models = renderer.getOrDefault("Ladders", Factory("Array"));
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
            const ladders = snapshot.header.getOrDefault("Vanilla.Map.Ladders", Factory("Array"));
            const models = renderer.getOrDefault("Ladders", Factory("Array"));
            for (let i = 0; i < ladders.length; ++i) {
                models[i].setVisible(ladders[i].dimension === renderer.get("Dimension"));
            }
        } 
    }]);
});