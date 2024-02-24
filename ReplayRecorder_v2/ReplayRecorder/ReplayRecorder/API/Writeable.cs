namespace ReplayRecorder.API {
    interface IWriteable {
        public void Write(FileStream fs);
    }
}
