using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.BepInEx;
using ReplayRecorder.Snapshot;

namespace ReplayRecorder.Core {
    [ReplayData("ReplayRecorder.EndOfHeader", "0.0.1")]
    internal class EndOfHeader : ReplayEvent {
        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(SnapshotManager.types[typeof(EndOfHeader)], buffer);
        }
    }

    [ReplayData("ReplayRecorder.Header", "0.0.1")]
    internal class HeaderData : ReplayHeader {
        [ReplayInit]
        private static void Init() {
            Replay.Trigger(new HeaderData());
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(Module.Version, buffer);
            BitHelper.WriteBytes(SNetwork.SNet.IsMaster, buffer);
        }
    }
}
