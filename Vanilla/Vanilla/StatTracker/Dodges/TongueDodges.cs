using Enemies;
using HarmonyLib;
using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using SNetwork;
using UnityEngine;
using Vanilla.Enemy;

namespace Vanilla.StatTracker.Dodges {
    [HarmonyPatch]
    [ReplayData("Vanilla.StatTracker.TongueDodge", "0.0.1")]
    internal class rTongueDodge : ReplayEvent {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(MovingEnemyTentacleBase), nameof(MovingEnemyTentacleBase.AttackIn))]
            [HarmonyPrefix]
            private static void AttackIn(MovingEnemyTentacleBase __instance) {
                int tongueId = __instance.GetInstanceID();
                if (Replay.Has<rEnemyTongue>(tongueId)) {
                    rEnemyTongue tongue = Replay.Get<rEnemyTongue>(tongueId);
                    if (!tongue.attackOut && tongue.target != null) {
                        Replay.Trigger(new rTongueDodge(__instance.m_owner, tongue.target));
                    }
                    tongue.attackOut = false;
                }
            }

            [HarmonyPatch(typeof(MovingEnemyTentacleBase), nameof(MovingEnemyTentacleBase.OnAttackIsOut))]
            [HarmonyPrefix]
            private static void OnAttackIsOut(MovingEnemyTentacleBase __instance) {
                if (!SNet.IsMaster) return;
                int tongueId = __instance.GetInstanceID();
                if (!Replay.Has<rEnemyTongue>(tongueId)) return;

                rEnemyTongue tongue = Replay.Get<rEnemyTongue>(tongueId);
                tongue.attackOut = true;

                PlayerAgent? target = __instance.PlayerTarget;
                if (target == null) {
                    target = tongue.target;
                }
                if (target == null) return;

                bool flag = __instance.CheckTargetInAttackTunnel();
                bool hit = false;
                if (__instance.m_hasStaticTargetPos) {
                    if (Physics.Linecast(__instance.m_owner.EyePosition, __instance.m_staticTargetPos, out RaycastHit hitInfo, LayerManager.MASK_DEFAULT)) {
                        IDamageable damageable = hitInfo.collider.GetComponent<IDamageable>();
                        if (damageable != null) {
                            hit = true;
                        }
                    }
                } else if (__instance.PlayerTarget != null && __instance.PlayerTarget.Damage.IsSetup) {
                    bool flag2;
                    if (__instance.m_owner.EnemyBalancingData.UseTentacleTunnelCheck) {
                        flag2 = flag;
                    } else {
                        Vector3 tipPos = __instance.GetTipPos();
                        flag2 = (__instance.PlayerTarget.TentacleTarget.position - tipPos).magnitude < __instance.m_owner.EnemyBalancingData.TentacleAttackDamageRadiusIfNoTunnelCheck;
                    }
                    if (flag2) {
                        hit = true;
                    }
                }
                if (!hit) {
                    Replay.Trigger(new rTongueDodge(__instance.m_owner, target));
                }
            }
        }

        private ushort source;
        private ushort target;

        public rTongueDodge(EnemyAgent source, PlayerAgent target) {
            this.source = source.GlobalID;
            this.target = target.GlobalID;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(source, buffer);
            BitHelper.WriteBytes(target, buffer);
        }
    }
}
