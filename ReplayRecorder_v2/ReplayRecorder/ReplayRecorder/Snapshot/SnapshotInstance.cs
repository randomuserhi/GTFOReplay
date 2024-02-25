using API;
using GameData;
using Globals;
using Il2CppInterop.Runtime.Attributes;
using ReplayRecorder.API;
using ReplayRecorder.BepInEx;
using ReplayRecorder.Core;
using ReplayRecorder.Snapshot.Exceptions;
using System.Runtime.CompilerServices;
using UnityEngine;

namespace ReplayRecorder.Snapshot {
    internal class SnapshotInstance : MonoBehaviour {
        private class EventWrapper {
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

        private class DynamicCollection {
            public Type Type { get; private set; }
            public ushort Id { get; private set; }

            private bool isDirty = false;
            private int _nDirtyDynamics = 0;
            public int NDirtyDynamics {
                get {
                    if (isDirty) {
                        _nDirtyDynamics = dynamics.Where(d => d.IsDirty).Count();
                        isDirty = false;
                    }
                    return _nDirtyDynamics;
                }
            }

            private List<ReplayDynamic> _dynamics = new List<ReplayDynamic>();
            private List<ReplayDynamic> dynamics = new List<ReplayDynamic>();
            private Dictionary<int, ReplayDynamic> mapOfDynamics = new Dictionary<int, ReplayDynamic>();

            public DynamicCollection(Type type) {
                if (!SnapshotManager.types.Contains(type)) throw new ReplayTypeDoesNotExist($"Could not create DynamicCollection of type '{type.FullName}'.");
                Type = type;
                Id = SnapshotManager.types[type];
            }

            [HideFromIl2Cpp]
            public void Add(ReplayDynamic dynamic) {
                Type dynType = dynamic.GetType();
                if (!Type.IsAssignableFrom(dynType)) throw new ReplayIncompatibleType($"Cannot add '{dynType.FullName}' to DynamicCollection of type '{Type.FullName}'.");
                if (mapOfDynamics.ContainsKey(dynamic.Id)) throw new ReplayDynamicAlreadyExists($"Dynamic [{dynamic.Id}] already exists in DynamicCollection of type '{Type.FullName}'.");
                isDirty = true;
                dynamics.Add(dynamic);
                mapOfDynamics.Add(dynamic.Id, dynamic);
            }

            [HideFromIl2Cpp]
            public void Remove(int id) {
                if (!mapOfDynamics.ContainsKey(id)) throw new ReplayDynamicDoesNotExist($"Dynamic [{id}] does not exist in DynamicCollection of type '{Type.FullName}'.");
                isDirty = true;
                mapOfDynamics[id].remove = true;
                mapOfDynamics.Remove(id);
            }

            [HideFromIl2Cpp]
            public void Remove(ReplayDynamic dynamic) {
                Type dynType = dynamic.GetType();
                if (!Type.IsAssignableFrom(dynType)) throw new ReplayIncompatibleType($"Cannot remove dynamic of type '{dynType.FullName}' from DynamicCollection of type '{Type.FullName}'.");
                Remove(dynamic.Id);
            }

            public bool Write(FileStream fs) {
                if (NDirtyDynamics == 0) return false;

                BitHelper.WriteBytes(Id, fs);
                BitHelper.WriteBytes(NDirtyDynamics, fs);
                _dynamics.Clear();
                for (int i = 0; i < dynamics.Count; i++) {
                    ReplayDynamic dynamic = dynamics[i];

                    if (!dynamic.remove) {
                        if (dynamic.IsDirty) {
                            if (ConfigManager.Debug && ConfigManager.DebugDynamics) APILogger.Debug($"[Dynamic: {dynamic.GetType().FullName}({SnapshotManager.types[dynamic.GetType()]})]{(dynamic.Debug != null ? $": {dynamic.Debug}" : "")}");
                            dynamic.Write(fs);
                        }
                        _dynamics.Add(dynamic);
                    }
                }
                List<ReplayDynamic> temp = dynamics;
                dynamics = _dynamics;
                _dynamics = temp;
                return true;
            }
        }

        private FileStream? fs;

        private long start = 0;
        private long Now => Raudy.Now - start;

        private bool completedHeader = false;
        private HashSet<Type> unwrittenHeaders = new HashSet<Type>();

        private List<EventWrapper> events = new List<EventWrapper>();

        private Dictionary<Type, DynamicCollection> dynamics = new Dictionary<Type, DynamicCollection>();

        private string fullpath = "replay.gtfo";
        internal void Init() {
            if (fs != null) throw new ReplaySnapshotAlreadyInitialized();

            pActiveExpedition expedition = RundownManager.GetActiveExpeditionData();
            RundownDataBlock data = GameDataBlockBase<RundownDataBlock>.GetBlock(Global.RundownIdToLoad);
            string shortName = data.GetExpeditionData(expedition.tier, expedition.expeditionIndex).GetShortName(expedition.expeditionIndex);
            DateTime now = DateTime.Now;

            string filename = string.Format(ConfigManager.ReplayFileName, shortName, now);
            string path = ConfigManager.ReplayFolder;
            if (filename.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0) {
                filename = "replay";
            }
            if (!Directory.Exists(path)) {
                path = "./";
            }
            fullpath = Path.Combine(path, filename);

            try {
                fs = new FileStream(fullpath, FileMode.Create, FileAccess.Write, FileShare.Read);
            } catch (Exception ex) {
                APILogger.Error($"Failed to create filestream, falling back to 'replay.gtfo': {ex.Message}");
                fs = new FileStream("replay.gtfo", FileMode.Create, FileAccess.Write, FileShare.Read);
            }

            SnapshotManager.types.Write(fs);
            foreach (Type t in SnapshotManager.types.headers) {
                unwrittenHeaders.Add(t);
            }
            foreach (Type t in SnapshotManager.types.dynamics) {
                dynamics.Add(t, new DynamicCollection(t));
            }
        }

