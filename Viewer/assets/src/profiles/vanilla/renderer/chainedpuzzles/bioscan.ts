import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { CylinderGeometry, Group, Mesh, MeshPhongMaterial } from "@esm/three";
import { Factory } from "../../library/factory.js";
import { Bioscan, BioscanStatus } from "../../parser/chainedpuzzle/bioscan.js";
import { ObjectWrapper } from "../objectwrapper.js";

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

class BioscanModel extends ObjectWrapper<Group> {
    readonly root: Group;

    readonly base: Mesh;
    readonly progress: Mesh;
    
    constructor() {
        super();
        this.root = new Group();

        const progressMaterial = new MeshPhongMaterial({ color: 0xffffff });
        progressMaterial.transparent = true;
        progressMaterial.opacity = 0.5;
        progressMaterial.depthWrite = false;
        this.progress = new Mesh(cylinder, progressMaterial);

        const material = new MeshPhongMaterial({ color: 0xffffff });
        material.transparent = true;
        material.opacity = 0.5;
        material.depthWrite = false;

        this.base = new Mesh(cylinder, material);
        this.base.add(this.progress);
        this.root.add(this.base);
        this.base.scale.set(1, 0.05, 1);
        this.progress.scale.set(0, 0.8, 0);
    }

    public update(bioscan: Bioscan) {
        this.root.position.set(bioscan.position.x, bioscan.position.y, bioscan.position.z);

        this.base.scale.set(bioscan.radius, 0.5, bioscan.radius);
    }

    public morph(status: BioscanStatus) {
        (this.base.material as MeshPhongMaterial).color.set(status.color);
        (this.progress.material as MeshPhongMaterial).color.set(status.color);
        this.progress.scale.set(status.progress, status.progress * 0.2 + 0.8, status.progress);
    }
}

ModuleLoader.registerRender("Bioscan", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const models = renderer.getOrDefault("Bioscan", Factory("Map"));
            const scans = snapshot.getOrDefault("Vanilla.Bioscan", Factory("Map"));
            const details = snapshot.getOrDefault("Vanilla.Bioscan.Status", Factory("Map"));
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