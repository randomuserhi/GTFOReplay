namespace ReplayRecorder.API {
    public abstract class ReplayEvent : IWriteable {
        public virtual string? Debug => null;
        public virtual void Write(FileStream fs) { }
    }
}
