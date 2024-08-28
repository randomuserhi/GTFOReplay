using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;

namespace Vanilla.Metadata {
    [ReplayData("Vanilla.Metadata", "0.0.2")]
    internal class rMetadata : ReplayHeader {
        const string Version = "0.1.2";

        public static bool OldBulkheadSound_Compatability = false;

        [ReplayInit]
        private static void Init() {
            Replay.Trigger(new rMetadata());
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(Version, buffer);
            BitHelper.WriteBytes(OldBulkheadSound_Compatability, buffer);
        }
    }
}