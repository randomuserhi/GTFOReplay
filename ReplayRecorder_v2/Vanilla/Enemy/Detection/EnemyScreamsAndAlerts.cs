using Agents;
using API;
using Enemies;
using HarmonyLib;
using Player;
using ReplayRecorder;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using SNetwork;

namespace Vanilla.Enemy.Detection {
    [ReplayData("Vanilla.Enemy.Alert", "0.0.1")]
    internal class rEnemyAlert : Id {
        private byte targetSlot;

        public rEnemyAlert(EnemyAgent agent, PlayerAgent? target = null) : base(agent.GlobalID) {
            if (target == null) {
                this.targetSlot = byte.MaxValue;
            } else {
                this.targetSlot = (byte)target.PlayerSlotIndex;
            }
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes(targetSlot, buffer);
        }
    }

    // TODO(randomuserhi): Move to animations...
    [ReplayData("Vanilla.Enemy.Animation.Scream", "0.0.1")]
    internal class rEnemyScream : Id {
        internal enum Type {
            Regular,
            Scout
        }
        private Type type;
        private byte animIndex;

        public rEnemyScream(EnemyAgent agent, byte animIndex, Type type = Type.Regular) : base(agent.GlobalID) {
            this.type = type;
            this.animIndex = animIndex;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes(animIndex, buffer);
            BitHelper.WriteBytes((byte)type, buffer);
        }
    }

    [HarmonyPatch]
    internal static class EnemyScreamsAndAlerts {
        // Don't count screams or double alerts from scouts
        private static Dictionary<int, long> enemiesWokenFromScream = new Dictionary<int, long>();
        private static bool wokenFromScream = false;

        // Handling regular screams
        [HarmonyPatch(typeof(ES_Scream), nameof(ES_Scream.ActivateState))]
        [HarmonyPostfix]
        private static void Postfix_Scream(ES_Scream __instance) {
            if (!SNet.IsMaster) return;

            Replay.Trigger(new rEnemyScream(__instance.m_ai.m_enemyAgent, (byte)__instance.m_lastAnimIndex));
        }
        [HarmonyPatch(typeof(ES_Scream), nameof(ES_Scream.Update))]
        [HarmonyPrefix]
        private static void Prefix_Scream(ES_Scream __instance) {
            if (!SNet.IsMaster) return;

            // Condition taken from source
            if (!__instance.m_hasTriggeredPropagation && __instance.m_triggerPropgationAt < Clock.Time) {
                wokenFromScream = true;
            }
        }
        [HarmonyPatch(typeof(ES_Scream), nameof(ES_Scream.SetAI))]
        [HarmonyPostfix]
        private static void Scream(ES_Scream __instance) {
            if (SNet.IsMaster) return;

            Il2CppSystem.Action<pES_EnemyScreamData>? previous = __instance.m_screamPacket.ReceiveAction;
            __instance.m_screamPacket.ReceiveAction = (Action<pES_EnemyScreamData>)((packet) => {
                Replay.Trigger(new rEnemyScream(__instance.m_ai.m_enemyAgent, packet.AnimIndex));
                previous?.Invoke(packet);
            });
        }
        [HarmonyPatch(typeof(ES_Scream), nameof(ES_Scream.Update))]
        [HarmonyPostfix]
        private static void Postfix_Scream() {
            wokenFromScream = false;
        }
        // Handling scout screams
        [HarmonyPatch(typeof(ES_ScoutScream), nameof(ES_ScoutScream.CommonUpdate))]
        [HarmonyPrefix]
        private static void Prefix_ScoutScream(ES_ScoutScream __instance) {
            if (SNet.IsMaster) wokenFromScream = true;

            // Condition taken from source
            switch (__instance.m_state) {
            case ES_ScoutScream.ScoutScreamState.Chargeup:
                if (!(__instance.m_stateDoneTimer < Clock.Time)) {
                    break;
                }

                EnemyAgent self = __instance.m_enemyAgent;
                Replay.Trigger(new rEnemyScream(self, (byte)__instance.m_lastAnimIndex, rEnemyScream.Type.Scout));
                if (!SNet.IsMaster) {
                    Replay.Trigger(new rEnemyAlert(self));
                    APILogger.Debug("Client-side scout wake up.");
                }
                break;
            }
        }
        [HarmonyPatch(typeof(ES_ScoutScream), nameof(ES_ScoutScream.CommonUpdate))]
        [HarmonyPostfix]
        private static void Postfix_ScoutScream() {
            wokenFromScream = false;
        }

