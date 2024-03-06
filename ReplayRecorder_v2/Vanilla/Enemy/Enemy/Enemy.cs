using Enemies;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;

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

    public struct EnemyAgentTranform : IReplayTransform {
        private EnemyAgent agent;

        public bool active => agent != null;

        public byte dimensionIndex => (byte)agent.m_dimensionIndex;

        public Vector3 position => agent.transform.position;

        public Quaternion rotation => agent.ModelRef.m_headBone != null ? Quaternion.LookRotation(agent.ModelRef.m_headBone.rotation * Vector3.right) : Quaternion.LookRotation(agent.TargetLookDir);

        public EnemyAgentTranform(EnemyAgent agent) {
            this.agent = agent;
        }
    }

    [ReplayData("Vanilla.Enemy", "0.0.1")]
    internal class rEnemy : DynamicTransform {
        public EnemyAgent agent;

        public rEnemy(EnemyAgent enemy) : base(enemy.GlobalID, new EnemyAgentTranform(enemy)) {
            agent = enemy;
        }

        public override void Spawn(ByteBuffer buffer) {
            base.Spawn(buffer);
            BitHelper.WriteBytes((ushort)agent.Locomotion.AnimHandleName, buffer);
            // TODO(randomuserhi): Enemy Type (agent.EnemyData.persistentID)
        }
    }
}
