namespace ReplayRecorder.API {
    public abstract class ReplayDynamic : IWriteable {
        internal bool remove = false;

        public virtual string? Debug => null;

        public abstract int Id { get; }
        public abstract bool IsDirty { get; }

        public virtual void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(Id, buffer);
        }
    }
}
