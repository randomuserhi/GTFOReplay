using Agents;
using AIGraph;
using API;
using Enemies;
using GameData;
using HarmonyLib;
using LevelGeneration;
using Player;
using SNetwork;
using UnityEngine;

namespace ReplayRecorder.Enemies.Patches {
    [HarmonyPatch]
    class EnemyDetectionPatches {
        public static void Reset() {
            enemiesWokenFromScream.Clear();

            NoiseManager.noiseDataToProcess.Clear();
            delayedNoiseEvents.Clear();
            _delayedNoiseEvents.Clear();
            noiseSources.Clear();
            makeNoiseSource = null;
            makeNoiseSourceSet = false;
            currentNoiseSource = new NoiseSource() {
                set = false,
                source = null
            };
        }

        // Don't count screams or double alerts from scouts
        private static Dictionary<int, long> enemiesWokenFromScream = new Dictionary<int, long>();
        private static bool wokenFromScream = false;
        // Handling regular screams
        [HarmonyPatch(typeof(ES_Scream), nameof(ES_Scream.Update))]
        [HarmonyPrefix]
        private static void Prefix_Scream(ES_Scream __instance) {
            if (!SNet.IsMaster) return;

            // Condition taken from source
            if (!__instance.m_hasTriggeredPropagation && __instance.m_triggerPropgationAt < Clock.Time) {
                Enemy.EnemyScreamed(__instance.m_enemyAgent);
                wokenFromScream = true;
            }
        }
        [HarmonyPatch(typeof(ES_Scream), nameof(ES_Scream.SetAI))]
        [HarmonyPostfix]
        private static void Scream(ES_Scream __instance) {
            if (SNet.IsMaster) return;

            Il2CppSystem.Action<pES_EnemyScreamData>? previous = __instance.m_screamPacket.ReceiveAction;
            __instance.m_screamPacket.ReceiveAction = (Action<pES_EnemyScreamData>)((packet) => {
                Enemy.EnemyScreamed(__instance.m_enemyAgent);
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
                Enemy.EnemyScreamed(self, true);
                if (!SNet.IsMaster) {
                    // Client side wake up:
                    Enemy.EnemyAlerted(self);
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

        // Correct noise sources
        private struct NoiseSource {
            public bool set;
            public PlayerAgent? source;
        }
        private struct NoiseEvent {
            public Vector3 position;
            public float radiusMin;
            public float radiusMax;
            public float yScale;
            public int courseNodeInstance;
            public NM_NoiseType type;
            public bool includeToNeightbourAreas;
            public bool raycastFirstNode;
        }
        private static List<NoiseEvent> delayedNoiseEvents = new List<NoiseEvent>();
        private static List<NoiseEvent> _delayedNoiseEvents = new List<NoiseEvent>();
        private static Queue<NoiseSource> noiseSources = new Queue<NoiseSource>();
        private static PlayerAgent? makeNoiseSource = null;
        private static bool makeNoiseSourceSet = false;
        private static NoiseSource currentNoiseSource = new NoiseSource() {
            set = false,
            source = null
        };
        private static bool fromNoiseManager = false;
        [HarmonyPatch(typeof(NoiseManager), nameof(NoiseManager.Update))]
        [HarmonyPrefix]
        private static void Prefix_UpdateNoise() {
            if (!SNet.IsMaster) return;
            fromNoiseManager = true;
        }
        [HarmonyPatch(typeof(NoiseManager), nameof(NoiseManager.Update))]
        [HarmonyPostfix]
        private static void Postfix_UpdateNoise() {
            if (!SNet.IsMaster) return;
            fromNoiseManager = false;
        }
        [HarmonyPatch(typeof(NoiseManager), nameof(NoiseManager.ReceiveNoise))]
        [HarmonyPostfix]
        private static void ReceiveNoise(pNM_NoiseData data) {
            if (!SNet.IsMaster) return;

            // TODO(randomuserhi): Need to test noises sent from other players properly have their source sent
            //                     If not, then just assume source here is always from whoever sent the packet
            //                     -> On that note figure out how to get sender lmao
            noiseSources.Enqueue(new NoiseSource() {
                set = false,
                source = null
            });
        }
        [HarmonyPatch(typeof(NoiseManager), nameof(NoiseManager.MakeNoise))]
        [HarmonyPostfix]
        private static void MakeNoise(NM_NoiseData noiseData) {
            if (!SNet.IsMaster) return;

            // Check if its a delayed noise event => Hacky solution using these 2 buffered lists to avoid patching IEnumerator used
            // by the game to trigger delayed events.
            bool delayedNoiseEvent = false;
            _delayedNoiseEvents.Clear();
            foreach (NoiseEvent delayed in delayedNoiseEvents) {
                if (
                    !delayedNoiseEvent &&
                    delayed.position == noiseData.position &&
                    delayed.radiusMin == noiseData.radiusMin &&
                    delayed.radiusMax == noiseData.radiusMax &&
                    delayed.yScale == noiseData.yScale &&
                    delayed.courseNodeInstance == noiseData.node.gameObject.GetInstanceID() &&
                    delayed.type == noiseData.type &&
                    delayed.includeToNeightbourAreas == noiseData.includeToNeightbourAreas &&
                    delayed.raycastFirstNode == noiseData.raycastFirstNode
                ) {
                    delayedNoiseEvent = true;
                } else {
                    _delayedNoiseEvents.Add(delayed);
                }
            }
            List<NoiseEvent> temp = _delayedNoiseEvents;
            _delayedNoiseEvents = delayedNoiseEvents;
            delayedNoiseEvents = temp;

            if (delayedNoiseEvent) {
                APILogger.Debug($"Matched sound to a delayed sec door event. {_delayedNoiseEvents.Count} -> {delayedNoiseEvents.Count}");
                noiseSources.Enqueue(new NoiseSource() {
                    set = true,
                    source = null
                });
            } else {
                noiseSources.Enqueue(new NoiseSource() {
                    set = makeNoiseSourceSet,
                    source = makeNoiseSource
                });
            }

            makeNoiseSourceSet = false;
            makeNoiseSource = null;
        }
        [HarmonyPatch(typeof(NoiseManager), nameof(NoiseManager.ProcessNoise))]
        [HarmonyPrefix]
        private static void Prefix_ProcessNoise() {
            if (!SNet.IsMaster) return;

            if (NoiseManager.noiseDataToProcess.Count + 1 != noiseSources.Count) {
                APILogger.Error("Noises are desynced for an unknown reason...");
                noiseSources.Clear();
                while (NoiseManager.noiseDataToProcess.Count + 1 != noiseSources.Count) {
                    noiseSources.Enqueue(new NoiseSource() {
                        set = false,
                        source = null
                    });
                }
            }

            currentNoiseSource = noiseSources.Dequeue();
        }
        [HarmonyPatch(typeof(NoiseManager), nameof(NoiseManager.ProcessNoise))]
        [HarmonyPostfix]
        private static void Postfix_ProcessNoise() {
            if (!SNet.IsMaster) return;
            currentNoiseSource = new NoiseSource() { set = false, source = null };
        }
        // Sentry gun noises
        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.FireBullet))]
        [HarmonyPrefix]
        private static void SentryShootNoise(SentryGunInstance_Firing_Bullets __instance) {
            if (!SNet.IsMaster) return;
            makeNoiseSource = __instance.m_core.Owner;
            makeNoiseSourceSet = true;
        }
        // Mine Deployer explosion noise
        [HarmonyPatch(typeof(MineDeployerInstance_Detonate_Explosive), nameof(MineDeployerInstance_Detonate_Explosive.DoExplode))]
        [HarmonyPrefix]
        private static void ExplodeNoise() {
            if (!SNet.IsMaster) return;
            makeNoiseSource = null;
            makeNoiseSourceSet = true;
        }
        // Spitter noise
        [HarmonyPatch(typeof(InfectionSpitter), nameof(InfectionSpitter.Update))]
        [HarmonyPrefix]
        private static void SpitterExplodeNoise(InfectionSpitter __instance) {
            if (!SNet.IsMaster) return;
            if (__instance.m_isExploding) {
                if (__instance.m_explodeProgression > 1.6f) {
                    makeNoiseSource = null;
                    makeNoiseSourceSet = true;
                }
            }
        }
        // Door breaking
        [HarmonyPatch(typeof(LG_WeakDoor_Destruction), nameof(LG_WeakDoor_Destruction.TriggerExplosionEffect))]
        [HarmonyPrefix]
        private static void DoorBreakNoise(LG_WeakDoor_Destruction __instance) {
            if (!SNet.IsMaster) return;
            if (!(__instance.m_destructionController == null)) {
                makeNoiseSource = null;
                makeNoiseSourceSet = true;
            }
        }
        // SecDoorEvent => Pretty hacky method used here to try and match noise made with door
        [HarmonyPatch(typeof(LG_SecurityDoor), nameof(LG_SecurityDoor.OnDoorIsOpened))]
        [HarmonyPrefix]
        private static void Prefix_SecurityDoor_OnDoorIsOpened(LG_SecurityDoor __instance) {
            if (!SNet.IsMaster) return;

            if (__instance.LinkedToZoneData == null) {
                return;
            }
            if (__instance.LinkedToZoneData.EventsOnEnter != null) {
                for (int i = 0; i < __instance.LinkedToZoneData.EventsOnEnter!.Count; ++i) {
                    LevelEventData e = __instance.LinkedToZoneData.EventsOnEnter[i];
                    if (e.Noise.Enabled) {
                        AIG_CourseNode courseNode = __instance.Gate.GetOppositeArea(__instance.Gate.ProgressionSourceArea).m_courseNode;
                        delayedNoiseEvents.Add(new NoiseEvent() {
                            position = __instance.transform.position,
                            radiusMin = e.Noise.RadiusMin,
                            radiusMax = e.Noise.RadiusMax,
                            yScale = 1f,
                            courseNodeInstance = courseNode.gameObject.GetInstanceID(),
                            type = NM_NoiseType.InstaDetect,
                            includeToNeightbourAreas = true,
                            raycastFirstNode = false
                        });
                    }
                }
            }
        }

        // Regular enemy wakeup sequence
        private static bool triggered = false;
        [HarmonyPatch(typeof(ES_HibernateWakeUp), nameof(ES_HibernateWakeUp.DoWakeup))]
        [HarmonyPostfix]
        private static void WakeUp_State(ES_HibernateWakeUp __instance) {
            if (!SnapshotManager.active) return;
            if (triggered) return;

            EnemyAgent self = __instance.m_ai.m_enemyAgent;
            if (!SNet.IsMaster) {
                // Client side wake up:
                Enemy.EnemyAlerted(self);
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
                Enemy.EnemyAlerted(self);
                APILogger.Debug("Enemy was woken by a scream.");
            } else {
                PlayerAgent? player = null;

                if (fromNoiseManager && currentNoiseSource.set) {
                    player = currentNoiseSource.source;
                    APILogger.Debug("Detection from noise manager.");
                } else {
                    AgentTarget? target = __instance.m_ai.Target;
                    if (target != null) player = target.m_agent.TryCast<PlayerAgent>();
                    else APILogger.Error("AgentTarget was null, this should not happen.");
                }
                Enemy.EnemyAlerted(self, player);
            }
        }
        [HarmonyPatch(typeof(EnemyDetection), nameof(EnemyDetection.UpdateHibernationDetection))]
        [HarmonyPostfix]
        private static void WakeUp_Detection(EnemyDetection __instance, AgentTarget target, bool __result) {
            if (!SnapshotManager.active) return;
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
                    Enemy.EnemyAlerted(self);
                    APILogger.Debug("Enemy was woken by a scream.");
                } else {
                    PlayerAgent? player = null;

                    if (fromNoiseManager && currentNoiseSource.set) {
                        player = currentNoiseSource.source;
                        APILogger.Debug("Detection from noise manager.");
                    } else player = target.m_agent.TryCast<PlayerAgent>();
                    Enemy.EnemyAlerted(self, player);
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