        // Marking enemies that woke up from scream
        [HarmonyPatch(typeof(EnemyAI), nameof(EnemyAI.InjectPropagatedTarget))]
        [HarmonyPrefix]
        private static void InjectPropagatedTarget(EnemyAI __instance, Agent agent, AgentTargetPropagationType propagation) {
            if (!SNet.IsMaster) return;

            int instance = __instance.m_enemyAgent.GetInstanceID();
            if (wokenFromScream && !enemiesWokenFromScream.ContainsKey(instance)) enemiesWokenFromScream.Add(instance, Raudy.Now);
        }

        // Regular enemy wakeup sequence
        private static bool triggered = false;
        [HarmonyPatch(typeof(ES_HibernateWakeUp), nameof(ES_HibernateWakeUp.DoWakeup))]
        [HarmonyPostfix]
        private static void WakeUp_State(ES_HibernateWakeUp __instance) {
            if (triggered) return;

            EnemyAgent self = __instance.m_ai.m_enemyAgent;
            if (!SNet.IsMaster) {
                // Client side wake up:
                Replay.Trigger(new rEnemyAlert(self));
                APILogger.Debug("Client-side enemy wake up.");
                return;
            }

            // Prevent niche cases where enemies don't wake up from a scream despite the fact they are in range
            // by removing tagged enemies in scream group that are older than 200ms
            long now = Raudy.Now;
            int[] keys = enemiesWokenFromScream.Keys.ToArray();
            foreach (int id in keys) {
                if (now - enemiesWokenFromScream[id] > 200) enemiesWokenFromScream.Remove(id);
            }

            int instance = self.GetInstanceID();
            if (enemiesWokenFromScream.ContainsKey(instance)) {
                enemiesWokenFromScream.Remove(instance);
                Replay.Trigger(new rEnemyAlert(self));
                APILogger.Debug("Enemy was woken by a scream.");
            } else {
                PlayerAgent? player = null;

                if (NoiseTracker.CurrentNoise != null) {
                    player = NoiseTracker.CurrentNoise.source;
                    APILogger.Debug("Detection from noise manager.");
                } else {
                    AgentTarget? target = __instance.m_ai.Target;
                    if (target != null) player = target.m_agent.TryCast<PlayerAgent>();
                    else APILogger.Error("AgentTarget was null, this should not happen.");
                }
                Replay.Trigger(new rEnemyAlert(self, player));
            }
        }
        [HarmonyPatch(typeof(EnemyDetection), nameof(EnemyDetection.UpdateHibernationDetection))]
        [HarmonyPostfix]
        private static void WakeUp_Detection(EnemyDetection __instance, AgentTarget target, bool __result) {
            if (!SNet.IsMaster) return;

            if (__result) {
                // Prevent niche cases where enemies don't wake up from a scream despite the fact they are in range
                // by removing tagged enemies in scream group that are older than 100ms
                long now = Raudy.Now;
                int[] keys = enemiesWokenFromScream.Keys.ToArray();
                foreach (int id in keys) {
                    if (now - enemiesWokenFromScream[id] > 100) enemiesWokenFromScream.Remove(id);
                }

                EnemyAgent self = __instance.m_ai.m_enemyAgent;
                int instance = self.GetInstanceID();
                if (enemiesWokenFromScream.ContainsKey(instance)) {
                    enemiesWokenFromScream.Remove(instance);
                    Replay.Trigger(new rEnemyAlert(self));
                    APILogger.Debug("Enemy was woken by a scream.");
                } else {
                    PlayerAgent? player = null;

                    if (NoiseTracker.CurrentNoise != null) {
                        player = NoiseTracker.CurrentNoise.source;
                        APILogger.Debug("Detection from noise manager.");
                    } else player = target.m_agent.TryCast<PlayerAgent>();
                    Replay.Trigger(new rEnemyAlert(self, player));
                }
                triggered = true;
            }
        }
        [HarmonyPatch(typeof(EB_Hibernating), nameof(EB_Hibernating.UpdateDetection))]
        [HarmonyPostfix]
        private static void WakeUpTriggerReset() {
            triggered = false;
        }
    }
}
