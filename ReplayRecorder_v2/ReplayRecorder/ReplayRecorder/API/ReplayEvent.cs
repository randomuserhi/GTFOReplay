namespace ReplayRecorder.API {
    public abstract class ReplayEvent {
        public virtual string? Debug => null;
        internal virtual void _Write(ByteBuffer buffer) {
            BitHelper.WriteBytes((byte)0, buffer);
        }
        public virtual void Write(ByteBuffer buffer) { }
    }
}
