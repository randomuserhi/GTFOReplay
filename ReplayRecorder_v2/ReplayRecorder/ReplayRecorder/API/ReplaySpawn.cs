using ReplayRecorder.API.Attributes;

namespace ReplayRecorder.API {
    [ReplayData("ReplayRecorder.Spawn", "0.0.1")]
    public class ReplaySpawn : ReplayEvent {
        public int Id { get; private set; }
        internal ushort type = ushort.MaxValue;

        public override string? Debug => $"{Id}";

        public ReplaySpawn(ReplayDynamic dynamic) {
            Id = dynamic.Id;
        }

        public ReplaySpawn(int id) {
            Id = id;
        }
        internal override void _Write(ByteBuffer buffer) {
            BitHelper.WriteBytes((byte)1, buffer);
            BitHelper.WriteBytes(type, buffer);
            BitHelper.WriteBytes(Id, buffer);
        }
    }
}
