import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Group, Mesh, MeshPhongMaterial, SphereGeometry } from "@esm/three";
import { Factory } from "../../library/factory.js";
import { SpitterState } from "../../parser/map/spitters.js";
import { ObjectWrapper } from "../objectwrapper.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Vanilla.Enemy.Spitters": void;
        }

        interface RenderData {
            "Spitters": Map<number, SpitterModel>;
        }
    }
}

const geometry = new SphereGeometry(1, 10, 10);
const bodyMaterial = new MeshPhongMaterial({
    color: 0xc3ebb7
});
const dimpleMaterial = new MeshPhongMaterial({
    color: 0x1b70ff
});

class SpitterModel extends ObjectWrapper<Group> {
    root: Group;

    group: Group;
    body: Group;
    dimples: Group;

    constructor() {
        super();
        this.root = new Group();

        const body = new Mesh(geometry, bodyMaterial);
        this.body = new Group();
        this.body.add(body);
        
        this.dimples = new Group();
        const dimples: Mesh[] = [];
        for (let i = 0; i < 6; ++i) {
            dimples.push(new Mesh(geometry, dimpleMaterial));
            dimples[i].scale.set(0.1, 0.1, 0.1);
        }

        body.scale.set(0.5, 0.5, 0.8);

        dimples[0].position.set(-0.3, 0.5, 0);
        dimples[1].position.set(0.3, 0.5, 0);

        dimples[2].position.set(-0.2, 0.4, 0.3);
        dimples[3].position.set(0.2, 0.4, 0.3);

        dimples[4].position.set(-0.2, 0.4, -0.3);
        dimples[5].position.set(0.2, 0.4, -0.3);

        this.dimples.add(...dimples);
        this.body.add(this.dimples);
    
        this.group = new Group();
        this.group.add(this.body);
        this.root.add(this.group);
    }

    public update(time: number, spitter: SpitterState) {
        const explodeAnimDuration = 0.6;
        const explodeTime = (time - spitter.lastExplodeTime) / 1000;
        const isExploding = explodeTime < explodeAnimDuration;
        if (isExploding) {
            const t = Math.clamp01(explodeTime / explodeAnimDuration);
            this.group.scale.set(1, 1, 1);
            
            const chargeUp = 0.4;
            if (t < chargeUp) {
                const scale = 0.5 * Math.clamp01(t / chargeUp) + 1;
                this.dimples.scale.set(scale, scale, scale);
            } else {
                this.dimples.scale.set(0, 0, 0);
            }

            return;
        }

        const currentTime = (time - spitter.lastStateTime) / 1000;
        switch (spitter.state) {
        case "Frozen":
        case "Retracted": {
            const animDuration = 0.5;
            const t = (1 - Math.clamp01(currentTime / animDuration));
            const scale = 0.2 * t + 0.8;
            this.group.scale.set(scale, scale, scale);

            const dscale = Math.min(this.dimples.scale.x, t);
            this.dimples.scale.set(dscale, dscale, dscale);
        } break;
        default: {
            const animDuration = 0.5;
            const t = Math.clamp01(currentTime / animDuration);
            const scale = 0.2 * t + 0.8;
            this.group.scale.set(scale, scale, scale);

            this.dimples.scale.set(t, t, t);
        } break;
        }
    }
}

ModuleLoader.registerRender("Vanilla.Enemy.Spitters", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot) => {
            const time = snapshot.time();
            const spitters = snapshot.header.getOrDefault("Vanilla.Enemy.Spitters", Factory("Map"));
            const states = snapshot.getOrDefault("Vanilla.Enemy.Spitters.State", Factory("Map"));
            const models = renderer.getOrDefault("Spitters", Factory("Map"));
            for (const [id, spitter] of spitters.entries()) {
                if (!models.has(id)) {
                    const model = new SpitterModel();
                    model.group.position.copy(spitter.position);
                    model.group.quaternion.copy(spitter.rotation);
                    model.group.scale.set(spitter.scale, spitter.scale, spitter.scale);

                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                const visible = spitter.dimension === renderer.get("Dimension");
                model.setVisible(visible);

                if (visible) {
                    const state = states.get(id);
                    if (state === undefined) continue;

                    model.update(time, state);
                }
            }
        } 
    }]);
});