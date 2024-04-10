using API;
using GameData;
using Globals;
using Il2CppInterop.Runtime.Attributes;
using ReplayRecorder.API;
using ReplayRecorder.BepInEx;
using ReplayRecorder.Core;
using ReplayRecorder.Snapshot.Exceptions;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Net;
using UnityEngine;

namespace ReplayRecorder.Snapshot {
    internal class SnapshotInstance : MonoBehaviour {
        // NOTE(randomuserhi): This may cause a huge performance hit of allocating a byte buffer every single time an event is triggered
        //                     Look into an arena allocator or something here
        private class EventWrapper {
            private ushort id;
            private ReplayEvent eventObj;
            internal ByteBuffer eventBuffer; // Required to capture state at point of event
            internal long now;

            public string? Debug => eventObj.Debug;

            public EventWrapper(long now, ReplayEvent e, ByteBuffer buffer) {
                this.now = now;
                eventObj = e;
                eventBuffer = buffer;
                e.Write(eventBuffer);
                id = SnapshotManager.types[e.GetType()];
            }

            public void Write(ByteBuffer buffer) {
                BitHelper.WriteBytes(id, buffer);
                BitHelper.WriteBytes(eventBuffer.Array, buffer, false);
            }
        }

        private class DynamicCollection {
            public Type Type { get; private set; }
            public ushort Id { get; private set; }

            public int max = int.MaxValue;
            private int cycle = 0;

