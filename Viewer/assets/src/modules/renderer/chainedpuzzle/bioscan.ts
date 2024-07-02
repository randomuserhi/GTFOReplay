import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { CylinderGeometry, Group, Mesh, MeshPhongMaterial, Scene } from "@esm/three";
import { Bioscan, BioscanStatus } from "../../parser/chainedpuzzle/bioscan.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Bioscan": void;
        }

        interface RenderData {
            "Bioscan": Map<number, BioscanModel>;
        }
    }
}

const cylinder = new CylinderGeometry(1, 1, 1, 20, 20).translate(0, 0.5, 0);

class BioscanModel {
    readonly group: Group;

    readonly base: Mesh;
    
    constructor() {
        this.group = new Group();

        const material = new MeshPhongMaterial({ color: 0xffffff });
        material.transparent = true;
        material.opacity = 0.5;
        material.depthWrite = false;
        
        this.base = new Mesh(cylinder, material);
        this.group.add(this.base);
        this.base.scale.set(1, 0.05, 1);
    }

    public update(bioscan: Bioscan) {
        this.group.position.set(bioscan.position.x, bioscan.position.y, bioscan.position.z);

        this.base.scale.set(bioscan.radius, 0.5, bioscan.radius);
        
    }

    public morph(status: BioscanStatus) {
        (this.base.material as MeshPhongMaterial).color.set(status.color);
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

ModuleLoader.registerRender("Bioscan", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Bioscan", () => new Map());
            const scans = snapshot.getOrDefault("Vanilla.Bioscan", () => new Map());
            const details = snapshot.getOrDefault("Vanilla.Bioscan.Status", () => new Map());
            for (const [id, scan] of scans) {
                if (!models.has(id)) {
                    const model = new BioscanModel();
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.update(scan);
                const detail = details.get(id);
                if (detail !== undefined) {
                    model.morph(detail);
                }
                model.setVisible(scan.dimension === renderer.get("Dimension"));
            }

            for (const [id, model] of [...models.entries()]) {
                if (!scans.has(id)) {
                    model.removeFromScene(renderer.scene);
                    models.delete(id);
                }
            }
        } 
    }]);
});