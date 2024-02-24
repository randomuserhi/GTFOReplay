namespace ReplayRecorder.API {
    public abstract class ReplayEvent : IWriteable {
        public virtual void Write(FileStream fs) { }
    }
}
