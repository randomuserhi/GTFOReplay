using Enemies;
using ReplayRecorder;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;

namespace Vanilla.Enemy {
    internal static class EnemyReplayManager {
        public static void Spawn(EnemyAgent enemy) {
            if (!Replay.Active) return;

            Replay.Spawn(new rEnemy(enemy));
            if (rEnemyModel.isValid(enemy)) Replay.Spawn(new rEnemyModel(enemy));
        }

        public static void Despawn(EnemyAgent enemy) {
            if (!Replay.Active) return;

            if (Replay.Has<rEnemy>(enemy.GlobalID)) Replay.Despawn(Replay.Get<rEnemy>(enemy.GlobalID));
            if (Replay.Has<rEnemyModel>(enemy.GlobalID)) Replay.Despawn(Replay.Get<rEnemyModel>(enemy.GlobalID));
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
            BitHelper.WriteBytes((ushort)agent.Locomotion.AnimHandleName, buffer);
            // TODO(randomuserhi): Enemy Type (agent.EnemyData.persistentID)
        }
    }
}
