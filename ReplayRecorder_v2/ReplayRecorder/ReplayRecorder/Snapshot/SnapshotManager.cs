﻿using ReplayRecorder.Snapshot.Exceptions;
using ReplayRecorder.Snapshot.Types;
using UnityEngine;

namespace ReplayRecorder.Snapshot {
    internal static partial class SnapshotManager {
        internal static SnapshotTypeManager types = new SnapshotTypeManager();
        private static SnapshotInstance? instance;
        internal static void OnElevatorStart() {
            if (instance == null) {
                instance = new GameObject().AddComponent<SnapshotInstance>();
                instance.Init();
            } else throw new ReplaySnapshotAlreadyInitialized();
        }

        internal static SnapshotInstance GetInstance() {
            if (instance == null) {
                throw new ReplaySnapshotNotInitialized();
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