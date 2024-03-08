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

            rEnemy rEnemy = new rEnemy(enemy);
            if (Replay.Has(rEnemy)) Replay.Despawn(rEnemy);

            rEnemyModel rModel = new rEnemyModel(enemy);
            if (Replay.Has(rModel)) Replay.Despawn(rModel);
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
