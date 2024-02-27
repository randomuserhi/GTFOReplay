namespace ReplayRecorder.API {
    public abstract class ReplayDynamic {
        internal bool remove = false;

        public virtual string? Debug => null;

        public abstract int Id { get; }
        public abstract bool IsDirty { get; }

        internal virtual void _Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(Id, buffer);
        }

        public virtual void Write(ByteBuffer buffer) { }
    }
}