            public int tickRate = 1;
            private int tick = 0;
            public bool Tick {
                get {
                    tick = (tick + 1) % Mathf.Clamp(tickRate, 1, int.MaxValue);
                    return tick == 0;
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
            public bool Has(int id) {
                return mapOfDynamics.ContainsKey(id);
            }

            [HideFromIl2Cpp]
            public ReplayDynamic Get(int id) {
                if (!mapOfDynamics.ContainsKey(id)) throw new ReplayDynamicDoesNotExist($"Cannot get dynamic of id '{id}'. Type: '{Type.FullName}'.");
                return mapOfDynamics[id];
            }

            [HideFromIl2Cpp]
            public void Add(ReplayDynamic dynamic, bool errorOnDuplicate = true) {
                Type dynType = dynamic.GetType();
                if (!Type.IsAssignableFrom(dynType)) throw new ReplayIncompatibleType($"Cannot add '{dynType.FullName}' to DynamicCollection of type '{Type.FullName}'.");
                if (mapOfDynamics.ContainsKey(dynamic.Id)) {
                    if (errorOnDuplicate) throw new ReplayDynamicAlreadyExists($"Dynamic [{dynamic.Id}] already exists in DynamicCollection of type '{Type.FullName}'.");
                    return;
                }
                dynamics.Add(dynamic);
                mapOfDynamics.Add(dynamic.Id, dynamic);
            }

            [HideFromIl2Cpp]
            public void Remove(int id, bool errorOnNotFound = true) {
                if (!mapOfDynamics.ContainsKey(id)) {
                    if (errorOnNotFound) throw new ReplayDynamicDoesNotExist($"Dynamic [{id}] does not exist in DynamicCollection of type '{Type.FullName}'.");
                    return;
                }
                handleRemoval = true;
                mapOfDynamics[id].remove = true;
                mapOfDynamics.Remove(id);
            }

            [HideFromIl2Cpp]
            public void Remove(ReplayDynamic dynamic) {
                Type dynType = dynamic.GetType();
                if (!Type.IsAssignableFrom(dynType)) throw new ReplayIncompatibleType($"Cannot remove dynamic of type '{dynType.FullName}' from DynamicCollection of type '{Type.FullName}'.");
                Remove(dynamic.Id);
            }

            private bool handleRemoval = false;
            public int Write(ByteBuffer buffer) {
                if (tick != 0) return 0;
                int start = buffer.count;

                int numWritten = 0;
                BitHelper.WriteBytes(Id, buffer);

                // Reserve space to write number of written dynamics
                int index = buffer.count;
                buffer.Reserve(sizeof(int), true);

                if (handleRemoval) _dynamics.Clear();
                for (int i = 0; i < dynamics.Count; i++) {
                    cycle = cycle % dynamics.Count;
                    ReplayDynamic dynamic = dynamics[cycle++];

                    if (numWritten < max) { // check we are writing within cap
                        if (!dynamic.remove || tickRate == 1) { // check that we only write removal sync if the tick rate matches event rate.
                            if (dynamic.Active && (dynamic.IsDirty/* || !dynamic.init*/)) {
                                if (ConfigManager.Debug && ConfigManager.DebugDynamics) APILogger.Debug($"[Dynamic: {dynamic.GetType().FullName}({SnapshotManager.types[dynamic.GetType()]})]{(dynamic.Debug != null ? $": {dynamic.Debug}" : "")}");
                                ++numWritten;
                                //dynamic.init = true;
                                dynamic._Write(buffer);
                                dynamic.Write(buffer);
                            }
                        }
                    }

                    if (handleRemoval && !dynamic.remove) {
                        _dynamics.Add(dynamic);
                    }
                }
                if (handleRemoval) {
                    List<ReplayDynamic> temp = dynamics;
                    dynamics = _dynamics;
                    _dynamics = temp;
                }
                handleRemoval = false;

                // Reset buffer to start if no dynamics were written
                if (numWritten == 0) {
                    buffer.count = start;
                    return 0;
                }

                // Insert number of written to start
                BitHelper.WriteBytes(numWritten, buffer._array, ref index);

                if (ConfigManager.Debug) {
                    APILogger.Debug($"[DynamicCollection: {Type.FullName}({SnapshotManager.types[Type]})]: {numWritten} dynamics serialized.");
                }

                return numWritten;
            }
        }

        private class DeltaState {
            internal List<EventWrapper> events = new List<EventWrapper>();
            internal Dictionary<Type, DynamicCollection> dynamics = new Dictionary<Type, DynamicCollection>();

            internal void Clear() {
                events.Clear();
                dynamics.Clear();
            }

            internal bool Write(long now, ByteBuffer bs, BufferPool pool) {
                // Tick header
                BitHelper.WriteBytes((uint)now, bs);

                // Write Events
                BitHelper.WriteBytes(events.Count, bs);
                for (int i = 0; i < events.Count; ++i) {
                    EventWrapper e = events[i];

                    long delta = now - e.now;
                    if (delta < 0) delta = 0;
                    if (delta > ushort.MaxValue) {
                        throw new ReplayInvalidDeltaTime($"Delta time of {delta}ms is invalid. Max is {ushort.MaxValue}ms.");
                    }

                    // Event header
                    BitHelper.WriteBytes((ushort)delta, bs);
                    e.Write(bs);

                    // release buffer back to pool
                    pool.Release(e.eventBuffer);
                }

                // Serialize dynamic properties
                int numWritten = 0;

                // Reserve space to write number of written dynamics
                int index = bs.count;
                bs.Reserve(sizeof(ushort), true);

                foreach (DynamicCollection collection in dynamics.Values) {
                    if (collection.Write(bs) > 0) {
                        ++numWritten;
                    }
                }

                // Insert number of written to start
                BitHelper.WriteBytes((ushort)numWritten, bs._array, ref index);
                if (ConfigManager.Debug && ConfigManager.DebugDynamics) {
                    APILogger.Debug($"Flushed {numWritten} dynamic collections.");
                }

                events.Clear();

                return events.Count != 0 || numWritten != 0;
            }
        }


        private FileStream? fs;
        private int byteOffset = 0;
        private DeltaState state = new DeltaState();
        private ByteBuffer buffer = new ByteBuffer();
        private ByteBuffer _buffer = new ByteBuffer();
        internal BufferPool pool = new BufferPool(); // TODO(randomuserhi): Consider creating a new pool to shrink it every so often to keep memory usage low [This can be done by watching number of in use buffers over time]
        private Task? writeTask;

        public bool Ready => Active && completedHeader;
        public bool Active => fs != null;

        private long start = 0;
        private long Now => Raudy.Now - start;

        private bool completedHeader = false;
        private HashSet<Type> unwrittenHeaders = new HashSet<Type>();

        internal string fullpath = "replay.gtfo";
        internal void Init() {
            if (fs != null) throw new ReplaySnapshotAlreadyInitialized();

            start = Raudy.Now;

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

            pool = new BufferPool();

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

            unwrittenHeaders.Remove(headerType);

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
            buffer.Shrink();

            Replay.OnHeaderCompletion?.Invoke();
        }

        [HideFromIl2Cpp]
        internal void Configure<T>(int tickRate, int max) where T : ReplayDynamic {
            Type dynType = typeof(T);
            if (!state.dynamics.ContainsKey(dynType)) throw new ReplayTypeDoesNotExist($"Type '{dynType.FullName}' does not exist.");
            state.dynamics[dynType].max = max;
            state.dynamics[dynType].tickRate = tickRate;
        }

        [HideFromIl2Cpp]
        internal void Trigger(ReplayEvent e) {
            if (ConfigManager.Debug && ConfigManager.DebugDynamics) APILogger.Debug($"[Event: {e.GetType().FullName}({SnapshotManager.types[e.GetType()]})]{(e.Debug != null ? $": {e.Debug}" : "")}");
            EventWrapper ev = new EventWrapper(Now, e, pool.Checkout());
            state.events.Add(ev);
        }

        [HideFromIl2Cpp]
        internal bool Has(ReplayDynamic dynamic) {
            Type dynType = dynamic.GetType();
            if (!state.dynamics.ContainsKey(dynType)) throw new ReplayTypeDoesNotExist($"Type '{dynType.FullName}' does not exist.");

            return state.dynamics[dynType].Has(dynamic);
        }

        [HideFromIl2Cpp]
        internal bool Has(Type type, int id) {
            if (!state.dynamics.ContainsKey(type)) throw new ReplayTypeDoesNotExist($"Type '{type.FullName}' does not exist.");

            return state.dynamics[type].Has(id);
        }

        [HideFromIl2Cpp]
        internal ReplayDynamic Get(Type type, int id) {
            if (!state.dynamics.ContainsKey(type)) throw new ReplayTypeDoesNotExist($"Type '{type.FullName}' does not exist.");
            return state.dynamics[type].Get(id);
        }

        [HideFromIl2Cpp]
        internal bool TryGet(Type type, int id, [MaybeNullWhen(false)] out ReplayDynamic? dynamic) {
            if (!state.dynamics.ContainsKey(type)) {
                dynamic = null;
                return false;
            }

            dynamic = state.dynamics[type].Get(id);
            return true;
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

        private Stopwatch stopwatch = new Stopwatch();

        [HideFromIl2Cpp]
        private async Task Send(ByteBuffer packet) {
            // TODO(randomuserhi): List of tasks so each send is concurrent?
            foreach (EndPoint connection in Plugin.acknowledged) {
                if (!Plugin.server.Connections.Contains(connection)) continue;
                await Plugin.server.RawSendTo(packet.Array, connection);
            }
            pool.Release(packet);
        }

        private void Tick() {
            stopwatch.Restart();
            if (fs == null) throw new ReplaySnapshotNotInitialized();

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
            if (state.Write(now, buffer, pool)) {
                if (Plugin.acknowledged.Count > 0) {
                    ByteBuffer packet = pool.Checkout();
                    // Header
                    const int sizeOfHeader = sizeof(int) + sizeof(ushort) + sizeof(int) + sizeof(int) + sizeof(int);
                    BitHelper.WriteBytes(sizeOfHeader + buffer.count, packet); // type
                    BitHelper.WriteBytes((ushort)Net.MessageType.LiveBytes, packet); // type
                    // Content
                    BitHelper.WriteBytes(byteOffset, packet); // offset
                    BitHelper.WriteBytes(sizeof(int) + buffer.count, packet); // number of bytes to read
                    BitHelper.WriteBytes(buffer.Array, packet); // file-bytes

                    _ = Send(packet);
                }
                byteOffset += sizeof(int) + buffer.count;
                if (writeTask != null) {
                    writeTask.Wait();
                }
                writeTask = buffer.AsyncFlush(fs);
                ByteBuffer temp = _buffer;
                _buffer = buffer;
                buffer = temp;
            }
            stopwatch.Stop();

            const float alpha = 0.9f;
            tickTime = alpha * tickTime + (1.0f - alpha) * stopwatch.ElapsedMilliseconds;
        }
        internal float tickTime = 1.0f;

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

            timer += Time.deltaTime;
            if (timer > tickRate) {
                timer = 0;
                Tick();
            }
        }
    }
}
