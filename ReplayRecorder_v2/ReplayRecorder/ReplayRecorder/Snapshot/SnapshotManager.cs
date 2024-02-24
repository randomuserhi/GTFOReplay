using API;
using UnityEngine;

namespace ReplayRecorder.Snapshot {
    internal partial class SnapshotManager : MonoBehaviour {
        private static SnapshotManager? singleton;

        private void Awake() {
            if (singleton != null) {
                APILogger.Warn("SnapshotManager was already created.");
                Destroy(gameObject);
            }
        }

        private void Update() {
        }
    }
}
