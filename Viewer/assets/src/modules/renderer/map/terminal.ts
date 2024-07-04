import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { BoxGeometry, Group, Mesh, MeshPhongMaterial, Scene } from "@esm/three";
import { Terminal } from "../../parser/map/terminal.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.Terminals": void;
        }

        interface RenderData {
            "Terminals": Map<number, TerminalModel>;
        }
    }
}

const box = new BoxGeometry(1, 1, 1);
const material = new MeshPhongMaterial({
    color: 0x97aa94
});

class TerminalModel {
    group: Group;

    constructor(terminal: Terminal) {
        this.group = new Group();

        const gun = new Group();

        const obj0 = new Mesh(box, material);
        gun.add(obj0);
        obj0.scale.set(0.1426928, 0.7858326, 1.34994);
        obj0.position.set(0, 0.09000015, 0.6210022);
        obj0.rotateY(1.570796);
        obj0.rotateZ(5.525794);

        const obj1 = new Mesh(box, material);
        gun.add(obj1);
        obj1.scale.set(0.2203296, 1.670003, 1.678397);
        obj1.position.set(0, 1.248, 0.4529991);
        obj1.rotateY(1.570796);
        obj1.rotateZ(6.173479);

        const obj2 = new Mesh(box, material);
        gun.add(obj2);
        obj2.scale.set(0.5224117, 2.080864, 1.34994);
        obj2.position.set(0, -1.2025, 0.5830994);
        obj2.rotateY(1.570796);

        const obj3 = new Mesh(box, material);
        gun.add(obj3);
        obj3.scale.set(0.7552825, 4.486043, 1.996835);
        obj3.position.set(0, 0, -0.04199982);
        obj3.rotateY(1.570796);
        
        this.group.add(gun);
        gun.scale.set(0.6, 0.4, 0.4);
        gun.position.set(0, 2.5 * 0.4, 0);
        this.group.position.copy(terminal.position);
        this.group.quaternion.copy(terminal.rotation);
    }

    public addToScene(scene: Scene) {
        scene.add(this.group);
    }

    public setVisible(visible: boolean) {
        this.group.visible = visible;
    }
}

ModuleLoader.registerRender("Vanilla.Terminals", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const terminals = snapshot.header.getOrDefault("Vanilla.Map.Terminals", () => new Map());
            const models = renderer.getOrDefault("Terminals", () => new Map());
            for (const [id, terminal] of terminals.entries()) {
                if (!models.has(id)) {
                    const model = new TerminalModel(terminal);
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.setVisible(terminal.dimension === renderer.get("Dimension"));
            }
        } 
    }]);
});