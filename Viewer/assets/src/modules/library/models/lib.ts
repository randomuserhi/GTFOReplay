import { WeakCollection } from "@esm/@/rhu/weak.js";
import { Group, Scene, Sphere, Vector3, Vector3Like } from "@esm/three";
import { ObjectWrapper } from "../../renderer/objectwrapper.js";
import { Camera } from "../../renderer/renderer.js";

export class Model<T = any> extends ObjectWrapper<Group> {
    public static all = new WeakCollection<Model>();
    
    constructor() {
        super();

        this.root = new Group();
    }

    public render(dt: number, time: number, metadata: T) {
        
    }

    public addToScene(scene: Scene): void {
        super.addToScene(scene);
        Model.all.add(this);
    }

    public removeFromScene(scene: Scene): void {
        super.removeFromScene(scene);
        Model.all.delete(this);
    }
}

const FUNC_isCulled = {
    sphere: new Sphere(),
    diff: new Vector3()
} as const;
export function isCulled(position: Vector3Like, radius: number, camera: Camera) {
    if (radius === Infinity) {
        return false;
    }

    const { sphere, diff } = FUNC_isCulled;
    sphere.center.copy(position);
    sphere.radius = radius;
    if (camera.root.getWorldPosition(diff).sub(position).lengthSq() > camera.renderDistance * camera.renderDistance ||
        !camera.frustum.intersectsSphere(sphere)) {
        return true;
    }
    return false;
}