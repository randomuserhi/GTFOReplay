using API;
using HarmonyLib;
using Enemies;
using Agents;
using SNetwork;
using Player;
using UnityEngine;

namespace ReplayRecorder.Enemies.Patches
{
    [HarmonyPatch]
    class EnemyDetectionPatches
    {
        public static void Reset()
        {
            enemiesWokenFromScream.Clear();
        }

        // Don't count screams or double alerts from scouts
        private static HashSet<int> enemiesWokenFromScream = new HashSet<int>();
        private static bool wokenFromScream = false;
        // Handling regular screams
        [HarmonyPatch(typeof(ES_Scream), nameof(ES_Scream.Update))]
        [HarmonyPrefix]
        private static void Prefix_Scream(ES_Scream __instance)
        {
            // Condition taken from source
            if (!__instance.m_hasTriggeredPropagation && __instance.m_triggerPropgationAt < Clock.Time)
            {
                Enemy.EnemyScreamed(__instance.m_enemyAgent);
                wokenFromScream = true;
            }
        }
        [HarmonyPatch(typeof(ES_Scream), nameof(ES_Scream.Update))]
        [HarmonyPostfix]
        private static void Postfix_Scream()
        {
            wokenFromScream = false;
        }
        // Handling scout screams
        [HarmonyPatch(typeof(ES_ScoutScream), nameof(ES_ScoutScream.CommonUpdate))]
        [HarmonyPrefix]
        private static void Prefix_ScoutScream(ES_ScoutScream __instance)
        {
            wokenFromScream = true;

            // Condition taken from source
            switch (__instance.m_state)
            {
                case ES_ScoutScream.ScoutScreamState.Chargeup:
                    if (!(__instance.m_stateDoneTimer < Clock.Time))
                    {
                        break;
                    }

                    Enemy.EnemyScreamed(__instance.m_enemyAgent, true);
                    break;
            }
        }
        [HarmonyPatch(typeof(ES_ScoutScream), nameof(ES_ScoutScream.CommonUpdate))]
        [HarmonyPostfix]
        private static void Postfix_ScoutScream()
        {
            wokenFromScream = false;
        }
        // Marking enemies that woke up from scream
        [HarmonyPatch(typeof(EnemyAI), nameof(EnemyAI.InjectPropagatedTarget))]
        [HarmonyPrefix]
        private static void InjectPropagatedTarget(EnemyAI __instance, Agent agent, AgentTargetPropagationType propagation)
        {
            if (!SNet.IsMaster) return;

            if (wokenFromScream) enemiesWokenFromScream.Add(__instance.m_enemyAgent.GetInstanceID());
        }

        // Regular enemy wakeup sequence
        [HarmonyPatch(typeof(ES_HibernateWakeUp), nameof(ES_HibernateWakeUp.ActivateState))]
        [HarmonyPostfix]
        private static void WakeUp(ES_HibernateWakeUp __instance)
        {
            if (!SnapshotManager.active) return;
            if (!SNet.IsMaster) return;

            EnemyAgent self = __instance.m_ai.m_enemyAgent;
            AgentTarget? target = __instance.m_ai.Target;
            int instance = self.GetInstanceID();
            if (enemiesWokenFromScream.Contains(instance))
            {
                enemiesWokenFromScream.Remove(instance);
                Enemy.EnemyAlerted(self);
                APILogger.Debug("Enemy was woken by a scream.");
            }
            else
            {
                PlayerAgent? player = null;
                if (target != null) player = target.m_agent.TryCast<PlayerAgent>();
                else APILogger.Error("AgentTarget was null, this should not happen.");
                if (player != null)
                    Enemy.EnemyAlerted(self, player);
                else
                    APILogger.Error("Enemy was woken by an agent that wasnt a player.");
            }
        }
    }
}
