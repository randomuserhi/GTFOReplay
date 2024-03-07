using Enemies;
using HarmonyLib;
using Player;
using UnityEngine;

namespace Vanilla.Enemy.Patches {
    [HarmonyPatch]
    internal class EnemyModelPatches {
        [HarmonyPatch(typeof(EnemyAgent), nameof(EnemyAgent.UpdateEnemyAgent))]
        [HarmonyPostfix]
        private static void Update(EnemyAgent __instance) {
            const float threshold = 20;

            switch (__instance.Locomotion.m_currentState.m_stateEnum) {
            case ES_StateEnum.PathMove:
            case ES_StateEnum.KnockdownRecover:
            case ES_StateEnum.Knockdown:
            case ES_StateEnum.Hitreact:
            case ES_StateEnum.ClimbLadder:
            case ES_StateEnum.ScoutScream:
            case ES_StateEnum.ScoutDetection:
            case ES_StateEnum.StrikerAttack:
            case ES_StateEnum.StrikerMelee:
            case ES_StateEnum.TankAttack:
            case ES_StateEnum.TankMultiTargetAttack:
            case ES_StateEnum.Jump:
            case ES_StateEnum.JumpDissolve:
            case ES_StateEnum.HibernateWakeUp:
            case ES_StateEnum.Hibernate:
            case ES_StateEnum.Scream:
                foreach (PlayerAgent player in PlayerManager.PlayerAgentsInLevel) {
                    bool isAggressive = __instance.AI.m_mode == Agents.AgentMode.Agressive;
                    bool isInRange = (player.transform.position - __instance.transform.position).sqrMagnitude < threshold * threshold;
                    if (isAggressive || isInRange) {
                        __instance.Anim.cullingMode = AnimatorCullingMode.AlwaysAnimate;
                        __instance.MovingCuller.CullBucket.Show();
                        break;
                    }
                }
                break;
            }
        }
    }
}
