using API;
using ChainedPuzzles;
using HarmonyLib;
using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;

namespace Vanilla.ChainedPuzzles {
    internal struct BioscanTransform : IReplayTransform {
        private CP_Bioscan_Core bioscan;

        public bool active => bioscan != null;
        public byte dimensionIndex => (byte)bioscan.m_courseNode.m_dimension.DimensionIndex;
        public Vector3 position => bioscan.transform.position;
        public Quaternion rotation => Quaternion.identity;

        public BioscanTransform(CP_Bioscan_Core bioscan) {
            this.bioscan = bioscan;
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.Bioscan", "0.0.1")]
    public class rBioscan : DynamicPosition {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(CP_Bioscan_Core), nameof(CP_Bioscan_Core.OnSyncStateChange))]
            [HarmonyPostfix]
            private static void Postfix_Bioscan_SetState(CP_Bioscan_Core __instance, eBioscanStatus status, float progress, List<PlayerAgent> playersInScan, int playersMax, bool[] reqItemStatus, bool isDropinState) {
                CP_PlayerScanner? pscanner = __instance.m_playerScanner.TryCast<CP_PlayerScanner>();
                if (pscanner == null) {
                    APILogger.Error("Unable to find pscanner component for bioscan.");
                    return;
                }

                int id = __instance.GetInstanceID();
                switch (status) {
                case eBioscanStatus.Waiting:
                case eBioscanStatus.Scanning:
                    if (!Replay.Has<rBioscan>(id)) Replay.Spawn(new rBioscan(__instance, pscanner.m_scanRadius));
                    if (!Replay.Has<rBioscanStatus>(id)) Replay.Spawn(new rBioscanStatus(__instance));
                    break;
                case eBioscanStatus.SplineReveal:
                case eBioscanStatus.TimedOut:
                case eBioscanStatus.Disabled:
                case eBioscanStatus.Finished:
                    if (Replay.Has<rBioscan>(id)) Replay.Despawn(Replay.Get<rBioscan>(id));
                    if (Replay.Has<rBioscanStatus>(id)) Replay.Despawn(Replay.Get<rBioscanStatus>(id));
                    break;
                }
            }
        }

        private CP_Bioscan_Core bioscan;

        private float radius;

        public rBioscan(CP_Bioscan_Core bioscan, float radius) : base(bioscan.GetInstanceID(), new BioscanTransform(bioscan)) {
            this.bioscan = bioscan;
            this.radius = radius;
        }

        public override void Spawn(ByteBuffer buffer) {
            base.Spawn(buffer);
            BitHelper.WriteHalf(radius, buffer);
        }
    }

    [ReplayData("Vanilla.Bioscan.Status", "0.0.2")]
    public class rBioscanStatus : ReplayDynamic {
        private CP_Bioscan_Core bioscan;
        private CP_Bioscan_Graphics graphics;

        public override bool Active => bioscan != null;
        public override bool IsDirty {
            get {
                return progress != oldProgress ||
                    r != oldR || g != oldG || b != oldB;
            }
        }

        private byte progress => (byte)(bioscan.m_sync.GetCurrentState().progress * byte.MaxValue);
        private byte oldProgress = 0;
        private byte r => (byte)(graphics.m_currentCol.r * byte.MaxValue);
        private byte g => (byte)(graphics.m_currentCol.g * byte.MaxValue);
        private byte b => (byte)(graphics.m_currentCol.b * byte.MaxValue);

        private byte oldR = 0;
        private byte oldG = 0;
        private byte oldB = 0;

        public rBioscanStatus(CP_Bioscan_Core bioscan) : base(bioscan.GetInstanceID()) {
            this.bioscan = bioscan;
            graphics = bioscan.m_graphics.TryCast<CP_Bioscan_Graphics>()!;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(progress, buffer);
            BitHelper.WriteBytes(r, buffer);
            BitHelper.WriteBytes(g, buffer);
            BitHelper.WriteBytes(b, buffer);

            oldProgress = progress;
            oldR = r;
            oldG = g;
            oldB = b;
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }
}
