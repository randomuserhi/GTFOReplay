using Il2CppInterop.Runtime.Attributes;
using ReplayRecorder.API;
using ReplayRecorder.Snapshot;
using System.Diagnostics.CodeAnalysis;

namespace ReplayRecorder {
    public static partial class Replay {
        // Unity can deliver destruction and combat callbacks after expedition teardown.
        // Optional operations use one active session; strict operations retain their errors.
        /// <summary>
        /// </summary>
        /// <typeparam name="T">The dynamic type to configure.</typeparam>
        /// <param name="tickRate">The frequency that this type gets recorded at. E.g 1 - every tick, 2 - every other tick, 3 - every third tick etc...</param>
        /// <param name="max">The maximum number of dynamics checked each tick. Unchecked dynamics roll over and are checked next tick.</param>
        [HideFromIl2Cpp]
        public static void Configure<T>(int tickRate = 1, int max = int.MaxValue) where T : ReplayDynamic => SnapshotManager.GetInstance().Configure<T>(tickRate, max);

        /// <summary>
        /// Triggers an event to be written next tick.
        /// </summary>
        /// <param name="e"></param>
        /// <returns>True if the event was successfully triggered; false when no recording is active or the write failed.</returns>
        [HideFromIl2Cpp]
        public static bool Trigger(ReplayEvent e) => SnapshotManager.instance is { Active: true } session && session.Trigger(e);

        /// <summary>
        /// Triggers a header to be written.
        /// </summary>
        /// <param name="header"></param>
        [HideFromIl2Cpp]
        public static void Trigger(ReplayHeader header) => SnapshotManager.GetInstance().Trigger(header);

        /// <summary>
        /// Checks if the provided dynamic is tracked by an active recording.
        /// </summary>
        /// <param name="dynamic"></param>
        /// <returns></returns>
        [HideFromIl2Cpp]
        public static bool Has(ReplayDynamic dynamic) => SnapshotManager.instance is { Active: true } session && session.Has(dynamic);

        /// <summary>
        /// Checks if the provided dynamic is tracked by an active recording.
        /// </summary>
        /// <typeparam name="T">Type of dynamic.</typeparam>
        /// <param name="id">id of dynamic to check.</param>
        /// <returns></returns>
        [HideFromIl2Cpp]
        public static bool Has<T>(int id) where T : ReplayDynamic => SnapshotManager.instance is { Active: true } session && session.Has(typeof(T), id);

        /// <summary>
        /// Gets a tracked dynamic by id.
        /// </summary>
        /// <typeparam name="T">Type of dynamic.</typeparam>
        /// <param name="id">id of dynamic to get.</param>
        /// <returns></returns>
        [HideFromIl2Cpp]
        public static T Get<T>(int id) where T : ReplayDynamic => (T)SnapshotManager.GetInstance().Get(typeof(T), id);

        /// <summary>
        /// Attempts to get a tracked dynamic by id. Returns false outside an active recording.
        /// </summary>
        /// <typeparam name="T">Type of dynamic.</typeparam>
        /// <param name="id">id of dynamic to get.</param>
        /// <param name="dynamic">dynamic found.</param>
        /// <returns>True if the dynamic exists and was obtained, otherwise False.</returns>
        [HideFromIl2Cpp]
        public static bool TryGet<T>(int id, [NotNullWhen(true)] out T dynamic) where T : ReplayDynamic {
            if (SnapshotManager.instance is { Active: true } session && session.Has(typeof(T), id)) {
                dynamic = (T)session.Get(typeof(T), id);
                return true;
            }
            dynamic = null!;
            return false;
        }

        /// <summary>
        /// Triggers despawn events for all dynamics in the given collection.
        /// </summary>
        ///
        [HideFromIl2Cpp]
        public static void Clear<T>() where T : ReplayDynamic => SnapshotManager.GetInstance().Clear(typeof(T));

        /// <summary>
        /// Triggers a spawn event for a given dynamic, and begins tracking it.
        /// </summary>
        /// <param name="dynamic">Dynamic to spawn and track.</param>
        /// <param name="errorOnDuplicate">If True, an exception will be raised when spawning the same dynamic twice. Otherwise, silently discard.</param>
        [HideFromIl2Cpp]
        public static void Spawn(ReplayDynamic dynamic, bool errorOnDuplicate = true) => SnapshotManager.GetInstance().Spawn(dynamic, errorOnDuplicate);

        /// <summary>
        /// Triggers a despawn event for a given dynamic, and stops tracking it.
        /// </summary>
        /// <param name="dynamic">Dynamic to despawn and no longer track.</param>
        /// <param name="errorOnNotFound">If True, an exception will be raised when despawning a non-existant dynamic. Otherwise, silently discard.</param>
        [HideFromIl2Cpp]
        public static void Despawn(ReplayDynamic dynamic, bool errorOnNotFound = true) => SnapshotManager.GetInstance().Despawn(dynamic, errorOnNotFound);

        /// <summary>
        /// Tries to despawn a dynamic. Returns false outside an active recording.
        /// </summary>
        /// <typeparam name="T">Type of dynamic.</typeparam>
        /// <param name="id">id of dynamic.</param>
        /// <returns>True if the dynamic existed and was despawned, otherwise false.</returns>
        [HideFromIl2Cpp]
        public static bool TryDespawn<T>(int id) where T : ReplayDynamic {
            if (SnapshotManager.instance is { Active: true } session && session.Has(typeof(T), id)) {
                session.Despawn(session.Get(typeof(T), id));
                return true;
            }
            return false;
        }

        /// <summary>
        /// The current tick rate that snapshots are taken at.
        /// </summary>
        public static float tickRate => SnapshotManager.GetInstance().tickRate;

        /// <summary>
        /// If True, the replay header has completed being written, and snapshots will now be taken every tick.
        /// </summary>
        public static bool Ready => SnapshotManager.Ready;

        /// <summary>
        /// If True, the replay recorder is running and data is being written.
        /// </summary>
        public static bool Active => SnapshotManager.Active;

    }
}
