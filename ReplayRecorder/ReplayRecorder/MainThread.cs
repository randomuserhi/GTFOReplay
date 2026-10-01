using System.Collections.Concurrent;
using UnityEngine;

namespace ReplayRecorder {
    public class MainThread : MonoBehaviour {
        private static readonly ConcurrentQueue<Action> queue = new();
        private static int pending;

        public static void Run(Action action) {
            if (Interlocked.Increment(ref pending) > 4096) {
                Interlocked.Decrement(ref pending);
                throw new IOException("Recorder main-thread callback queue exceeded its limit.");
            }
            queue.Enqueue(action);
        }

        private void Update() {
            for (int i = 0; i < 128 && queue.TryDequeue(out Action? action); ++i) {
                Interlocked.Decrement(ref pending);
                if (action != null) Snapshot.SnapshotManager.Guard("Main-thread callback", action);
            }
        }
    }
}
