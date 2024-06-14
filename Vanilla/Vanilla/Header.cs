using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;

namespace Vanilla.Metadata {
    [ReplayData("Vanilla.Metadata", "0.0.1")]
    internal class Metadata : ReplayHeader {
        const string Version = "0.0.5";

        [ReplayInit]
        private static void Init() {
            Replay.Trigger(new Metadata());
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(Version, buffer);
        }
    }
}