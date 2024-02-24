namespace ReplayRecorder.API {
    internal interface IWriteable {
        public void Write(FileStream fs);
    }
}
