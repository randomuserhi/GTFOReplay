namespace ReplayRecorder.Snapshot.Types.Attributes {
    public class ReplayEvent : Attribute {
        public uint EventId { get; private set; }
        public string EventName { get; private set; }

        public ReplayEvent(string eventName) {
            EventName = eventName;
        }
    }
}
