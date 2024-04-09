using AIGraph;
using API;
using HarmonyLib;
using Player;
using ReplayRecorder.API.Attributes;
using SNetwork;
using UnityEngine;

namespace Vanilla.Enemy.Detection {
    public class NoiseInfo {
        public PlayerAgent? source = null;

        public NoiseInfo() {
        }

        public NoiseInfo(PlayerAgent? source) {
            this.source = source;
        }
    }

    [HarmonyPatch]
    public static class NoiseTracker {
        public static NoiseInfo? CurrentNoise => currentNoise;
        private static NoiseInfo? currentNoise = null;

        // NOTE(randomuserhi): Must be called in the call stack prior to NoiseManager.MakeNoise otherwise they will fail to track
        public static void TrackNextNoise(NoiseInfo? info) {
            Patches.currentNoiseInfo = info;
        }

        public static void TrackNextDelayedNoise(NM_NoiseData noiseData, NoiseInfo? info) {
            Patches.delayedNoiseEvents.Add(new NoiseEvent(noiseData, info));
        }

        public static void TrackNextDelayedNoise(
            Vector3 position,
            float radiusMin,
            float radiusMax,
            float yScale,
            AIG_CourseNode courseNode,
            NM_NoiseType type,
            bool includeToNeightbourAreas,
            bool raycastFirstNode,
            NoiseInfo info
            ) {
            Patches.delayedNoiseEvents.Add(new NoiseEvent(position, radiusMin, radiusMax, yScale, courseNode, type, includeToNeightbourAreas, raycastFirstNode, info));
        }

        private class NoiseEvent {
            public Vector3 position;
            public float radiusMin;
            public float radiusMax;
            public float yScale;
            public int courseNodeInstance;
            public NM_NoiseType type;
            public bool includeToNeightbourAreas;
            public bool raycastFirstNode;

            public NoiseInfo? info;

            public NoiseEvent(NM_NoiseData data, NoiseInfo? noise) {
                position = data.position;
                radiusMin = data.radiusMin;
                radiusMax = data.radiusMax;
                yScale = data.yScale;
                courseNodeInstance = data.node.gameObject.GetInstanceID();
                type = data.type;
                includeToNeightbourAreas = data.includeToNeightbourAreas;
                raycastFirstNode = data.raycastFirstNode;
                this.info = noise;
            }

            public NoiseEvent(
                Vector3 position,
                float radiusMin,
                float radiusMax,
                float yScale,
                AIG_CourseNode courseNode,
                NM_NoiseType type,
                bool includeToNeightbourAreas,
                bool raycastFirstNode,
                NoiseInfo noise
                ) {
                this.position = position;
                this.radiusMin = radiusMin;
                this.radiusMax = radiusMax;
                this.yScale = yScale;
                courseNodeInstance = courseNode.gameObject.GetInstanceID();
                this.type = type;
                this.includeToNeightbourAreas = includeToNeightbourAreas;
                this.raycastFirstNode = raycastFirstNode;
                this.info = noise;
            }
        }

        [HarmonyPatch]
        private static class Patches {
            internal static List<NoiseEvent> delayedNoiseEvents = new List<NoiseEvent>();
            private static List<NoiseEvent> _delayedNoiseEvents = new List<NoiseEvent>();

            private static Queue<NoiseInfo?> noises = new Queue<NoiseInfo?>();
            internal static NoiseInfo? currentNoiseInfo = null;

            [ReplayInit]
            private static void Init() {
                NoiseManager.noiseDataToProcess.Clear();
                delayedNoiseEvents.Clear();
                _delayedNoiseEvents.Clear();
                noises.Clear();
            }

            [HarmonyPatch(typeof(NoiseManager), nameof(NoiseManager.ProcessNoise))]
            [HarmonyPrefix]
            private static void Prefix_ProcessNoise() {
                if (!SNet.IsMaster) return;

                if (NoiseManager.noiseDataToProcess.Count + 1 != noises.Count) {
                    APILogger.Error("Noises are desynced for an unknown reason...");
                    noises.Clear();
                    while (NoiseManager.noiseDataToProcess.Count + 1 != noises.Count) {
                        noises.Enqueue(null);
                    }
                }

                currentNoise = noises.Dequeue();
            }
            [HarmonyPatch(typeof(NoiseManager), nameof(NoiseManager.ProcessNoise))]
            [HarmonyPostfix]
            private static void Postfix_ProcessNoise() {
                if (!SNet.IsMaster) return;

                currentNoise = null;
            }
            [HarmonyPatch(typeof(NoiseManager), nameof(NoiseManager.MakeNoise))]
            [HarmonyPostfix]
            private static void MakeNoise(NM_NoiseData noiseData) {
                if (!SNet.IsMaster) return;

                // Check if its a delayed noise event => Hacky solution using these 2 buffered lists to avoid patching IEnumerator used
                // by the game to trigger delayed events.
                NoiseEvent? delayedNoiseEvent = null;
                _delayedNoiseEvents.Clear();
                foreach (NoiseEvent delayed in delayedNoiseEvents) {
                    if (
                        delayedNoiseEvent == null &&
                        delayed.position == noiseData.position &&
                        delayed.radiusMin == noiseData.radiusMin &&
                        delayed.radiusMax == noiseData.radiusMax &&
                        delayed.yScale == noiseData.yScale &&
                        delayed.courseNodeInstance == noiseData.node.gameObject.GetInstanceID() &&
                        delayed.type == noiseData.type &&
                        delayed.includeToNeightbourAreas == noiseData.includeToNeightbourAreas &&
                        delayed.raycastFirstNode == noiseData.raycastFirstNode
                    ) {
                        delayedNoiseEvent = delayed;
                    } else {
                        _delayedNoiseEvents.Add(delayed);
                    }
                }
                List<NoiseEvent> temp = _delayedNoiseEvents;
                _delayedNoiseEvents = delayedNoiseEvents;
                delayedNoiseEvents = temp;

                if (delayedNoiseEvent != null) {
                    APILogger.Debug($"Matched sound to a delayed sec door event. {_delayedNoiseEvents.Count} -> {delayedNoiseEvents.Count}");
                    noises.Enqueue(delayedNoiseEvent.info);
                } else {
                    noises.Enqueue(currentNoiseInfo);
                    currentNoiseInfo = null;
                }
            }
        }
    }
}
