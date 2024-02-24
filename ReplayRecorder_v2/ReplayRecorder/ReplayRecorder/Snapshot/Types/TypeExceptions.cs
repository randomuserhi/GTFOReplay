namespace ReplayRecorder.Snapshot.Exceptions {
    public class ReplayRecorderDuplicateTypeName : Exception {
        public ReplayRecorderDuplicateTypeName(string message) : base(message) { }
    }
    public class ReplayRecorderTypeOverflow : Exception {
        public ReplayRecorderTypeOverflow(string message) : base(message) { }
    }
}
