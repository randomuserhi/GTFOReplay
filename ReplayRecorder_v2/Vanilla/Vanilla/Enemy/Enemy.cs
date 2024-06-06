using Agents;
using Enemies;
using HarmonyLib;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;
using Vanilla.Specification;

namespace Vanilla.Enemy {
    [HarmonyPatch]
    internal static class EnemyReplayManager {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnSpawn))]
            [HarmonyPostfix]
            private static void OnSpawn(EnemySync __instance, pEnemySpawnData spawnData) {
                Spawn(__instance.m_agent/*, spawnData.mode*/);
            }
            [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnDespawn))]
            [HarmonyPostfix]
            private static void OnDespawn(EnemySync __instance) {
                Despawn(__instance.m_agent);
            }
            [HarmonyPatch(typeof(EnemyBehaviour), nameof(EnemyBehaviour.ChangeState), new Type[] { typeof(EB_States) })]
            [HarmonyPrefix]
            private static void Behaviour_ChangeState(EnemyBehaviour __instance, EB_States state) {
                if (__instance.m_currentStateName != state && state == EB_States.Dead) {
                    Despawn(__instance.m_ai.m_enemyAgent);
                    return;
                }
            }
        }

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

        private bool _tagged => agent.IsTagged;
        private bool tagged = false;

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

        public override bool IsDirty => base.IsDirty || consumedPlayer != _consumedPlayer || tagged != _tagged;

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);

            tagged = _tagged;
            BitHelper.WriteBytes(tagged, buffer);

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
