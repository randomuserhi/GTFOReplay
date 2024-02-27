namespace ReplayRecorder.API {
    public abstract class ReplayDespawn : ReplayEvent {
        public int Id { get; private set; }
        internal ushort type = ushort.MaxValue;

        public ReplayDespawn(ReplayDynamic dynamic) {
            Id = dynamic.Id;
        }

        public ReplayDespawn(int id) {
            Id = id;
        }

        internal override void _Write(ByteBuffer buffer) {
            BitHelper.WriteBytes((byte)2, buffer);
            BitHelper.WriteBytes(type, buffer);
            BitHelper.WriteBytes(Id, buffer);
        }
    }
}
