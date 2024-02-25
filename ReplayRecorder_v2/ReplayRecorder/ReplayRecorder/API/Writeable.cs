namespace ReplayRecorder.API {
    internal interface IWriteable {
        public string? Debug { get; }
        public void Write(ByteBuffer buffer);
    }
}
