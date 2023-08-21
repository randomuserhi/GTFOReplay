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

            /*NoiseManager.noiseDataToProcess.Clear();
            noiseSources.Clear();
            currentNoiseSource = null;*/
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
        /*[HarmonyPatch(typeof(EnemyDetection), nameof(EnemyDetection.UpdateHibernationDetection))]
        [HarmonyPostfix]
        private static void WakeUp(EnemyDetection __instance, AgentTarget target, bool __result)
        {
            if (!SnapshotManager.active) return;
            if (!SNet.IsMaster) return;

            if (__result)
            {
                EnemyAgent self = __instance.m_ai.m_enemyAgent;
                int instance = self.GetInstanceID();
                if (enemiesWokenFromScream.Contains(instance))
                {
                    enemiesWokenFromScream.Remove(instance);
                    Enemy.EnemyAlerted(self);
                    APILogger.Debug("Enemy was woken by a scream.");
                }
                else
                {
                    PlayerAgent? player = target.m_agent.TryCast<PlayerAgent>();
                    if (player != null)
                        Enemy.EnemyAlerted(self, player);
                    else
                        APILogger.Error("Enemy was woken by an agent that wasnt a player.");
                }
            }
        }*/

        // Enemy wake up from noise
        /*private static Queue<PlayerAgent?> noiseSources = new Queue<PlayerAgent?>();
        private static PlayerAgent? currentNoiseSource = null;
        [HarmonyPatch(typeof(NoiseManager), nameof(NoiseManager.MakeNoise))]
        [HarmonyPostfix]
        private static void MakeNoise()
        {
            if (!SNet.IsMaster) return;

            noiseSources.Enqueue(currentNoiseSource);
        }
        [HarmonyPatch(typeof(NoiseManager), nameof(NoiseManager.ProcessNoise))]
        [HarmonyPrefix]
        private static void ProcessNoise()
        {
            if (!SNet.IsMaster) return;

            if (NoiseManager.noiseDataToProcess.Count != noiseSources.Count)
            {
                APILogger.Error("Noises are desynced for an unknown reason...");
            }

            noiseSources.Dequeue();
        }*/

        /*[HarmonyPatch(typeof(EB_Hibernating), nameof(EB_Hibernating.OnNoiseDetected))]
        [HarmonyPostfix]
        private static void OnNoiseDetected(EB_Hibernating __instance, ref NM_NoiseData noiseData, float distance01)
        {
            EnemyAgent self = __instance.m_ai.m_enemyAgent;
            PlayerAgent? p = null;// noiseData.noiseMaker.TryCast<PlayerAgent>();

            APILogger.Debug($"Sussy {noiseData.type}");

            // Condition taken from source
            switch (noiseData.type)
            {
                case NM_NoiseType.InstaDetect:
                    Enemy.EnemyAlerted(self, p);
                    break;
                case NM_NoiseType.Detectable:
                    if (distance01 > 0f) break;
                    Enemy.EnemyAlerted(self, p);
                    break;
            }
        }*/
    }
}
