using CullingSystem;
using Enemies;
using HarmonyLib;
using Player;
using UnityEngine;
using Vanilla.Enemy.BepInEx;
using static Enemies.EnemyUpdateManager;

namespace Vanilla.Enemy.Patches {
    [HarmonyPatch]
    internal static class EnemyModelPatches {
        public static HashSet<int> aggressiveInRange = new HashSet<int>();

        [HarmonyPatch(typeof(C_MovingCuller), nameof(C_MovingCuller.IsShown), MethodType.Getter)]
        [HarmonyPostfix]
        private static void GetIsShown(C_MovingCuller __instance, ref bool __result) {
            EnemyAgent? enemy = __instance.m_owner.TryCast<EnemyAgent>();
            if (enemy != null) { // && EnemyModelBehaviour.aggressiveInRange.Contains(enemy.GlobalID)) {
                __result = true;
            }
        }

        [HarmonyPatch(typeof(UpdateLocomotionGroup), nameof(UpdateLocomotionGroup.UpdateMember))]
        [HarmonyPostfix]
        private static void UpdateLocomotionClose(UpdateLocomotionGroup __instance, EnemyLocomotion member) {
            //if (Current.m_locomotionUpdatesClose.m_members.Contains(member)) return;
            UpdateAnim(member.m_agent);
        }

        private static void UpdateAnim(EnemyAgent agent) {
            switch (agent.Locomotion.m_currentState.m_stateEnum) {
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
                bool added = false;
                foreach (PlayerAgent player in PlayerManager.PlayerAgentsInLevel) {
                    // TODO(randomuserhi): Option to limit isAggressive by a different range as well
                    float dist = (player.transform.position - agent.transform.position).sqrMagnitude;
                    bool isAggressive = agent.AI.m_mode == Agents.AgentMode.Agressive;
                    bool isInRange = dist < ConfigManager.AnimationRange * ConfigManager.AnimationRange;
                    if ((isAggressive || isInRange) && !aggressiveInRange.Contains(agent.GlobalID)) {
                        agent.Anim.cullingMode = AnimatorCullingMode.AlwaysAnimate;
                        added = true;
                        aggressiveInRange.Add(agent.GlobalID);
                        break;
                    }
                }
                if (!added && aggressiveInRange.Contains(agent.GlobalID)) {
                    agent.Anim.cullingMode = AnimatorCullingMode.CullCompletely;
                    aggressiveInRange.Remove(agent.GlobalID);
                }
                break;
            }
        }
    }
}
