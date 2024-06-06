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
    internal static class EnemyTongueReplayManager {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(MovingEnemyTentacleBase), nameof(MovingEnemyTentacleBase.DoAttack))]
            [HarmonyPrefix]
            [HarmonyWrapSafe]
            private static void Prefix_DoAttack(MovingEnemyTentacleBase __instance) {
                Spawn(__instance);
            }

            [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnDespawn))]
            [HarmonyPostfix]
            private static void Postfix_OnDespawn(EnemySync __instance) {
                Despawn(__instance.m_agent);
            }

            [HarmonyPatch(typeof(EnemyBehaviour), nameof(EnemyBehaviour.ChangeState), new Type[] { typeof(EB_States) })]
            [HarmonyPrefix]
            private static void Prefix_Behaviour_ChangeState(EnemyBehaviour __instance, EB_States state) {
                if (__instance.m_currentStateName != state && state == EB_States.Dead) {
                    Despawn(__instance.m_ai.m_enemyAgent);
                    return;
                }
            }

            [HarmonyPatch(typeof(MovingEnemyTentacleBase), nameof(MovingEnemyTentacleBase.DeAllocateGPUCurvy))]
            [HarmonyPostfix]
            private static void Postfix_Deallocate(MovingEnemyTentacleBase __instance) {
                Despawn(__instance);
            }

            private static MovingEnemyTentacleBase? tongue; // Tongue currently in use => used to work out which tongue hits the player
            [HarmonyPatch(typeof(MovingEnemyTentacleBase), nameof(MovingEnemyTentacleBase.OnAttackIsOut))]
            [HarmonyPrefix]
            private static void Prefix_OnAttackIsOut(MovingEnemyTentacleBase __instance) {
                tongue = __instance;

                PlayerAgent? target = __instance.PlayerTarget;

                bool flag = __instance.CheckTargetInAttackTunnel();
                if (target != null && target.Damage.IsSetup) {
                    bool flag2;
                    if (__instance.m_owner.EnemyBalancingData.UseTentacleTunnelCheck) {
                        flag2 = flag;
                    } else {
                        Vector3 tipPos = __instance.GetTipPos();
                        flag2 = (target.TentacleTarget.position - tipPos).magnitude < __instance.m_owner.EnemyBalancingData.TentacleAttackDamageRadiusIfNoTunnelCheck;
                    }
                    if (!flag2) {
                        Replay.Trigger(new rEnemyTongueEvent(__instance));
                    }
                }
            }

            [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ReceiveTentacleAttackDamage))]
            [HarmonyPrefix]
            private static void Prefix_ReceiveTentacleAttackDamage(Dam_PlayerDamageBase __instance, pMediumDamageData data) {
                if (tongue != null) Replay.Trigger(new rEnemyTongueEvent(tongue));
            }
        }

        public static Dictionary<int, HashSet<rEnemyTongue>> tongueOwners = new Dictionary<int, HashSet<rEnemyTongue>>();

        [ReplayInit]
        private static void Init() {
            tongueOwners.Clear();
        }

        public static void Spawn(MovingEnemyTentacleBase tongue) {
            if (!Replay.Ready) return;
            if (Replay.Has<rEnemyTongue>(tongue.GetInstanceID())) return;

            rEnemyTongue rTongue = new rEnemyTongue(tongue);
            int owner = tongue.m_owner.GlobalID;
            if (!tongueOwners.ContainsKey(owner)) {
                tongueOwners.Add(owner, new HashSet<rEnemyTongue>());
            }
            tongueOwners[owner].Add(rTongue);
            Replay.Spawn(rTongue);
        }

        public static void Despawn(MovingEnemyTentacleBase tongue) {
            if (!Replay.Ready) return;

            int owner = tongue.m_owner.GlobalID;
            if (!tongueOwners.ContainsKey(owner)) return;
            rEnemyTongue rTongue = new rEnemyTongue(tongue);
            if (tongueOwners[owner].Remove(rTongue)) {
                Replay.Despawn(rTongue);
            }
        }

        public static void Despawn(EnemyAgent enemy) {
            int owner = enemy.GlobalID;
            if (!tongueOwners.ContainsKey(owner)) return;
            foreach (rEnemyTongue tongue in tongueOwners[owner]) {
                Replay.Despawn(tongue);
            }
            tongueOwners.Remove(owner);
        }
    }

    public class TongueTooLong : Exception {
        public TongueTooLong(string message) : base(message) { }
    }

    [ReplayData("Vanilla.Enemy.TongueEvent", "0.0.1")]
    internal class rEnemyTongueEvent : Id {
        private MovingEnemyTentacleBase tongue;
        public rEnemyTongueEvent(MovingEnemyTentacleBase tongue) : base(tongue.GetInstanceID()) {
            this.tongue = tongue;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);

            if (tongue.m_GPUSplineSegments.Length > byte.MaxValue) {
                throw new TongueTooLong($"Tongue has too many segments: {tongue.m_GPUSplineSegments.Length}.");
            }

            BitHelper.WriteBytes((byte)tongue.m_GPUSplineSegments.Length, buffer);
            BitHelper.WriteBytes(tongue.m_GPUSplineSegments[0].pos, buffer);
            for (int i = 1; i < tongue.m_GPUSplineSegments.Length; ++i) {
                Vector3 diff = tongue.m_GPUSplineSegments[i].pos - tongue.m_GPUSplineSegments[i - 1].pos;
                BitHelper.WriteHalf(diff, buffer);
            }
        }
    }

    [ReplayData("Vanilla.Enemy.Tongue", "0.0.1")]
    public class rEnemyTongue : ReplayDynamic {
        private MovingEnemyTentacleBase tongue;
        public PlayerAgent? target;
        public bool attackOut = false; // NOTE(randomuserhi): Purely for stat tracker
                                       // TODO(randomuserhi): Refactor so whole code base uses dynamics like this to
                                       //                     store additional information
        public override bool Active => tongue != null && tongue.m_owner != null;
        public override bool IsDirty => tongue.m_GPUSplineSegments.Length > 0;

        public rEnemyTongue(MovingEnemyTentacleBase tongue) : base(tongue.GetInstanceID()) {
            this.tongue = tongue;

            // Set target tongue is after => if unobtainable, steal last valid target from rEnemyStats
            if (tongue.PlayerTarget != null) {
                target = tongue.PlayerTarget;
            } else if (Replay.Has<rEnemyStats>(tongue.m_owner.GlobalID)) {
                rEnemyStats enemy = Replay.Get<rEnemyStats>(tongue.m_owner.GlobalID);
                if (enemy.target != null) {
                    target = enemy.target;
                }
            }
        }

        public override void Write(ByteBuffer buffer) {
            if (tongue.m_GPUSplineSegments.Length > byte.MaxValue) {
                throw new TongueTooLong($"Tongue has too many segments: {tongue.m_GPUSplineSegments.Length}.");
            }

            BitHelper.WriteBytes((byte)tongue.m_owner.DimensionIndex, buffer);
            BitHelper.WriteBytes((byte)(Mathf.Clamp01(tongue.TentacleRelLen) * byte.MaxValue), buffer);
            BitHelper.WriteBytes((byte)tongue.m_GPUSplineSegments.Length, buffer);
            BitHelper.WriteBytes(tongue.m_GPUSplineSegments[0].pos, buffer);
            for (int i = 1; i < tongue.m_GPUSplineSegments.Length; ++i) {
                Vector3 diff = tongue.m_GPUSplineSegments[i].pos - tongue.m_GPUSplineSegments[i - 1].pos;
                BitHelper.WriteHalf(diff, buffer);
            }
        }

        public override void Spawn(ByteBuffer buffer) {
            BitHelper.WriteBytes(tongue.m_owner.GlobalID, buffer);
            Write(buffer);
        }
    }
}
