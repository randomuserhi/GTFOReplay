import { Group, Sphere, Vector3Like } from "@esm/three";
import { ModelGroup, ObjectWrapper } from "../../renderer/objectwrapper.js";
import { Camera } from "../../renderer/renderer.js";

export class Model<T extends any[] = any[]> extends ObjectWrapper<Group> {
    public cullingRadius = 2;
    constructor() {
        super();

        this.root = new ModelGroup();
    }

    public render(dt: number, time: number, ...params: T) {
        
    }

    public dispose() {
        
    }
}

const FUNC_isCulled = {
    sphere: new Sphere()
} as const;
export function isCulled(position: Vector3Like, radius: number, camera: Camera) {
    if (radius === Infinity) {
        return false;
    }

    const { sphere } = FUNC_isCulled;
    sphere.center.copy(position);
    sphere.radius = radius;
    // Test the nearest edge, so a large room does not vanish while its floor
    // still intersects the viewing distance.
    const renderDistance = camera.renderDistance() + radius;
    if (camera.worldPosition.distanceToSquared(sphere.center) > renderDistance * renderDistance ||
        !camera.frustum.intersectsSphere(sphere)) {
        return true;
    }
    return false;
}
