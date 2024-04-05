import { CylinderGeometry, Group, Mesh, MeshPhongMaterial, Scene } from "three";
import * as BitHelper from "../../../replay/bithelper.js";
import { ModuleLoader } from "../../../replay/moduleloader.js";
import * as Pod from "../../../replay/pod.js";
import { DynamicPosition } from "../../replayrecorder.js";

declare module "../../../replay/moduleloader.js" {
    namespace Typemap {
        interface Dynamics {
            "Vanilla.Bioscan": {
                parse: {
                    dimension: number; 
                    absolute: boolean;
                    position: Pod.Vector;
                };
                spawn: {
                    dimension: number;
                    position: Pod.Vector;
                    radius: number;
                };
                despawn: void;
            };

            "Vanilla.Bioscan.Status": {
                parse: {
                    progress: number;
                    r: number;
                    g: number;
                    b: number;
                    slot0: boolean;
                    slot1: boolean;
                    slot2: boolean;
                    slot3: boolean;
                };
                spawn: {
                    progress: number;
                    r: number;
                    g: number;
                    b: number;
                };
                despawn: void;
            };
        }

        interface Data {
            "Vanilla.Bioscan": Map<number, Bioscan>
            "Vanilla.Bioscan.Status": Map<number, BioscanStatus>;
        }
    }
}

export interface Bioscan extends DynamicPosition {
    radius: number;
}

export interface BioscanStatus {
    id: number;
    color: number;
    progress: number;
    slot0: boolean;
    slot1: boolean;
    slot2: boolean;
    slot3: boolean;
}

ModuleLoader.registerDynamic("Vanilla.Bioscan", "0.0.1", {
    main: {
        parse: async (data) => {
            const result = await DynamicPosition.parse(data);
            return result;
        }, 
        exec: (id, data, snapshot, lerp) => {
            const scans = snapshot.getOrDefault("Vanilla.Bioscan", () => new Map());
    
            if (!scans.has(id)) throw new BioscanNotFound(`Bioscan of id '${id}' was not found.`);
            const scan = scans.get(id)!;
            DynamicPosition.lerp(scan, data, lerp);
        }
    },
    spawn: {
        parse: async (data) => {
            const spawn = await DynamicPosition.parseSpawn(data);
            const result = {
                ...spawn,
                radius: await BitHelper.readHalf(data)
            };
            return result;
        },
        exec: (id, data, snapshot) => {
            const scans = snapshot.getOrDefault("Vanilla.Bioscan", () => new Map());
        
            if (scans.has(id)) throw new DuplicateBioscan(`Bioscan of id '${id}' already exists.`);
            scans.set(id, { id, ...data });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const scans = snapshot.getOrDefault("Vanilla.Bioscan", () => new Map());

            if (!scans.has(id)) throw new BioscanNotFound(`Bioscan of id '${id}' did not exist.`);
            scans.delete(id);
        }
    }
});

ModuleLoader.registerDynamic("Vanilla.Bioscan.Status", "0.0.1", {
    main: {
        parse: async (data) => {
            return {
                progress: await BitHelper.readByte(data) / 255,
                r: await BitHelper.readByte(data),
                g: await BitHelper.readByte(data),
                b: await BitHelper.readByte(data),
                slot0: await BitHelper.readBool(data),
                slot1: await BitHelper.readBool(data),
                slot2: await BitHelper.readBool(data),
                slot3: await BitHelper.readBool(data),
            };
        }, 
        exec: (id, data, snapshot, lerp) => {
            const scans = snapshot.getOrDefault("Vanilla.Bioscan.Status", () => new Map());
    
            const { progress, r, g, b } = data;
            if (!scans.has(id)) throw new BioscanNotFound(`Bioscan status of id '${id}' was not found.`);
            const scan = scans.get(id)!;
            scan.color = (r << 16) | (g << 8) | b;
            scan.progress += (progress - scan.progress) * lerp;
            scan.slot0 = data.slot0;
            scan.slot1 = data.slot1;
            scan.slot2 = data.slot2;
            scan.slot3 = data.slot3;
        }
    },
    spawn: {
        parse: async (data) => {
            return {
                progress: await BitHelper.readByte(data) / 255,
                r: await BitHelper.readByte(data),
                g: await BitHelper.readByte(data),
                b: await BitHelper.readByte(data)
            };
        },
        exec: (id, data, snapshot) => {
            const scans = snapshot.getOrDefault("Vanilla.Bioscan.Status", () => new Map());
        
            const { progress, r, g, b } = data;
            const color = (r << 16) | (g << 8) | b;
            if (scans.has(id)) throw new DuplicateBioscan(`Bioscan status of id '${id}' already exists.`);
            scans.set(id, { 
                id, progress, color, 
                slot0: false, slot1: false, slot2: false, slot3: false 
            });
        }
    },
    despawn: {
        parse: async () => {
        }, 
        exec: (id, data, snapshot) => {
            const scans = snapshot.getOrDefault("Vanilla.Bioscan.Status", () => new Map());

            if (!scans.has(id)) throw new BioscanNotFound(`Bioscan status of id '${id}' did not exist.`);
            scans.delete(id);
        }
    }
});

export class BioscanNotFound extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DuplicateBioscan extends Error {
    constructor(message?: string) {
        super(message);
    }
}

// --------------------------- RENDERING ---------------------------


declare module "../../../replay/moduleloader.js" {
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