        [HideFromIl2Cpp]
        internal void Trigger(ReplayHeader header) {
            if (fs == null) throw new ReplaySnapshotNotInitialized();

            Type headerType = header.GetType();

            if (completedHeader || unwrittenHeaders.Count == 0) {
                completedHeader = true;
                throw new ReplayAllHeadersAlreadyWritten($"Cannot write header '{headerType.FullName}' as all headers have been written already.");
            }

            if (!unwrittenHeaders.Remove(headerType)) {
                throw new ReplayHeaderAlreadyWritten($"Header '{headerType.FullName}' was already written.");
            }
            ushort id = SnapshotManager.types[headerType];
            APILogger.Debug($"[Header: {headerType.FullName}({id})]{(header.Debug != null ? $": {header.Debug}" : "")}");
            BitHelper.WriteBytes(id, fs);
            header.Write(fs);

            if (unwrittenHeaders.Count == 0) {
                completedHeader = true;
                OnHeaderComplete();
            }
        }

        private void OnHeaderComplete() {
            if (fs == null) throw new ReplaySnapshotNotInitialized();

            EndOfHeader eoh = new EndOfHeader();
            APILogger.Debug($"[Header: {typeof(EndOfHeader).FullName}({SnapshotManager.types[typeof(EndOfHeader)]})]{(eoh.Debug != null ? $": {eoh.Debug}" : "")}");
            eoh.Write(fs);

            fs.Flush();
            start = Raudy.Now;

            Replay.OnHeaderCompletion?.Invoke();
        }

        [HideFromIl2Cpp]
        internal void Trigger(ReplayEvent e) {
            if (ConfigManager.Debug) APILogger.Debug($"[Event: {e.GetType().FullName}({SnapshotManager.types[e.GetType()]})]{(e.Debug != null ? $": {e.Debug}" : "")}");
            if (!completedHeader) throw new ReplayNotAllHeadersWritten();
            events.Add(new EventWrapper(Now, e));
        }

        [HideFromIl2Cpp]
        internal void Spawn(ReplayDynamic dynamic) {
            Type dynType = dynamic.GetType();
            if (!dynamics.ContainsKey(dynType)) throw new ReplayTypeDoesNotExist($"Type '{dynType.FullName}' does not exist.");

            Trigger(new SpawnDynamic(dynamic.Id));
            dynamics[dynType].Add(dynamic);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        [HideFromIl2Cpp]
        internal void Spawn(ReplayDynamic dynamic, byte dimensionIndex, Vector3 position) {
            Spawn(dynamic, dimensionIndex, position, Quaternion.identity);
        }
        [HideFromIl2Cpp]
        internal void Spawn(ReplayDynamic dynamic, byte dimensionIndex, Vector3 position, Quaternion rotation) {
            Type dynType = dynamic.GetType();
            if (!dynamics.ContainsKey(dynType)) throw new ReplayTypeDoesNotExist($"Type '{dynType.FullName}' does not exist.");

            Trigger(new SpawnDynamicAt(dynamic.Id, (byte)dimensionIndex, position, rotation));
            dynamics[dynType].Add(dynamic);
        }

        internal void Despawn(Type dynType, int id) {
            if (!dynamics.ContainsKey(dynType)) throw new ReplayTypeDoesNotExist($"Type '{dynType.FullName}' does not exist.");

            Trigger(new DespawnDynamic(id));
            dynamics[dynType].Remove(id);
        }
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        [HideFromIl2Cpp]
        internal void Despawn(ReplayDynamic dynamic) {
            Despawn(dynamic.GetType(), dynamic.Id);
        }

        private void Tick() {
            if (fs == null) throw new ReplaySnapshotNotInitialized();
            if (!completedHeader) throw new ReplayNotAllHeadersWritten();

            // Check if this tick needs to be done
            // - are there any dynamics to serialize?
            // - are there any events to serialize?
            int nDirtyDynamics = dynamics.Values.Sum(d => d.NDirtyDynamics);
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
            foreach (DynamicCollection collection in dynamics.Values) {
                if (collection.Write(fs) && ConfigManager.Debug) {
                    APILogger.Debug($"[DynamicCollection: {collection.Type.FullName}({SnapshotManager.types[collection.Type]})]: {collection.NDirtyDynamics} dynamics serialized.");
                }
            }

            // Flush file stream
            fs.Flush();

            // Flush event buffer
            events.Clear();
        }

        internal void Dispose() {
            APILogger.Debug("Ending Replay...");

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
