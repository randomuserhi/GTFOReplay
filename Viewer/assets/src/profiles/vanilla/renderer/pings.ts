import { ModuleLoader } from "@esm/@root/replay/moduleloader.js";
import { Color, Mesh, MeshStandardMaterial, PlaneGeometry, Vector3 } from "@esm/three";
import { Text } from "@esm/troika-three-text";
import { getPlayerColor } from "../datablocks/player/player.js";
import { Factory } from "../library/factory.js";
import { loadTexture } from "../library/modelloader.js";
import { Model } from "../library/models/lib.js";
import { Ping, PingStyle } from "../parser/events/ping.js";
import { Camera } from "./renderer.js";

declare module "@esm/@root/replay/moduleloader.js" {
    namespace Typemap {
        interface RenderPasses {
            "Pings": void;
        }

        interface RenderData {
            "Pings": Map<number, PingModel>;
        }
    }
}

const defaultIcon = "../js3party/images/AppIcons_4.png";
const icons: Partial<Record<PingStyle, string>> = {
    "PlayerPingAmmo": "../js3party/images/icon_ammunitionpack.png",
    "PlayerPingConsumable": "../js3party/images/icon_consumables.png",
    "PlayerPingToolRefill": "../js3party/images/icon_toolrefillpack.png",
    "PlayerPingDisinfection": "../js3party/images/icon_disinfectionpack.png",
    "PlayerPingHealth": "../js3party/images/icon_medicalpack.png",

    "PlayerPingDoor": "../js3party/images/Icon_Basic_Door.png",
    "PlayerPingSecurityDoor": "../js3party/images/Icon_Security_Door.png",
    "PlayerPingApexDoor": "../js3party/images/Icon_Apex_Door.png",
    "PlayerPingBulkheadDoor": "../js3party/images/Icon_Bulkhead_Door.png",

    "PlayerPingSecurityCheckpointDoor": "../js3party/images/Icon_Security_Door.png",
    "PlayerPingApexCheckpointDoor": "../js3party/images/Icon_Apex_Door.png",
    "PlayerPingBulkheadCheckpointDoor": "../js3party/images/Icon_Bulkhead_Door.png",

    "PlayerPingTerminal": "../js3party/images/marker_terminal.png"
};

const geometry = new PlaneGeometry();
class PingModel extends Model<[ping: Ping, camera: Camera]> {
    private quad: Mesh;
    private material: MeshStandardMaterial;

    private tag?: Text;
    private label?: Text;
    
    constructor() {
        super();

        this.label = new Text();
        this.label.font = "./fonts/oxanium/Oxanium-SemiBold.ttf";
        this.label.fontSize = 0.5;
        this.label.textAlign = "center";
        this.label.anchorX = "center";
        this.label.anchorY = "bottom";
        this.label.color = 0xffffff;
        this.label.text = `Terminal Ping`;
        this.label.colorRanges = {
            0: 0xffffff,
        };
        this.label.material.depthTest = false;
        this.label.material.depthWrite = false;
        this.label.renderOrder = Infinity;
        this.label.position.set(0, 1.8, 0);
        this.root.add(this.label);

        this.tag = new Text();
        this.tag.font = "./fonts/oxanium/Oxanium-ExtraBold.ttf";
        this.tag.fontSize = 0.5;
        this.tag.textAlign = "center";
        this.tag.anchorX = "center";
        this.tag.anchorY = "bottom";
        this.tag.color = 0xffffff;
        this.tag.text = `·`;
        this.tag.colorRanges = {
            0: 0xffffff,
        };
        this.tag.material.depthTest = false;
        this.tag.material.depthWrite = false;
        this.tag.renderOrder = Infinity;
        this.tag.position.set(0, -0.2, 0);
        this.root.add(this.tag);

        this.material = new MeshStandardMaterial({
            color: new Color(0xffffff),
            transparent: true,
            depthTest: false,
            depthWrite: false
        });

        loadTexture(defaultIcon).then((texture) => {
            this.material.map = texture;
            this.quad = new Mesh(geometry, this.material);
            this.quad.renderOrder = Infinity;
            this.quad.position.set(0, 1, 0);
            this.root.add(this.quad);
        });
    }

    private static FUNC_render = {
        quadPos: new Vector3(),
        camPos: new Vector3(),
    } as const;
    public render(dt: number, time: number, ping: Ping, camera: Camera): void {
        this.setVisible(ping.visible);
        if (!this.isVisible()) return;

        const icon = icons[ping.style];
        if (icon !== undefined) {
            loadTexture(icon).then((texture) => { this.material.map = texture; });
        } else {
            loadTexture(defaultIcon).then((texture) => { this.material.map = texture; });
        }
        this.material.color.set(ping.slot !== 255 ? getPlayerColor(ping.slot) : 0xebab34);

        this.root.position.copy(ping.position);

        const { quadPos, camPos } = PingModel.FUNC_render;

        this.root.getWorldPosition(quadPos);
        camera.root.getWorldPosition(camPos);

        const lerp = Math.clamp01(camPos.distanceTo(quadPos) / 30);
        const scale = lerp * 0.5 + 0.2;
        this.quad.position.set(0, lerp * 0.5 + 1, 0);
        this.root.scale.set(scale, scale, 1);
        this.root.lookAt(camPos);
        
        if (this.label !== undefined) {
            this.label.text = ping.slot !== 255 ? "Player Ping" : "Terminal Ping";
            this.label.position.set(0, lerp * 0.5 + 1.8, 0);
            this.label.fontSize = lerp * 0.3 + 0.3;
        }
        if (this.tag !== undefined) this.tag.fontSize = lerp * 0.5 + 0.5;
    }

    public dispose(): void {
        this.tag?.dispose();
        this.tag = undefined;

        this.label?.dispose();
        this.label = undefined;
    }
}

ModuleLoader.registerRender("Pings", (name, api) => {
    const renderLoop = api.getRenderLoop();
    api.setRenderLoop([...renderLoop, { 
        name, pass: (renderer, snapshot, dt) => {
            const time = snapshot.time();
            const models = renderer.getOrDefault("Pings", Factory("Map"));
            const pings = snapshot.getOrDefault("Vanilla.Pings", Factory("Map"));
            const camera = renderer.get("Camera")!;
            for (const [id, ping] of pings) {
                if (!models.has(id)) {
                    const model = new PingModel();
                    models.set(id, model);
                    model.addToScene(renderer.scene);
                }

                const model = models.get(id)!;
                model.setVisible(ping.dimension === renderer.get("Dimension"));
                model.render(dt, time, ping, camera);
            }

            for (const [id, model] of [...models.entries()]) {
                if (!models.has(id)) {
                    model.removeFromScene(renderer.scene);
                    model.dispose();
                    models.delete(id);
                }
            }
        } 
    }]);
});