using Enemies;
using ReplayRecorder;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;

namespace Vanilla.Enemy {
    internal static class EnemyReplayManager {
        public static void Spawn(EnemyAgent enemy) {
            Replay.Spawn(new rEnemy(enemy));
        }

        public static void Despawn(EnemyAgent enemy) {
            rEnemy rEnemy = new rEnemy(enemy);
            if (Replay.Has(rEnemy)) Replay.Despawn(rEnemy);
        }
    }

    [ReplayData("Vanilla.Enemy", "0.0.1")]
    internal class rEnemy : DynamicTransform {
        public EnemyAgent agent;

        public rEnemy(EnemyAgent enemy) : base(enemy.GlobalID, new AgentTransform(enemy)) {
            agent = enemy;
        }

        public override void Spawn(ByteBuffer buffer) {
            base.Spawn(buffer);
            // TODO(randomuserhi): Enemy Type
        }
    }
}
