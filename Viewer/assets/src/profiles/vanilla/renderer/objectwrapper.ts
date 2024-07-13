import { Object3D, Scene } from "@esm/three";

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