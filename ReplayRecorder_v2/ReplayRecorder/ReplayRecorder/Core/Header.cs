using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.BepInEx;

namespace ReplayRecorder.Core {
    [ReplayData("ReplayRecorder.Header")]
    internal class HeaderData : ReplayHeader {
        [ReplayInit]
        private static void Init() {
            Replay.Trigger(new HeaderData());
        }

        public override void Write(FileStream fs) {
            BitHelper.WriteBytes(Module.Version, fs);
        }
    }
}
