import { CanvasTexture, Color, Group, ImageLoader, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace } from "@esm/three";
import { BoosterCategory, BoosterDatablock, BoosterIcon } from "../../datablocks/boosters/boosters.js";
import { BoosterImplant } from "../../parser/player/boosters.js";

const imageLoader = new ImageLoader();

const textureCache = new Map<BoosterCategory, Map<BoosterIcon, Promise<CanvasTexture>>>();

async function createTexture(category: BoosterCategory, icon: BoosterIcon): Promise<CanvasTexture> {
    const backgroundImg = await imageLoader.loadAsync(BoosterCategory[category]);

    const iconSet = BoosterIcon[icon];
    const iconImg = await imageLoader.loadAsync(typeof iconSet === "string" ? iconSet : iconSet[category]);

    const canvas = document.createElement("canvas");
    canvas.width = backgroundImg.width;
    canvas.height = backgroundImg.height;

    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(backgroundImg, 0, 0);

    ctx.globalCompositeOperation = "source-over";

    const scale = 0.85;
    const iconWidth  = backgroundImg.width  * scale;
    const iconHeight = backgroundImg.height * scale;
    const iconX = (backgroundImg.width  - iconWidth)  / 2;
    const iconY = (backgroundImg.height - iconHeight) / 2;
    ctx.drawImage(iconImg, iconX, iconY - 25, iconWidth, iconHeight);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;

    return texture;
}

function getTexture(category: BoosterCategory, icon: BoosterIcon): Promise<CanvasTexture> {
    let categoryMap = textureCache.get(category);
    if (categoryMap === undefined) {
        categoryMap = new Map();
        textureCache.set(category, categoryMap);
    }
    
    let texture = categoryMap.get(icon);
    if (texture === undefined) {
        texture = createTexture(category, icon);
        categoryMap.set(icon, texture);
    }

    return texture;
}

const geometry = new PlaneGeometry();
export class BoosterModel {
    public root: Group = new Group();
    private quad: Mesh;
    private material: MeshBasicMaterial;
    
    constructor() {
        this.material = new MeshBasicMaterial({
            color: new Color(0xffffff),
            transparent: true
        });

        this.quad = new Mesh(geometry, this.material);
        this.quad.renderOrder = Infinity;
        this.quad.position.set(0, 1, 0);
        this.root.add(this.quad);
    }

    public update(implant: BoosterImplant, conditionMet: boolean) {
        const datablock = BoosterDatablock.get(implant.id);
        const category = datablock ? datablock.category : "Muted";
        const icon = datablock ? datablock.mainEffectType : "Damage";

        if (conditionMet) {
            this.material.opacity = 1;
        } else {
            this.material.opacity = 0.3;
        }

        getTexture(category, icon).then((texture) => {
            if (this.material.map != texture) {
                this.material.map = texture; 
                this.material.needsUpdate = true;
            }
        });
    }
}