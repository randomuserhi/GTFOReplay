/*using Enemies;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;

namespace Vanilla.Enemy {
    [ReplayData("Vanilla.Enemy.Stats", "0.0.1")]
    internal class rEnemyStats : ReplayDynamic {
        public EnemyAgent agent;

        int id;
        public override int Id => id;

        public override bool Active {
            get {
                if (agent == null && Replay.Has<rEnemyStats>(Id)) {
                    Replay.Despawn(Replay.Get<rEnemyStats>(Id));
                }
                return agent != null;
            }
        }
        public override bool IsDirty => false;

        public rEnemyStats(EnemyAgent enemy) {
            id = enemy.GlobalID;
            this.agent = enemy;
        }

        public override void Write(ByteBuffer buffer) {
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }
}
*/