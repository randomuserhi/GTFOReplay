using CullingSystem;
using Enemies;
using HarmonyLib;
using Player;
using UnityEngine;
using Vanilla.Enemy.BepInEx;

namespace Vanilla.Enemy.Patches {
    [HarmonyPatch]
    internal class EnemyModelPatches {
        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnSpawn))]
        [HarmonyPostfix]
        private static void OnSpawn(EnemySync __instance, pEnemySpawnData spawnData) {
            EnemyModelBehaviour behaviour = __instance.m_agent.transform.gameObject.AddComponent<EnemyModelBehaviour>();
            behaviour.agent = __instance.m_agent;
        }

        [HarmonyPatch(typeof(C_MovingCuller), nameof(C_MovingCuller.IsShown), MethodType.Getter)]
        [HarmonyPostfix]
        private static void GetIsShown(C_MovingCuller __instance, ref bool __result) {
            EnemyAgent? enemy = __instance.m_owner.TryCast<EnemyAgent>();
            if (enemy != null && EnemyModelBehaviour.aggressiveInRange.Contains(enemy.GlobalID)) {
                __result = true;
            }
        }
    }

    internal class EnemyModelBehaviour : MonoBehaviour {
        internal static HashSet<ushort> aggressiveInRange = new HashSet<ushort>();
        internal EnemyAgent? agent;

        private void Update() {
            if (agent == null) return;

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
                    bool isAggressive = agent.AI.m_mode == Agents.AgentMode.Agressive;
                    bool isInRange = (player.transform.position - agent.transform.position).sqrMagnitude < ConfigManager.AnimationRange * ConfigManager.AnimationRange;
                    if (isAggressive || isInRange) {
                        agent.Anim.cullingMode = AnimatorCullingMode.AlwaysAnimate;
                        added = true;
                        aggressiveInRange.Add(agent.GlobalID);
                        break;
                    }
                }
                if (!added) {
                    agent.Anim.cullingMode = AnimatorCullingMode.CullCompletely;
                    aggressiveInRange.Remove(agent.GlobalID);
                }
                break;
            }
        }
    }
}
