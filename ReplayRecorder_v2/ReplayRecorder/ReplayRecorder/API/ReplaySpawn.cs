namespace ReplayRecorder.API {
    public abstract class ReplaySpawn : ReplayEvent {
        public int Id { get; private set; }
        internal ushort type = ushort.MaxValue;

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
