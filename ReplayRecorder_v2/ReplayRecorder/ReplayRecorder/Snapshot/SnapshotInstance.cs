using API;
using ReplayRecorder.API;
using ReplayRecorder.Core;
using ReplayRecorder.Snapshot.Exceptions;
using ReplayRecorder.Snapshot.Types;
using System.Runtime.CompilerServices;
using UnityEngine;

namespace ReplayRecorder.Snapshot {
    internal class SnapshotInstance : MonoBehaviour {
        private class EventWrapper : IWriteable {
            private ushort id;
            private ReplayEvent e;
            internal long now;

            public string? Debug => e.Debug;

            public EventWrapper(long now, ReplayEvent e) {
                this.now = now;
                this.e = e;
                id = SnapshotManager.types[e.GetType()];
            }

            public void Write(FileStream fs) {
                BitHelper.WriteBytes(id, fs);
                e.Write(fs);
            }
        }

        private FileStream? fs;

        private long start = 0;
        private long Now => Raudy.Now - start;

        private bool completedHeader = false;
        private HashSet<Type> unwrittenHeaders = new HashSet<Type>();

        private List<EventWrapper> events = new List<EventWrapper>();

        private List<ReplayDynamic> _dynamics = new List<ReplayDynamic>();
        private List<ReplayDynamic> dynamics = new List<ReplayDynamic>();
        private Dictionary<int, ReplayDynamic> mapOfDynamics = new Dictionary<int, ReplayDynamic>();

        internal void Init() {
            if (fs != null) throw new ReplaySnapshotAlreadyInitialized();

            fs = new FileStream("replay.gtfo", FileMode.Create, FileAccess.Write, FileShare.Read);
            SnapshotManager.types.Write(fs);
            foreach (Type t in SnapshotManager.types.headers) {
                unwrittenHeaders.Add(t);
            }
        }

        internal void Trigger(ReplayHeader header) {
            if (fs == null) throw new ReplaySnapshotNotInitialized();

            if (completedHeader || unwrittenHeaders.Count == 0) {
                completedHeader = true;
                throw new ReplayAllHeadersAlreadyWritten();
            }

            Type headerType = header.GetType();
            if (!unwrittenHeaders.Remove(headerType)) {
                throw new ReplayHeaderAlreadyWritten($"Header '{headerType}' was already written.");
            }
            ushort id = SnapshotManager.types[headerType];
            APILogger.Debug($"[Header: {headerType.FullName}({id})]{(header.Debug != null ? $": {header.Debug}" : "")}");
            BitHelper.WriteBytes(id, fs);
            header.Write(fs);

            if (unwrittenHeaders.Count == 0) {
                BitHelper.WriteBytes((ushort)SnapshotTypeManager.Const.HeaderEnd, fs);
                completedHeader = true;
                OnHeaderComplete();
            }
        }

        private void OnHeaderComplete() {
            if (fs == null) throw new ReplaySnapshotNotInitialized();
            APILogger.Debug("All headers written.");

            fs.Flush();
            start = Raudy.Now;

            Replay.OnHeaderCompletion?.Invoke();
        }

        internal void Trigger(ReplayEvent e) {
            if (!completedHeader) throw new ReplayNotAllHeadersWritten();
            if (BepInEx.ConfigManager.Debug) APILogger.Debug($"[Event: {e.GetType().FullName}({SnapshotManager.types[e.GetType()]})]{(e.Debug != null ? $": {e.Debug}" : "")}");
            events.Add(new EventWrapper(Now, e));
        }

        internal void Spawn(ReplayDynamic dynamic) {
            if (!completedHeader) throw new ReplayNotAllHeadersWritten();
            if (mapOfDynamics.ContainsKey(dynamic.Id)) throw new ReplayDynamicAlreadyExists($"Dynamic [{dynamic.Id}] already exists.");
            Type dynamicType = dynamic.GetType();
            if (!SnapshotManager.types.Contains(dynamicType)) throw new ReplayTypeDoesNotExist($"Type '{dynamicType.FullName}' does not exist.");

            Trigger(new SpawnDynamic(dynamic.Id));
            dynamics.Add(dynamic);
            mapOfDynamics.Add(dynamic.Id, dynamic);
        }

