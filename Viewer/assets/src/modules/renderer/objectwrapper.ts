import { Object3D, Scene } from "@esm/three";

export abstract class ObjectWrapper<T extends Object3D> {
    public root: T;

    public addToScene(scene: Scene) {
        scene.add(this.root);
    }

    public removeFromScene(scene: Scene) {
        scene.add(this.root);
    }
}