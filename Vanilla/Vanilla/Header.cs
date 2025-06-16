using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using Vanilla.BepInEx;

namespace Vanilla.Metadata {
    [ReplayData("Vanilla.Metadata", "0.0.4")]
    internal class rMetadata : ReplayHeader {
        const string Version = "0.1.8";

        public static bool OldBulkheadSound_Compatibility = false;
        public static bool NoArtifact_Compatibility = false;

        [ReplayInit]
        private static void Init() {
            Replay.Trigger(new rMetadata());
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(Version, buffer);
            BitHelper.WriteBytes(OldBulkheadSound_Compatibility, buffer);
            BitHelper.WriteBytes(NoArtifact_Compatibility, buffer);
            BitHelper.WriteBytes(ConfigManager.RecordEnemyRagdolls, buffer);
        }
    }
}