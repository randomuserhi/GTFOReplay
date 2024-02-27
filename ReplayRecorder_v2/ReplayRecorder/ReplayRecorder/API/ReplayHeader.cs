namespace ReplayRecorder.API {
    public abstract class ReplayHeader {
        public virtual string? Debug => null;
        public abstract void Write(ByteBuffer buffer);
    }
}