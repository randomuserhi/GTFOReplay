namespace ReplayRecorder.API {
    public abstract class ReplayHeader : IWriteable {
        public virtual string? Debug => null;

        public abstract void Write(ByteBuffer buffer);
    }
}