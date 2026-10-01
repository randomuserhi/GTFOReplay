using ReplayRecorder.Snapshot.Exceptions;
using ReplayRecorder.Snapshot.Types;
using UnityEngine;

namespace ReplayRecorder.Snapshot {
    internal static partial class SnapshotManager {
        internal static SnapshotTypeManager types = new SnapshotTypeManager();
        internal static SnapshotInstance? instance;
        internal static void Guard(string operation, Action action) {
            IO.CallbackGuard.Run(operation, action, Report);
        }
        internal static void Report(string operation, Exception error) {
            global::API.APILogger.Error($"Recorder failure in {operation}: {error}");
            instance?.FailRecording(operation, error);
        }
        internal static void Invoke(string operation, Action? callbacks) {
            IO.CallbackGuard.Invoke(operation, callbacks, Report);
        }
        internal static void OnElevatorStart() {
            if (instance == null) {
                instance = new GameObject().AddComponent<SnapshotInstance>();
                instance.Init();
            } else throw new ReplaySnapshotAlreadyInitialized();
        }
        internal static bool Ready => instance != null && instance.Ready;
        internal static bool Active => instance != null && instance.Active;
        internal static SnapshotInstance GetInstance() {
            if (instance == null) {
                throw new ReplaySnapshotNotInitialized();
            }
            return instance;
        }
        internal static void OnExpeditionEnd() {
            if (instance != null) {
                Guard("End recording", instance.Dispose);
                instance = null;

                Invoke("Expedition end", Replay.OnExpeditionEnd);
            }
        }
    }
}
