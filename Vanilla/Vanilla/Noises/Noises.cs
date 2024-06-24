using AIGraph;
using GameData;
using Gear;
using HarmonyLib;
using LevelGeneration;
using Player;
using ReplayRecorder.SNetUtils;
using SNetwork;

namespace Vanilla.Noises {
    [HarmonyPatch]
    internal class Noises {
        [HarmonyPatch(typeof(NoiseManager), nameof(NoiseManager.ReceiveNoise))]
        [HarmonyPostfix]
        private static void RemoteNoise(pNM_NoiseData data) {
            if (!SNet.IsMaster) return;

            PlayerAgent? agent = null;
            if (SNetUtils.TryGetSender(NoiseManager.s_noisePacket, out SNet_Player? player)) {
                agent = player.PlayerAgent.TryCast<PlayerAgent>();
            }
            NoiseTracker.TrackNextNoise(new NoiseInfo(agent));
        }

        // Local Player Melee
        private static bool fromMWS_AttackHit = false;
        [HarmonyPatch(typeof(MWS_AttackHit), nameof(MWS_AttackHit.Update))]
        [HarmonyPrefix]
        private static void Prefix_MWS_AttackHit() {
            fromMWS_AttackHit = true;
        }
        [HarmonyPatch(typeof(MWS_AttackHit), nameof(MWS_AttackHit.Update))]
        [HarmonyPostfix]
        private static void Postfix_MWS_AttackHit() {
            fromMWS_AttackHit = false;
        }
        [HarmonyPatch(typeof(NoiseManager), nameof(NoiseManager.MakeNoise))]
        [HarmonyPrefix]
        private static void MakeNoise() {
            if (fromMWS_AttackHit) {
                NoiseTracker.TrackNextNoise(new NoiseInfo(PlayerManager.GetLocalPlayerAgent()));
            }
        }

        // Sentry gun noises
        [HarmonyPatch(typeof(SentryGunInstance), nameof(SentryGunInstance.OnGearSpawnComplete))]
        [HarmonyPostfix]
        private static void SentryShootNoise(SentryGunInstance __instance) {
            if (!SNet.IsMaster) return;

            SentryGunInstance_Firing_Bullets firing = __instance.m_firing.Cast<SentryGunInstance_Firing_Bullets>();
            Il2CppSystem.Action? previous = firing.OnBulletFired;
            firing.OnBulletFired = (Action)(() => {
                // NOTE(randomuserhi): Sentry guns are only eligible to make noise based on the noise timer,
                //                     thus may not alert enemies if caught inbetween this noise timer.
                if (__instance.m_noiseTimer < Clock.Time) {
                    NoiseTracker.TrackNextNoise(new NoiseInfo(__instance.Owner));
                }
                previous?.Invoke();
            });
        }

        // Spitter noise
        [HarmonyPatch(typeof(InfectionSpitter), nameof(InfectionSpitter.Update))]
        [HarmonyPrefix]
        private static void SpitterExplodeNoise(InfectionSpitter __instance) {
            if (!SNet.IsMaster) return;
            if (!__instance.m_hasNode) return;
            if (__instance.m_isExploding) {
                if (__instance.m_explodeProgression > 1.6f) {
                    NoiseTracker.TrackNextNoise(new NoiseInfo());
                }
            }
        }
        // Door breaking
        [HarmonyPatch(typeof(LG_WeakDoor_Destruction), nameof(LG_WeakDoor_Destruction.TriggerExplosionEffect))]
        [HarmonyPrefix]
        private static void DoorBreakNoise(LG_WeakDoor_Destruction __instance) {
            if (!SNet.IsMaster) return;
            if (!(__instance.m_destructionController == null)) {
                NoiseTracker.TrackNextNoise(new NoiseInfo());
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

                        NoiseTracker.TrackNextDelayedNoise(
                            __instance.transform.position,
                            e.Noise.RadiusMin,
                            e.Noise.RadiusMax,
                            1f,
                            courseNode,
                            NM_NoiseType.InstaDetect,
                            true,
                            false,
                            new NoiseInfo());
                    }
                }
            }
        }
    }
}
