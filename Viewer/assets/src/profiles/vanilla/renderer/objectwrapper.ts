import { Group, Object3D, Scene } from "@esm/three";

// Three normally updates hidden hierarchies. Culled models only need automatic
// world updates when visible again; explicit world-space queries still work.
export class ModelGroup extends Group {
    override updateMatrixWorld(force?: boolean) {
        if (this.visible) super.updateMatrixWorld(force);
    }
}

export abstract class ObjectWrapper<T extends Object3D> {
    public root: T;

    public removeFromParent() {
        this.root.removeFromParent();
    }

    public addToScene(scene: Scene) {
        scene.add(this.root);
    }

    public removeFromScene(scene: Scene) {
        scene.remove(this.root);
    }

    public setVisible(visible: boolean) {
        this.root.visible = visible;
    }

    public isVisible() {
        return this.root.visible;
    }
}
