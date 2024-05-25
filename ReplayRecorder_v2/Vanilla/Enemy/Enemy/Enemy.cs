using Agents;
using Enemies;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;
using Vanilla.Specification;

namespace Vanilla.Enemy {
    internal static class EnemyReplayManager {
        public static void Spawn(EnemyAgent enemy) {
            if (!Replay.Active) return;

            Replay.Spawn(new rEnemy(enemy));
            Replay.Spawn(new rEnemyStats(enemy));
            Replay.Spawn(new rEnemyAnimation(enemy));
        }

        public static void Despawn(EnemyAgent enemy) {
            if (!Replay.Active) return;

            Replay.TryDespawn<rEnemy>(enemy.GlobalID);
            Replay.TryDespawn<rEnemyStats>(enemy.GlobalID);
            Replay.TryDespawn<rEnemyAnimation>(enemy.GlobalID);
        }
    }

    public struct EnemyTransform : IReplayTransform {
        private Agent agent;

        public bool active => agent != null;

        public byte dimensionIndex => (byte)agent.m_dimensionIndex;

        public Vector3 position => agent.transform.position;

        public Quaternion rotation => agent.transform.rotation;

        public EnemyTransform(Agent agent) {
            this.agent = agent;
        }
    }

    [ReplayData("Vanilla.Enemy", "0.0.1")]
    internal class rEnemy : DynamicTransform {
        public EnemyAgent agent;

        public rEnemy(EnemyAgent enemy) : base(enemy.GlobalID, new EnemyTransform(enemy)) {
            agent = enemy;
            pouncer = enemy.GetComponent<PouncerBehaviour>();
        }

        private PouncerBehaviour? pouncer;
        // NOTE(randomuserhi): For snatcher, unused for regular enemies
        private byte _consumedPlayer {
            get {
                if (pouncer == null) return byte.MaxValue;
                if (pouncer.CapturedPlayer == null) return byte.MaxValue;
                return (byte)pouncer.CapturedPlayer.PlayerSlotIndex;
            }
        }
        private byte consumedPlayer;

        public override bool IsDirty => base.IsDirty || consumedPlayer != _consumedPlayer;

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);

            consumedPlayer = _consumedPlayer;
            BitHelper.WriteBytes(consumedPlayer, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            base.Spawn(buffer);
            BitHelper.WriteBytes((ushort)agent.Locomotion.AnimHandleName, buffer);
            BitHelper.WriteHalf(agent.SizeMultiplier, buffer);
            BitHelper.WriteBytes(GTFOSpecification.GetEnemyType(agent.EnemyData.persistentID), buffer);
        }
    }
}
