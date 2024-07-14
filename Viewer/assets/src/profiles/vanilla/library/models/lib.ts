import { Group, Sphere, Vector3, Vector3Like } from "@esm/three";
import { ObjectWrapper } from "../../renderer/objectwrapper.js";
import { Camera } from "../../renderer/renderer.js";

export class Model<T extends any[] = any[]> extends ObjectWrapper<Group> {
    constructor() {
        super();

        this.root = new Group();
    }

    public render(dt: number, time: number, ...params: T) {
        
    }

    public dispose() {
        
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
    const renderDistance = camera.renderDistance();
    if (camera.root.getWorldPosition(diff).sub(position).lengthSq() > renderDistance * renderDistance ||
        !camera.frustum.intersectsSphere(sphere)) {
        return true;
    }
    return false;
}