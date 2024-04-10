using Enemies;
using HarmonyLib;
using Player;
using ReplayRecorder;
using UnityEngine;

namespace Vanilla.EnemyTongue.Patches {
    [HarmonyPatch]
    internal class TonguePatches {
        [HarmonyPatch(typeof(MovingEnemyTentacleBase), nameof(MovingEnemyTentacleBase.DoAttack))]
        [HarmonyPrefix]
        [HarmonyWrapSafe]
        private static void DoAttack(MovingEnemyTentacleBase __instance) {
            EnemyTongueReplayManager.Spawn(__instance);
        }

        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnDespawn))]
        [HarmonyPostfix]
        private static void OnDespawn(EnemySync __instance) {
            EnemyTongueReplayManager.Despawn(__instance.m_agent);
        }

        [HarmonyPatch(typeof(EnemyBehaviour), nameof(EnemyBehaviour.ChangeState), new Type[] { typeof(EB_States) })]
        [HarmonyPrefix]
        private static void Behaviour_ChangeState(EnemyBehaviour __instance, EB_States state) {
            if (__instance.m_currentStateName != state && state == EB_States.Dead) {
                EnemyTongueReplayManager.Despawn(__instance.m_ai.m_enemyAgent);
                return;
            }
        }

        [HarmonyPatch(typeof(MovingEnemyTentacleBase), nameof(MovingEnemyTentacleBase.DeAllocateGPUCurvy))]
        [HarmonyPostfix]
        private static void Deallocate(MovingEnemyTentacleBase __instance) {
            EnemyTongueReplayManager.Despawn(__instance);
        }

        private static MovingEnemyTentacleBase? tongue; // Tongue currently in use => used to work out which tongue hits the player
        [HarmonyPatch(typeof(MovingEnemyTentacleBase), nameof(MovingEnemyTentacleBase.OnAttackIsOut))]
        [HarmonyPrefix]
        private static void OnAttackIsOut(MovingEnemyTentacleBase __instance) {
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
}
