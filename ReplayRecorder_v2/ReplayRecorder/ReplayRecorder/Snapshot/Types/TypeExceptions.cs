namespace ReplayRecorder.Snapshot.Exceptions {
    public class ReplayEmptyTypename : Exception {
        public ReplayEmptyTypename(string message) : base(message) { }
    }
    public class ReplayIncompatibleType : Exception {
        public ReplayIncompatibleType(string message) : base(message) { }
    }
    public class ReplayTypeDoesNotExist : Exception {
        public ReplayTypeDoesNotExist(string message) : base(message) { }
    }
    public class ReplayDuplicateTypeName : Exception {
        public ReplayDuplicateTypeName(string message) : base(message) { }
    }
    public class ReplayDuplicateType : Exception {
        public ReplayDuplicateType(string message) : base(message) { }
    }
    public class ReplayTypeOverflow : Exception {
        public ReplayTypeOverflow(string message) : base(message) { }
    }
}
