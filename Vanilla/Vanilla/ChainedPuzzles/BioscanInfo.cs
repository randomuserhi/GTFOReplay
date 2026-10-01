using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;

namespace Vanilla.ChainedPuzzles {
    [ReplayData("Vanilla.Bioscan.Info", "0.0.1")]
    internal class rBioscanInfo : ReplayEvent {
        private readonly int id;
        private readonly byte state, players, required, missingItems;
        private readonly bool exit, alarm;
        private readonly string requirement;
        private static readonly Dictionary<int, string> previous = new();
        [ReplayOnStartRecording]
        private static void Reset(string _) => previous.Clear();

        internal rBioscanInfo(int id, byte state, int players, int required, int missingItems, bool exit, bool alarm, string requirement) {
            this.id = id; this.state = state; this.players = (byte)Math.Clamp(players, 0, 255);
            this.required = (byte)Math.Clamp(required, 0, 255); this.missingItems = (byte)Math.Clamp(missingItems, 0, 255);
            this.exit = exit; this.alarm = alarm; this.requirement = requirement;
        }
        internal void Publish() {
            if (!Replay.Active) return;
            string key = $"{state}/{players}/{required}/{missingItems}/{exit}/{alarm}/{requirement}";
            if (previous.TryGetValue(id, out var old) && old == key) return;
            previous[id] = key;
            Replay.Trigger(this);
        }
        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(id, buffer); BitHelper.WriteBytes(state, buffer);
            BitHelper.WriteBytes(players, buffer); BitHelper.WriteBytes(required, buffer); BitHelper.WriteBytes(missingItems, buffer);
            BitHelper.WriteBytes(exit, buffer); BitHelper.WriteBytes(alarm, buffer); BitHelper.WriteBytes(requirement, buffer);
        }
    }
}
