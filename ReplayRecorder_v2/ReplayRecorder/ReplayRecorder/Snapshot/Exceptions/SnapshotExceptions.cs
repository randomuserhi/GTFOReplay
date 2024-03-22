namespace ReplayRecorder.Snapshot.Exceptions {
    public class ReplayNumWrittenDoesntMatch : Exception {
        public ReplayNumWrittenDoesntMatch(string message) : base(message) { }
    }

    public class ReplaySnapshotAlreadyInitialized : Exception {
        public ReplaySnapshotAlreadyInitialized() : base("Snapshot has already been initialized.") { }
    }

    public class ReplaySnapshotNotInitialized : Exception {
        public ReplaySnapshotNotInitialized() : base("Snapshot has not been initialized yet.") { }
    }

    public class ReplayAllHeadersAlreadyWritten : Exception {
        public ReplayAllHeadersAlreadyWritten(string message) : base(message) { }
    }

    public class ReplayHeaderAlreadyWritten : Exception {
        public ReplayHeaderAlreadyWritten(string message) : base(message) { }
    }

    public class ReplayDynamicDoesNotExist : Exception {
        public ReplayDynamicDoesNotExist(string message) : base(message) { }
    }

    public class ReplayDynamicAlreadyExists : Exception {
        public ReplayDynamicAlreadyExists(string message) : base(message) { }
    }

    public class ReplayInvalidDeltaTime : Exception {
        public ReplayInvalidDeltaTime(string message) : base(message) { }
    }

    public class ReplayInvalidTimestamp : Exception {
        public ReplayInvalidTimestamp(string message) : base(message) { }
    }
}
