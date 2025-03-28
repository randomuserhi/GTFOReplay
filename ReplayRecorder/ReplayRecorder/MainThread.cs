using System.Collections.Concurrent;
using UnityEngine;

namespace ReplayRecorder {
    public class MainThread : MonoBehaviour {
        private static MainThread? _instance;
        private static MainThread Instance {
            get {
                if (_instance == null) {
                    _instance = new GameObject().AddComponent<MainThread>();
                }
                return _instance;
            }
        }

        private ConcurrentQueue<Action> queue = new ConcurrentQueue<Action>();

        public static void Run(Action action) {
            Instance.queue.Enqueue(action);
        }

        private void Update() {
            while (queue.TryDequeue(out Action? action)) {
                action?.Invoke();
            }
        }
    }
}
