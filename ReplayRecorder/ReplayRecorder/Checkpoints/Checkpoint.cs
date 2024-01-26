using API;

namespace ReplayRecorder.Checkpoints {
    internal class Checkpoint {
        public static void Triggered() {
            APILogger.Debug("Checkpoint triggered!");
            SnapshotManager.AddEvent(GameplayEvent.Type.Checkpoint, null);
        }
    }
}
