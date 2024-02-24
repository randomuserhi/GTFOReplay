namespace ReplayRecorder.API {
    public abstract class ReplayHeader : IWriteable {
        public abstract void Write(FileStream fs);
    }
}