        internal void Spawn(ReplayDynamic dynamic, byte dimensionIndex, Vector3 position) {
            Spawn(dynamic, dimensionIndex, position, Quaternion.identity);
        }
        internal void Spawn(ReplayDynamic dynamic, byte dimensionIndex, Vector3 position, Quaternion rotation) {
            if (!completedHeader) throw new ReplayNotAllHeadersWritten();
            if (mapOfDynamics.ContainsKey(dynamic.Id)) throw new ReplayDynamicAlreadyExists($"Dynamic [{dynamic.Id}] already exists.");
            Type dynamicType = dynamic.GetType();
            if (!SnapshotManager.types.Contains(dynamicType)) throw new ReplayTypeDoesNotExist($"Type '{dynamicType.FullName}' does not exist.");

            Trigger(new SpawnDynamicAt(dynamic.Id, (byte)dimensionIndex, position, rotation));
            dynamics.Add(dynamic);
            mapOfDynamics.Add(dynamic.Id, dynamic);
        }

        internal void Despawn(int id) {
            if (!completedHeader) throw new ReplayNotAllHeadersWritten();
            if (!mapOfDynamics.ContainsKey(id)) throw new ReplayDynamicDoesNotExist($"Dynamic [{id}] does not exist.");

            Trigger(new DespawnDynamic(id));
            mapOfDynamics[id].remove = true;
            mapOfDynamics.Remove(id);
        }
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        internal void Despawn(ReplayDynamic dynamic) {
            Despawn(dynamic.Id);
        }

        private void Tick() {
            if (fs == null) throw new ReplaySnapshotNotInitialized();
            if (!completedHeader) throw new ReplayNotAllHeadersWritten();

            // Check if this tick needs to be done
            // - are there any dynamics to serialize?
            // - are there any events to serialize?
            int nDirtyDynamics = (ushort)dynamics.Where(d => d.IsDirty).Count();
            if (nDirtyDynamics == 0 && events.Count == 0)
                return;

            // Tick header
            long _Now = Now;
            if (_Now > uint.MaxValue) {
                Dispose();
                throw new ReplayInvalidTimestamp($"ReplayRecorder does not support replays longer than {uint.MaxValue}ms.");
            }
            BitHelper.WriteBytes((uint)_Now, fs);

            // Write Events
            for (int i = 0; i < events.Count; ++i) {
                EventWrapper e = events[i];

                long delta = _Now - e.now;
                if (delta < 0 || delta > ushort.MaxValue) {
                    throw new ReplayInvalidDeltaTime($"Delta time of {delta}ms is invalid. Max is {ushort.MaxValue}ms and minimum is 0ms.");
                }

                // Event header
                BitHelper.WriteBytes((ushort)delta, fs);
                e.Write(fs);
            }

            // Serialize dynamic properties
            BitHelper.WriteBytes(nDirtyDynamics, fs);
            _dynamics.Clear();
            for (int i = 0; i < dynamics.Count; i++) {
                ReplayDynamic dynamic = dynamics[i];

                if (!dynamic.remove) {
                    if (dynamic.IsDirty) {
                        if (BepInEx.ConfigManager.Debug && BepInEx.ConfigManager.DebugDynamics) APILogger.Debug($"[Dynamic: {dynamic.GetType().FullName}({SnapshotManager.types[dynamic.GetType()]})]{(dynamic.Debug != null ? $": {dynamic.Debug}" : "")}");
                        dynamic.Write(fs);
                    }
                    _dynamics.Add(dynamic);
                }
            }
            List<ReplayDynamic> temp = dynamics;
            dynamics = _dynamics;
            _dynamics = temp;

            // Flush file stream
            fs.Flush();

            // Flush event buffer
            events.Clear();
        }

        internal void Dispose() {
            if (fs != null) {
                fs.Flush();
                fs.Dispose();
                fs = null;
            }

            Destroy(gameObject);
        }

        private float tickRate = 1f / 5f;
        private float timer = 0;
        private void Update() {
            if (fs == null || !completedHeader) {
                return;
            }

            float rate;
            // Change tick rate based on state:
            switch (DramaManager.CurrentStateEnum) {
            case DRAMA_State.Encounter:
            case DRAMA_State.Survival:
            case DRAMA_State.IntentionalCombat:
            case DRAMA_State.Combat:
                rate = 1f / 20f;
                break;
            default:
                rate = 1f / 5f;
                break;
            }
            if (tickRate != rate) {
                timer = 0;
                tickRate = rate;
            }

            timer += Time.deltaTime;
            if (timer > tickRate) {
                timer = 0;
                Tick();
            }
        }
    }
}
