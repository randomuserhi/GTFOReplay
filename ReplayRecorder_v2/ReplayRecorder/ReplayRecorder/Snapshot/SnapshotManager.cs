using ReplayRecorder.Snapshot.Types;
using UnityEngine;

namespace ReplayRecorder.Snapshot {
    internal static partial class SnapshotManager {
        internal static SnapshotTypeManager types = new SnapshotTypeManager();
        private static SnapshotInstance? instance;
        internal static SnapshotInstance GetInstance() {
            if (instance == null) {
                instance = new GameObject().AddComponent<SnapshotInstance>();
                instance.Init();
            }
            return instance;
        }
        internal static void OnExpeditionEnd() {
            if (instance != null) {
                instance.Dispose();
                instance = null;
            }
        }
    }
}
