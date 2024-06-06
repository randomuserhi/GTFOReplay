using HarmonyLib;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;

namespace Vanilla.Sentries {
    internal struct SentryTransform : IReplayTransform {
        private SentryGunInstance sentry;

        public bool active => sentry != null;
        public byte dimensionIndex => (byte)sentry.CourseNode.m_dimension.DimensionIndex;
        public Vector3 position => sentry.transform.position;
        public Quaternion rotation => sentry.m_firing == null ? sentry.transform.rotation : Quaternion.LookRotation(sentry.m_firing.MuzzleAlign.forward);

        public SentryTransform(SentryGunInstance sentry) {
            this.sentry = sentry;
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.Sentry", "0.0.1")]
    internal class rSentry : DynamicRotation {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(SentryGunInstance), nameof(SentryGunInstance.OnSpawn))]
            [HarmonyPostfix]
            private static void Postfix_OnSpawn(SentryGunInstance __instance, pGearSpawnData spawnData) {
                Replay.Spawn(new rSentry(__instance));
            }

            [HarmonyPatch(typeof(SentryGunInstance), nameof(SentryGunInstance.OnDespawn))]
            [HarmonyPostfix]
            private static void Postfix_OnDespawn(SentryGunInstance __instance) {
                Replay.Despawn(Replay.Get<rSentry>(__instance.GetInstanceID()));
            }
        }

        private SentryGunInstance sentry;

        private Vector3 spawnPosition;
        private byte spawnDimension;

        public rSentry(SentryGunInstance sentry) : base(sentry.GetInstanceID(), new SentryTransform(sentry)) {
            this.sentry = sentry;
            spawnPosition = transform.position;
            spawnDimension = transform.dimensionIndex;
        }

        public override void Spawn(ByteBuffer buffer) {
            BitHelper.WriteBytes(spawnDimension, buffer);
            BitHelper.WriteBytes(spawnPosition, buffer);
            base.Spawn(buffer);
            BitHelper.WriteBytes(sentry.Owner.GlobalID, buffer);
        }
    }
}
