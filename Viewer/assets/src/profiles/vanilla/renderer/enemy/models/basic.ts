import { Model } from "../../../library/models/lib.js";
import { Enemy } from "../../../parser/enemy/enemy.js";
import { BasicModel } from "../../models/basicModel.js";

export class BasicEnemyModel extends Model {
    private readonly shape: BasicModel;
    constructor(enemy: Enemy, error: unknown) {
        super();
        this.shape = new BasicModel(`enemy ${enemy.type.hash}`, error, [.8, 2, .8]);
        this.root.add(this.shape);
        this.root.scale.setScalar(enemy.scale);
        this.cullingRadius = Math.max(2, 2 * enemy.scale);
        this.render(0, 0, enemy);
    }
    override render(_dt: number, _time: number, enemy: Enemy) {
        this.root.position.copy(enemy.position);
        this.root.quaternion.copy(enemy.rotation);
    }
    override dispose() { this.shape.dispose(); this.root.removeFromParent(); }
}
