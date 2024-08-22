using Agents;
using Enemies;
using HarmonyLib;
using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;

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
            Replay.Spawn(new rEnemyAnimation(enemy));
        }

        public static void Despawn(EnemyAgent enemy) {
            if (!Replay.Active) return;

            Replay.TryDespawn<rEnemy>(enemy.GlobalID);
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

    [ReplayData("Vanilla.Enemy", "0.0.4")]
    internal class rEnemy : DynamicTransform {
        [HarmonyPatch]
        private static class Patches {

            [HarmonyPatch(typeof(EnemyAI), nameof(EnemyAI.Target), MethodType.Setter)]
            [HarmonyPrefix]
            private static void Prefix_SetTarget(EnemyAI __instance, AgentTarget value) {
                //if (__instance.m_mode != AgentMode.Agressive) return;
                if (value == null) return;
                if (__instance.m_target != null && value.m_agent.GlobalID == __instance.m_target.m_agent.GlobalID) return;

                PlayerAgent? player = value.m_agent.TryCast<PlayerAgent>();
                if (player != null) {
                    if (Replay.Has<rEnemy>(__instance.m_enemyAgent.GlobalID)) {
                        Replay.Get<rEnemy>(__instance.m_enemyAgent.GlobalID).targetPlayer = player;
                    }
                }
            }
        }
        public PlayerAgent? targetPlayer;

        public EnemyAgent agent;

        public rEnemy(EnemyAgent enemy) : base(enemy.GlobalID, new EnemyTransform(enemy)) {
            agent = enemy;
            pouncer = enemy.GetComponent<PouncerBehaviour>();
        }

        private bool _tagged => agent.IsTagged;
        private bool tagged = false;

        private byte _target {
            get {
                if (agent.AI == null || agent.AI.m_target == null || agent.AI.m_target.m_agent == null) return byte.MaxValue;
                PlayerAgent? player = agent.AI.m_target.m_agent.TryCast<PlayerAgent>();
                if (player == null) return byte.MaxValue;
                return (byte)player.PlayerSlotIndex;
            }
        }
        private byte target = byte.MaxValue;

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

        private byte _stagger {
            get {
                float stagger;
                // Pouncer uses a different measurement for stagger
                if (pouncer != null) {
                    stagger = pouncer.Dash.m_damageReceivedDuringState / 34.5f;
                } else {
                    stagger = agent.Damage.m_damBuildToHitreact / agent.EnemyBalancingData.Health.DamageUntilHitreact;
                }

                return (byte)(Mathf.Clamp01(stagger) * byte.MaxValue);
            }
        }
        private byte stagger = 0;

        private bool _canStagger {
            get {
                // Ppouncer uses a different measurement for stagger
                if (pouncer != null) {
                    return pouncer.CurrentState.ENUM_ID == pouncer.Dash.ENUM_ID;
                } else {
                    return true;
                }
            }
        }
        private bool canStagger = true;

        public override bool IsDirty =>
            base.IsDirty ||
            consumedPlayer != _consumedPlayer ||
            tagged != _tagged ||
            target != _target ||
            stagger != _stagger ||
            canStagger != _canStagger;

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);

            tagged = _tagged;
            BitHelper.WriteBytes(tagged, buffer);

            consumedPlayer = _consumedPlayer;
            BitHelper.WriteBytes(consumedPlayer, buffer);

            target = _target;
            BitHelper.WriteBytes(target, buffer);

            stagger = _stagger;
            BitHelper.WriteBytes(stagger, buffer);

            canStagger = _canStagger;
            BitHelper.WriteBytes(canStagger, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            // TODO(randomuserhi): Error handling on IDs larger than ushort.MaxValue

            base.Spawn(buffer);
            BitHelper.WriteBytes((ushort)agent.Locomotion.AnimHandleName, buffer);
            BitHelper.WriteHalf(agent.SizeMultiplier, buffer);
            BitHelper.WriteBytes(Identifier.From(agent), buffer);
            BitHelper.WriteHalf(agent.Damage.HealthMax, buffer);
        }
    }
}
