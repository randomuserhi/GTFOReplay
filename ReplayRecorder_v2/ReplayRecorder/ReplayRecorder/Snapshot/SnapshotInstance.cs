using API;
using GameData;
using Globals;
using Il2CppInterop.Runtime.Attributes;
using ReplayRecorder.API;
using ReplayRecorder.BepInEx;
using ReplayRecorder.Core;
using ReplayRecorder.Snapshot.Exceptions;
using System.Net;
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

            public void Write(ByteBuffer buffer) {
                BitHelper.WriteBytes(id, buffer);
                e.Write(buffer);
            }
        }

        private class DynamicCollection {
            public Type Type { get; private set; }
            public ushort Id { get; private set; }

            internal bool isDirty = false;
            private int _nDirtyDynamics = 0;
            public int NDirtyDynamics {
                get {
                    if (isDirty) {
                        _nDirtyDynamics = dynamics.Count(d => (d.Active && d.IsDirty) || !d.init);
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
            public bool Has(ReplayDynamic dynamic) {
                Type dynType = dynamic.GetType();
                if (!Type.IsAssignableFrom(dynType)) throw new ReplayIncompatibleType($"Cannot add '{dynType.FullName}' to DynamicCollection of type '{Type.FullName}'.");
                return mapOfDynamics.ContainsKey(dynamic.Id);
            }

            [HideFromIl2Cpp]
            public void Add(ReplayDynamic dynamic, bool errorOnDuplicate = true) {
                Type dynType = dynamic.GetType();
                if (!Type.IsAssignableFrom(dynType)) throw new ReplayIncompatibleType($"Cannot add '{dynType.FullName}' to DynamicCollection of type '{Type.FullName}'.");
                if (mapOfDynamics.ContainsKey(dynamic.Id)) {
                    if (errorOnDuplicate) throw new ReplayDynamicAlreadyExists($"Dynamic [{dynamic.Id}] already exists in DynamicCollection of type '{Type.FullName}'.");
                    return;
                }
                isDirty = true;
                dynamics.Add(dynamic);
                mapOfDynamics.Add(dynamic.Id, dynamic);
            }

            [HideFromIl2Cpp]
            public void Remove(int id, bool errorOnNotFound = true) {
                if (!mapOfDynamics.ContainsKey(id)) {
                    if (errorOnNotFound) throw new ReplayDynamicDoesNotExist($"Dynamic [{id}] does not exist in DynamicCollection of type '{Type.FullName}'.");
                    return;
                }
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

            public bool Write(ByteBuffer buffer) {
                if (NDirtyDynamics == 0) return false;

                int numWritten = 0;
                BitHelper.WriteBytes(Id, buffer);
                BitHelper.WriteBytes(NDirtyDynamics, buffer);
                _dynamics.Clear();
                for (int i = 0; i < dynamics.Count; i++) {
                    ReplayDynamic dynamic = dynamics[i];

                    if ((dynamic.Active && dynamic.IsDirty) || !dynamic.init) {
                        if (ConfigManager.Debug && ConfigManager.DebugDynamics) APILogger.Debug($"[Dynamic: {dynamic.GetType().FullName}({SnapshotManager.types[dynamic.GetType()]})]{(dynamic.Debug != null ? $": {dynamic.Debug}" : "")}");
                        ++numWritten;
                        dynamic.init = true;
                        dynamic._Write(buffer);
                        dynamic.Write(buffer);
                    }
                    if (!dynamic.remove) {
                        _dynamics.Add(dynamic);
                    }
                }
                List<ReplayDynamic> temp = dynamics;
                dynamics = _dynamics;
                _dynamics = temp;

                if (numWritten != NDirtyDynamics) {
                    throw new ReplayNumWrittenDoesntMatch($"[DynamicCollection: {Type.FullName}({SnapshotManager.types[Type]})]: Number of written dynamics ({numWritten}) does not match dirty dynamics ({NDirtyDynamics}).");
                }

                return true;
            }
        }

        private class DeltaState {
            internal List<EventWrapper> events = new List<EventWrapper>();
            internal Dictionary<Type, DynamicCollection> dynamics = new Dictionary<Type, DynamicCollection>();

            internal void Clear() {
                events.Clear();
                dynamics.Clear();
            }

            internal bool Write(long now, ByteBuffer bs) {
                // Check if this tick needs to be done
                // - are there any dynamics to serialize?
                // - are there any events to serialize?
                int nDirtyDynamics = dynamics.Values.Sum(d => { d.isDirty = true; return d.NDirtyDynamics; });
                if (nDirtyDynamics == 0 && events.Count == 0)
                    return false;

                // Tick header
                BitHelper.WriteBytes((uint)now, bs);

                // Write Events
                BitHelper.WriteBytes(events.Count, bs);
                for (int i = 0; i < events.Count; ++i) {
                    EventWrapper e = events[i];

                    long delta = now - e.now;
                    if (delta < 0 || delta > ushort.MaxValue) {
                        throw new ReplayInvalidDeltaTime($"Delta time of {delta}ms is invalid. Max is {ushort.MaxValue}ms and minimum is 0ms.");
                    }

                    // Event header
                    BitHelper.WriteBytes((ushort)delta, bs);
                    e.Write(bs);
                }

                // Serialize dynamic properties
                int numWritten = 0;
                IEnumerable<DynamicCollection> dirtyCollections = dynamics.Values.Where(collection => {
                    collection.isDirty = true;
                    return collection.NDirtyDynamics > 0;
                });
                int nDirtyCollections = dirtyCollections.Count();
                BitHelper.WriteBytes((ushort)nDirtyCollections, bs);
                foreach (DynamicCollection collection in dirtyCollections) {
                    if (collection.Write(bs)) {
                        ++numWritten;
                        if (ConfigManager.Debug) {
                            APILogger.Debug($"[DynamicCollection: {collection.Type.FullName}({SnapshotManager.types[collection.Type]})]: {collection.NDirtyDynamics} dynamics serialized.");
                        }
                    }
                }
                if (numWritten != nDirtyCollections) {
                    throw new ReplayNumWrittenDoesntMatch($"[DynamicCollection]: Number of written collections ({numWritten}) does not match dirty collections ({nDirtyCollections}).");
                }

                events.Clear();

                return true;
            }
        }


        private FileStream? fs;
        private int byteOffset = 0;
        private DeltaState state = new DeltaState();
        private ByteBuffer buffer = new ByteBuffer();

        public bool Ready => Active && completedHeader;
        public bool Active => fs != null;

        private long start = 0;
        private long Now => Raudy.Now - start;

        private bool completedHeader = false;
        private HashSet<Type> unwrittenHeaders = new HashSet<Type>();

        internal string fullpath = "replay.gtfo";
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

            buffer.Clear();
            SnapshotManager.types.Write(buffer);

            foreach (Type t in SnapshotManager.types.headers) {
                unwrittenHeaders.Add(t);
            }

            state.Clear();
            foreach (Type t in SnapshotManager.types.dynamics) {
                state.dynamics.Add(t, new DynamicCollection(t));
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
            BitHelper.WriteBytes(id, buffer);
            header.Write(buffer);

            if (unwrittenHeaders.Count == 0) {
                completedHeader = true;
                OnHeaderComplete();
            }
        }

        private void OnHeaderComplete() {
            if (fs == null) throw new ReplaySnapshotNotInitialized();

            EndOfHeader eoh = new EndOfHeader();
            APILogger.Debug($"[Header: {typeof(EndOfHeader).FullName}({SnapshotManager.types[typeof(EndOfHeader)]})]{(eoh.Debug != null ? $": {eoh.Debug}" : "")}");
            eoh.Write(buffer);

            byteOffset = sizeof(int) + buffer.count;
            buffer.Flush(fs);

            start = Raudy.Now;
            Replay.OnHeaderCompletion?.Invoke();
        }

        [HideFromIl2Cpp]
        internal void Trigger(ReplayEvent e) {
            if (ConfigManager.Debug) APILogger.Debug($"[Event: {e.GetType().FullName}({SnapshotManager.types[e.GetType()]})]{(e.Debug != null ? $": {e.Debug}" : "")}");
            if (!completedHeader) throw new ReplayNotAllHeadersWritten();
            EventWrapper ev = new EventWrapper(Now, e);
            state.events.Add(ev);
        }

        [HideFromIl2Cpp]
        internal bool Has(ReplayDynamic dynamic) {
            Type dynType = dynamic.GetType();
            if (!state.dynamics.ContainsKey(dynType)) throw new ReplayTypeDoesNotExist($"Type '{dynType.FullName}' does not exist.");

            return state.dynamics[dynType].Has(dynamic);
        }

        [HideFromIl2Cpp]
        internal void Spawn(ReplayDynamic dynamic, bool errorOnDuplicate = true) {
            Type dynType = dynamic.GetType();
            if (!state.dynamics.ContainsKey(dynType)) throw new ReplayTypeDoesNotExist($"Type '{dynType.FullName}' does not exist.");

            Trigger(new ReplaySpawn(dynamic));
            state.dynamics[dynType].Add(dynamic, errorOnDuplicate);
        }
        [HideFromIl2Cpp]
        internal void Despawn(ReplayDynamic dynamic, bool errorOnNotFound = true) {
            Type dynType = dynamic.GetType();
            if (!state.dynamics.ContainsKey(dynType)) throw new ReplayTypeDoesNotExist($"Type '{dynType.FullName}' does not exist.");

            Trigger(new ReplayDespawn(dynamic));
            state.dynamics[dynType].Remove(dynamic.Id, errorOnNotFound);
        }

        private void Tick() {
            if (fs == null) throw new ReplaySnapshotNotInitialized();
            if (!completedHeader) throw new ReplayNotAllHeadersWritten();

            // Invoke tick processes
            Replay.OnTick?.Invoke();

            // Prepare time
            long now = Now;
            if (now > uint.MaxValue) {
                Dispose();
                throw new ReplayInvalidTimestamp($"ReplayRecorder does not support replays longer than {uint.MaxValue}ms.");
            }

            // Clear write buffer
            buffer.Clear();
            if (state.Write(now, buffer)) {
                if (Plugin.acknowledged.Count > 0) {
                    ByteBuffer packet = new ByteBuffer();
                    // Header
                    BitHelper.WriteBytes((ushort)Net.MessageType.LiveBytes, packet); // type
                    // Content
                    BitHelper.WriteBytes(byteOffset, packet); // offset
                    BitHelper.WriteBytes(sizeof(int) + buffer.count, packet); // number of bytes to read
                    BitHelper.WriteBytes(buffer.Array, packet); // file-bytes

                    foreach (EndPoint connection in Plugin.acknowledged) {
                        if (!Plugin.server.Connections.Contains(connection)) continue;
                        _ = Plugin.server.SendTo(packet.Array, connection);
                    }
                }
                byteOffset += sizeof(int) + buffer.count;
                buffer.Flush(fs);
            }
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

        private float tickRate = 1f / 20f;
        private float timer = 0;
        private void Update() {
            if (fs == null || !completedHeader) {
                return;
            }

            /*float rate;
            // Change tick rate based on state / live view:
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
            }*/

            timer += Time.deltaTime;
            if (timer > tickRate) {
                timer = 0;
                Tick();
            }
        }
    }
}
