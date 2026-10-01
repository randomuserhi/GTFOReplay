extern alias GTFO;

using API;
using GameData;
using Globals;
using Il2CppInterop.Runtime.Attributes;
using Player;
using ReplayRecorder.API;
using ReplayRecorder.BepInEx;
using ReplayRecorder.Core;
using ReplayRecorder.IO;
using ReplayRecorder.Net;
using ReplayRecorder.Snapshot.Exceptions;
using ReplayRecorder.Steam;
using Steamworks;
using System.Collections;
using System.Diagnostics;
using System.Runtime.InteropServices;
using UnityEngine;

namespace ReplayRecorder.Snapshot {
    internal class SnapshotInstance : MonoBehaviour {
        private class EventWrapper {
            private ushort id;
            private ReplayEvent eventObj;
            internal ByteBuffer? eventBuffer; // Required to capture state at point of event
            private readonly BufferPool owner;
            internal long now;

            public string? Debug => eventObj.Debug;

            public EventWrapper(long now, ReplayEvent e, BufferPool owner) {
                this.now = now;
                this.owner = owner;
                eventObj = e;
                eventBuffer = owner.Checkout();
                try {
                    e.Write(eventBuffer);
                    id = SnapshotManager.types[e.GetType()];
                } catch {
                    Dispose();
                    throw;
                }
            }

            public void Dispose() {
                if (eventBuffer == null) return;

                owner.Release(eventBuffer);
                eventBuffer = null;
            }

            public void Write(ByteBuffer buffer) {
                if (eventBuffer == null) throw new Exception("Memory Buffer was disposed too early..."); // TODO(randomuserhi): Custom exception...
                if (ConfigManager.Debug && ConfigManager.DebugDynamics) APILogger.Debug($"[Event: {eventObj.GetType().FullName}({SnapshotManager.types[eventObj.GetType()]})]{(eventObj.Debug != null ? $": {eventObj.Debug}" : "")}");

                BitHelper.WriteBytes(id, buffer);
                BitHelper.WriteBytes(eventBuffer.Array, buffer, false);
            }
        }

        private class DynamicCollection : IEnumerable<ReplayDynamic> {
            public Type Type { get; private set; }
            public ushort Id { get; private set; }

            public int maxPerTick = int.MaxValue;
            private int currentDynamic = 0;

            public int tickRate = 1;
            private int tick = 0;
            private bool performTick {
                get {
                    tick = (tick + 1) % Mathf.Clamp(tickRate, 1, int.MaxValue);
                    return tick == 0;
                }
            }

            private List<ReplayDynamic> _dynamics = new List<ReplayDynamic>();
            private List<ReplayDynamic> dynamics = new List<ReplayDynamic>();
            private Dictionary<int, ReplayDynamic> mapOfDynamics = new Dictionary<int, ReplayDynamic>();
            private SnapshotInstance instance;

            public DynamicCollection(Type type, SnapshotInstance instance) {
                this.instance = instance;
                if (!SnapshotManager.types.Contains(type)) throw new ReplayTypeDoesNotExist($"Could not create DynamicCollection of type '{type.FullName}'.");
                Type = type;
                Id = SnapshotManager.types[type];
            }

            public IEnumerator<ReplayDynamic> GetEnumerator() {
                foreach (ReplayDynamic dynamic in mapOfDynamics.Values) {
                    yield return dynamic;
                }
            }

            IEnumerator IEnumerable.GetEnumerator() {
                return GetEnumerator();
            }

            [HideFromIl2Cpp]
            public bool Has(ReplayDynamic dynamic) {
                Type dynType = dynamic.GetType();
                if (!Type.IsAssignableFrom(dynType)) throw new ReplayIncompatibleType($"Cannot add '{dynType.FullName}' to DynamicCollection of type '{Type.FullName}'.");
                return mapOfDynamics.ContainsKey(dynamic.id);
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
                if (mapOfDynamics.ContainsKey(dynamic.id)) {
                    if (errorOnDuplicate) throw new ReplayDynamicAlreadyExists($"Dynamic [{dynamic.id}] already exists in DynamicCollection of type '{Type.FullName}'.");
                    return;
                }
                AddNoChecks(dynamic);
            }

            [HideFromIl2Cpp]
            internal void AddNoChecks(ReplayDynamic dynamic) {
                dynamics.Add(dynamic);
                mapOfDynamics.Add(dynamic.id, dynamic);
            }

            [HideFromIl2Cpp]
            public void Remove(int id, bool errorOnNotFound = true) {
                if (!mapOfDynamics.ContainsKey(id)) {
                    if (errorOnNotFound) throw new ReplayDynamicDoesNotExist($"Dynamic [{id}] does not exist in DynamicCollection of type '{Type.FullName}'.");
                    return;
                }
                RemoveNoChecks(id);
            }

            [HideFromIl2Cpp]
            public void Remove(ReplayDynamic dynamic) {
                Type dynType = dynamic.GetType();
                if (!Type.IsAssignableFrom(dynType)) throw new ReplayIncompatibleType($"Cannot remove dynamic of type '{dynType.FullName}' from DynamicCollection of type '{Type.FullName}'.");
                Remove(dynamic.id);
            }

            [HideFromIl2Cpp]
            internal void RemoveNoChecks(int id) {
                handleRemoval = true;
                mapOfDynamics[id].remove = true;
                mapOfDynamics.Remove(id);
            }

            private bool handleRemoval = false;
            public int Write(ByteBuffer buffer, long now) {
                if (!performTick) return 0;
                if (dynamics.Count == 0) return 0;

                int start = buffer.count;

                int numWritten = 0;
                BitHelper.WriteBytes(Id, buffer);

                // Reserve space to write number of written dynamics
                int index = buffer.count;
                buffer.Reserve(sizeof(int), true);

                // Store old state, since dynamics can trigger events (Spawn / Despawn included)
                // during writes, we need to maintain state and not reset after which causes a race condition.
                bool _handleRemoval = handleRemoval;
                handleRemoval = false;

                if (_handleRemoval) _dynamics.Clear();
                int numChecked = 0; // Keep track of number of dynamics checked
                int offset = currentDynamic = currentDynamic % dynamics.Count; // Restart where we left off from last tick
                for (int i = 0; i < dynamics.Count; i++) {
                    ReplayDynamic dynamic = dynamics[(offset + i) % dynamics.Count];

                    // Trigger Hooks
                    Type dynType = dynamic.GetType();
                    if (Replay.DynamicHooks.ContainsKey(dynType)) {
                        try {
                            Replay.DynamicHooks[dynType]?.Invoke(now, dynamic);
                        } catch (Exception e) {
                            throw new InvalidOperationException($"Dynamic hook {dynType}({dynamic.id}) failed.", e);
                        }
                    }

                    bool active = dynamic.Active;
                    if (numChecked++ < maxPerTick) { // check we are within cap of maximum dynamics to check per tick
                        ++currentDynamic;
                        if (!dynamic.remove || tickRate == 1) { // check that we only write removal sync if the tick rate matches event rate.
                            if (active && (dynamic.IsDirty/* || !dynamic.init*/)) {
                                if (ConfigManager.Debug && ConfigManager.DebugDynamics) APILogger.Debug($"[Dynamic: {dynamic.GetType().FullName}({SnapshotManager.types[dynamic.GetType()]})]{(dynamic.Debug != null ? $": {dynamic.Debug}" : "")}");

                                int writeIndex = buffer.count; // Store write point to restore back to if dynamic fails to write

                                try {
                                    // Trigger hooks
                                    if (Replay.DirtyDynamicHooks.ContainsKey(dynType)) {
                                        try {
                                            Replay.DirtyDynamicHooks[dynType]?.Invoke(now, dynamic);
                                        } catch (Exception e) {
                                            throw new InvalidOperationException($"Dirty dynamic hook {dynType}({dynamic.id}) failed.", e);
                                        }
                                    }

                                    //dynamic.init = true;
                                    dynamic._Write(buffer);
                                    dynamic.Write(buffer);
                                    ++numWritten;
                                } catch (Exception ex) {
                                    // Restore buffer write point
                                    buffer.count = writeIndex;
                                    throw new InvalidDataException($"Could not serialize dynamic {Type}({dynamic.id}) at {instance.Now}ms.", ex);
                                }
                            }
                        }
                    }

                    // If the dynamic is no longer active, and its not already marked for removal => despawn it
                    // If another active dynamic of the same id exists, do not trigger despawn and instead silently
                    // discard self as the other active dynamic is replacing the current inactive one.
                    if (!active && !dynamic.remove) {
                        if (dynamics.Any((d) => !ReferenceEquals(d, dynamic) && d == dynamic && d.Active && !d.remove)) {
                            dynamic.remove = true;
                            handleRemoval = true;
                            APILogger.Warn($"[DynamicCollection] Silent Removal {Type} {dynamic.id}");
                        } else {
                            instance.Despawn(dynamic);
                            APILogger.Warn($"[DynamicCollection] Forced Despawn {Type} {dynamic.id}");
                        }
                    }

                    if (_handleRemoval && !dynamic.remove) {
                        _dynamics.Add(dynamic);
                    } else if (i < currentDynamic) {
                        // Shift index back as we removed a previous item
                        --currentDynamic;
                    }
                }
                if (_handleRemoval) {
                    List<ReplayDynamic> temp = dynamics;
                    dynamics = _dynamics;
                    _dynamics = temp;
                }

                // Reset buffer to start if no dynamics were written
                if (numWritten == 0) {
                    buffer.count = start;
                    return 0;
                }

                // Insert number of written to start
                BitHelper.WriteBytes(numWritten, buffer._array, ref index);

                if (ConfigManager.Debug && ConfigManager.DebugTicks) {
                    APILogger.Debug($"[DynamicCollection: {Type.FullName}({SnapshotManager.types[Type]})]: {numWritten} dynamics serialized.");
                }

                return numWritten;
            }
        }

        private class DeltaState {
            internal long eventBytes;
            internal List<EventWrapper> events = new List<EventWrapper>();
            internal Dictionary<Type, DynamicCollection> dynamics = new Dictionary<Type, DynamicCollection>();

            internal void Clear() {
                foreach (var e in events) e.Dispose();
                events.Clear();
                eventBytes = 0;
                dynamics.Clear();
            }

            internal bool Write(long now, ByteBuffer bs, bool includeDynamics = true) {
                // Tick header
                BitHelper.WriteBytes((uint)now, bs);

                // Write Events - Unlike dynamics there is no support for triggering events whilst writing events.
                BitHelper.WriteBytes(events.Count, bs);
                for (int i = 0; i < events.Count; ++i) {
                    EventWrapper e = events[i];

                    long delta = now - e.now;
                    if (delta < 0) delta = 0;
                    if (delta > ushort.MaxValue) {
                        APILogger.Warn($"Delta time of {delta}ms is invalid. Max is {ushort.MaxValue}ms.");
                        delta = ushort.MaxValue;
                    }

                    // Event header
                    BitHelper.WriteBytes((ushort)delta, bs);
                    e.Write(bs);

                    // release buffer back to pool
                    e.Dispose();
                }
                bool eventsWritten = events.Count != 0;
                if (ConfigManager.DebugTicks) APILogger.Debug($"[Events] {events.Count} events written.");
                events.Clear();
                eventBytes = 0;

                // Serialize dynamic properties
                int numWritten = 0;

                // Reserve space to write number of written dynamics
                int index = bs.count;
                bs.Reserve(sizeof(ushort), true);

                foreach (DynamicCollection collection in dynamics.Values) {
                    if (!includeDynamics) break;
                    // Keep note of where the buffer of this collection starts
                    // Allows us to restore the buffer if required
                    int restore = bs.count;
                    try {
                        if (collection.Write(bs, now) > 0) {
                            ++numWritten;
                        }
                    } catch (Exception ex) {
                        // Restore byte buffer to prior collection being written
                        bs.count = restore;
                        throw new InvalidDataException($"Could not serialize dynamic collection {collection.Type} at {now}ms.", ex);
                    }
                }

                // Insert number of written to start
                BitHelper.WriteBytes((ushort)numWritten, bs._array, ref index);
                if (ConfigManager.Debug && ConfigManager.DebugDynamics) {
                    APILogger.Debug($"Flushed {numWritten} dynamic collections.");
                }

                return eventsWritten || numWritten != 0;
            }
        }

        private FileStream? fs;
        private ReplayContainer? container;
        // Only expose a prefix that the disk worker has completely written and flushed.
        public int byteOffset => checked((int)(container?.WrittenBytes ?? 0));
        private int networkOffset;
        private int queuedOffset;
        internal async Task<int> WaitForWrittenPrefix() {
            int target = Volatile.Read(ref queuedOffset);
            while ((diskWrites?.WrittenBytes ?? 0) < target) {
                if (diskWrites?.Error != null) throw new IOException("Replay disk write failed.", diskWrites.Error);
                await Task.Delay(10).ConfigureAwait(false);
            }
            if (container != null && container.WrittenBytes < target) await container.Flush().ConfigureAwait(false);
            return target;
        }
        private DeltaState state = new DeltaState();
        private ByteBuffer buffer = new ByteBuffer();
        internal BufferPool pool = new BufferPool();
        private BufferWriteQueue? diskWrites;
        private BufferWriteQueue? liveWrites;
        private readonly RecordingStatus health = new();
        private string? recordingError {
            get => health.Error;
            set { if (value != null) health.Fail(value); }
        }
        private bool closing;
        private bool liveFailed;
        [HideFromIl2Cpp]
        internal void FailRecording(string operation, Exception error) {
            if (recordingError != null) return;
            recordingError = $"{operation}: {error.Message}";
            APILogger.Error($"Recording stopped. Session={SessionId}, Time={Now}ms, Path='{fullpath}'. Last complete chunks are retained. {error}");
        }

        public bool Ready => Active && headers.Complete;
        public bool Active => fs != null && !closing && recordingError == null;

        private long start = 0;
        private long Now => Raudy.Now - start;

        private HeaderSequence headers = new HeaderSequence(Array.Empty<Type>());

        // Used by Net code to determine which replay bytes belong to
        private static byte _replayInstanceId = 0;
        internal byte replayInstanceId = 0;

        internal string fullpath = "replay.gtfo";
        internal string filename = "replay.gtfo";
        internal string SessionId { get; } = Guid.NewGuid().ToString("N");
        internal string StartedUtc { get; private set; } = "";
        internal string Expedition { get; private set; } = "";
        internal string LevelName { get; private set; } = "";
        internal string RundownName { get; private set; } = "";
        internal void Init() {
            if (fs != null) throw new ReplaySnapshotAlreadyInitialized();
            RecordingStatus.Current = health;

            start = Raudy.Now;

            pActiveExpedition expedition = RundownManager.GetActiveExpeditionData();
            RundownDataBlock data = GameDataBlockBase<RundownDataBlock>.GetBlock(Global.RundownIdToLoad);
            ExpeditionInTierData levelData = data.GetExpeditionData(expedition.tier, expedition.expeditionIndex);
            string shortName = Utils.RemoveHTMLTags(levelData.GetShortName(expedition.expeditionIndex));
            string levelName = Utils.RemoveHTMLTags(levelData.Descriptive.PublicName);
            DateTime now = DateTime.Now;
            StartedUtc = DateTimeOffset.UtcNow.ToString("O");
            Expedition = shortName;
            LevelName = levelName;
            RundownName = data.name;

            filename = string.Format(ConfigManager.ReplayFileName, shortName, now, levelName);
            string path = Utils.RemoveInvalidCharacters(ConfigManager.ReplayFolder);
            filename = Utils.RemoveInvalidCharacters(filename, isFullPath: false);

            if (path == string.Empty) path = "./";

            string dirPath;
            if (ConfigManager.SeparateByRundown) {
                dirPath = Path.Combine(path, Utils.RemoveInvalidCharacters(data.name));
                fullpath = Path.Combine(dirPath, filename);
            } else {
                dirPath = Utils.RemoveInvalidCharacters(path);
                fullpath = Path.Combine(dirPath, filename);
            }

            try {
                Directory.CreateDirectory(dirPath);
                // A session never overwrites another run, including restarts within the same minute.
                filename += $" {now:HHmmssfff}-{Guid.NewGuid():N}.gtfo";
                fullpath = Path.Combine(dirPath, filename);
                fs = new FileStream(fullpath, FileMode.CreateNew, FileAccess.Write, FileShare.Read, 65536, FileOptions.Asynchronous);
            } catch (Exception ex) {
                recordingError = ex.Message;
                APILogger.Error($"Recording could not start at '{fullpath}': {ex}");
                return;
            }
            APILogger.Warn($"REPLAY LOCATION: {fullpath}");
            health.Path = fullpath;
            var stream = fs;
            container = new ReplayContainer(stream);
            diskWrites = new BufferWriteQueue(async bytes => {
                await container.WriteFrame(bytes).ConfigureAwait(false);
                Interlocked.Exchange(ref health.Bytes, container.PhysicalBytes);
            });
            liveWrites = new BufferWriteQueue(SendBufferOverNetwork, 128, 32 * 1024 * 1024);

            spectators.Clear();
            alertedPlayers.Clear();
            alertedPlayers.Add(PlayerManager.GetLocalPlayerAgent().Owner.Lookup);
            pool = new BufferPool();

            networkOffset = 0;
            buffer.Clear();
            buffer.Reserve(sizeof(int), true); // Reserve space to write size of buffer
            SnapshotManager.types.Write(buffer);

            headers = new HeaderSequence(SnapshotManager.types.headers);

            state.Clear();
            foreach (Type t in SnapshotManager.types.dynamics) {
                state.dynamics.Add(t, new DynamicCollection(t, this));
            }

            replayInstanceId = _replayInstanceId++;
            // Notify only after successful initialization, so plugins see the actual session path.
            CallbackGuard.Invoke("Recording start", Replay.OnStartRecording, fullpath, SnapshotManager.Report);
        }

        [HideFromIl2Cpp]
        internal void Trigger(ReplayHeader header) {
            SnapshotManager.Guard($"Header {header.GetType().FullName}", () => WriteHeader(header));
        }
        [HideFromIl2Cpp]
        private void WriteHeader(ReplayHeader header) {
            if (!Active) return;

            Type headerType = header.GetType();

            bool complete = headers.Write(headerType, () => {
                ushort id = SnapshotManager.types[headerType];
                APILogger.Debug($"[Header: {headerType.FullName}({id})]{(header.Debug != null ? $": {header.Debug}" : "")}");
                BitHelper.WriteBytes(id, buffer);
                header.Write(buffer);
            });
            if (complete) OnHeaderComplete();
        }

        [HideFromIl2Cpp]
        private Task SendBufferOverNetwork(ReadOnlyMemory<byte> data) {
            if (!MemoryMarshal.TryGetArray(data, out var bytes)) throw new InvalidOperationException("Expected owned array memory.");
            var buffer = new ByteBuffer(bytes) { count = bytes.Count };
            if (HostClient.Main.readyConnections.Count > 0) {
                int numBytes = buffer.count; // For debugging

                try {
                    int bytesSent = 0;
                    while (bytesSent < buffer.count) {
                        const int sizeOfHeader = sizeof(ushort) + 1 + sizeof(int) + sizeof(int);

                        int bytesToSend = Mathf.Min(buffer.count - bytesSent, rSteamServer.maxPacketSize - sizeof(ushort) - sizeOfHeader - sizeof(int));

                        ByteBuffer packet = new ByteBuffer(new byte[sizeOfHeader + bytesToSend + sizeof(int)]);
                        // host -> client : Forward message to viewer
                        BitHelper.WriteBytes((ushort)HostClient.MessageType.ForwardMessage, packet);

                        // Message to forward to viewer
                        BitHelper.WriteBytes(sizeOfHeader + bytesToSend, packet); // message size in bytes
                        BitHelper.WriteBytes((ushort)ClientViewer.MessageType.LiveBytes, packet); // message type
                        BitHelper.WriteBytes(replayInstanceId, packet); // replay instance id
                        BitHelper.WriteBytes(networkOffset + bytesSent, packet); // offset
                        BitHelper.WriteBytes(bytesToSend, packet); // number of bytes to read
                        BitHelper.WriteBytes(new ArraySegment<byte>(buffer._array.Array!, buffer._array.Offset + bytesSent, bytesToSend), packet, false); // file-bytes

                        if (HostClient.Main.socket != null) {
                            foreach (HSteamNetConnection connection in HostClient.Main.readyConnections.Keys) {
                                HostClient.Main.socket.SendTo(connection, packet.Array);
                            }
                        }

                        bytesSent += bytesToSend;

                        APILogger.Debug($"Sending Snapshot {bytesSent}/{buffer.count} ...");
                    }

                    APILogger.Debug($"Finished send: {bytesSent} / {numBytes} - {buffer.count}"); // NOTE(randomuserhi): Due to multithreading - need to check if buffer.count == numBytes
                } catch (Exception e) {
                    APILogger.Error($"Unable to send snapshot bytes: {e}");
                }
            }
            networkOffset += buffer.count;
            return Task.CompletedTask;
        }

        private bool QueueBuffer() {
            if (diskWrites == null || !diskWrites.TryWrite(buffer.Array.AsSpan())) {
                FailRecording("Queue recording frame", diskWrites?.Error ?? new IOException("Disk write backlog exceeded the recording memory budget."));
                return false;
            }
            Interlocked.Add(ref queuedOffset, buffer.Count);
            if (!liveFailed && liveWrites != null && !liveWrites.TryWrite(buffer.Array.AsSpan())) {
                liveFailed = true;
                APILogger.Error("Live view stopped: spectator backlog exceeded its memory budget. Local recording continues.");
                foreach (var connection in HostClient.Main.readyConnections.Keys) {
                    SteamNetworkingSockets.CloseConnection(connection, 0, "Live replay backlog exceeded", false);
                }
                HostClient.Main.readyConnections.Clear();
            }
            return true;
        }

        private void OnHeaderComplete() {
            if (fs == null) throw new ReplaySnapshotNotInitialized();

            EndOfHeader eoh = new EndOfHeader();
            APILogger.Debug($"[Header: {typeof(EndOfHeader).FullName}({SnapshotManager.types[typeof(EndOfHeader)]})]{(eoh.Debug != null ? $": {eoh.Debug}" : "")}");
            eoh.Write(buffer);

            // NOTE(randomuserhi): Save header bytes to use on remote live view
            // header.Copy(buffer);

            APILogger.Debug($"Acknowledged Clients: {HostClient.Main.readyConnections.Count}");

            // insert size of buffer at start
            int index = 0;
            BitHelper.WriteBytes(buffer.count - sizeof(int), buffer._array, ref index);
            APILogger.Debug($"Header size: {buffer.count - sizeof(int)}");

            if (!QueueBuffer()) return;
            health.Phase = RecordingPhase.Recording;
            buffer.Clear();

            SnapshotManager.Invoke("Header complete", Replay.OnHeaderCompletion);
        }

        [HideFromIl2Cpp]
        internal void Configure<T>(int tickRate, int max) where T : ReplayDynamic {
            Type dynType = typeof(T);
            if (!state.dynamics.ContainsKey(dynType)) throw new ReplayTypeDoesNotExist($"Type '{dynType.FullName}' does not exist.");
            state.dynamics[dynType].maxPerTick = max;
            state.dynamics[dynType].tickRate = tickRate;
        }

        [HideFromIl2Cpp]
        internal bool Trigger(ReplayEvent e) {
            if (!Active) return false;
            Type evType = e.GetType();
            long now = Now;
            Interlocked.Exchange(ref health.DurationMs, now);

            // Trigger hooks
            if (Replay.EventHooks.ContainsKey(evType)) {
                try {
                    Replay.EventHooks[evType]?.Invoke(now, e);
                } catch (Exception ex) {
                    FailRecording($"Event hook {evType}", ex);
                    return false;
                }
            }

            try {
                if (state.events.Count >= 65536) throw new InvalidDataException("Pending event count exceeded 65,536.");
                EventWrapper ev = new EventWrapper(now, e, pool);
                long bytes = ev.eventBuffer!.Count + 4L;
                if (state.eventBytes + bytes > 64 * 1024 * 1024) {
                    ev.Dispose();
                    throw new InvalidDataException("Pending events exceeded the 64 MB memory budget.");
                }
                state.eventBytes += bytes;
                state.events.Add(ev);
                return true;
            } catch (Exception ex) {
                FailRecording($"Event {evType}", ex);
            }
            return false;
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
        internal void Clear(Type type) {
            if (!state.dynamics.ContainsKey(type)) throw new ReplayTypeDoesNotExist($"Type '{type.FullName}' does not exist.");
            foreach (ReplayDynamic dynamic in state.dynamics[type]) {
                Despawn(dynamic);
            }
        }

        [HideFromIl2Cpp]
        internal void Spawn(ReplayDynamic dynamic, bool errorOnDuplicate = true) {
            if (!Active) return;
            Type dynType = dynamic.GetType();
            if (!state.dynamics.ContainsKey(dynType)) throw new ReplayTypeDoesNotExist($"Type '{dynType.FullName}' does not exist.");

            if (state.dynamics[dynType].Has(dynamic)) {
                if (errorOnDuplicate) throw new ReplayDynamicAlreadyExists($"Dynamic [{dynamic.id}] already exists in DynamicCollection of type '{dynType.FullName}'.");
                return;
            }

            if (!Trigger(new ReplaySpawn(dynamic))) {
                APILogger.Error($"Unable to spawn '{dynType}' as spawn event failed.");
                return;
            }

            state.dynamics[dynType].AddNoChecks(dynamic);

            // Trigger Hooks
            // NOTE(randomuserhi): Happens after add to be accessible via Replay.TryGet during hook
            if (Replay.SpawnHooks.ContainsKey(dynType)) {
                try {
                    Replay.SpawnHooks[dynType]?.Invoke(Now, dynamic);
                } catch (Exception ex) {
                    FailRecording($"Spawn hook {dynType}({dynamic.id})", ex);
                }
            }
        }
        [HideFromIl2Cpp]
        internal void Despawn(ReplayDynamic dynamic, bool errorOnNotFound = true) {
            if (!Active) return;
            Type dynType = dynamic.GetType();
            if (!state.dynamics.ContainsKey(dynType)) throw new ReplayTypeDoesNotExist($"Type '{dynType.FullName}' does not exist.");

            if (!state.dynamics[dynType].Has(dynamic)) {
                if (errorOnNotFound) throw new ReplayDynamicDoesNotExist($"Dynamic [{dynamic.id}] does not exist in DynamicCollection of type '{dynType.FullName}'.");
                return;
            }

            if (!Trigger(new ReplayDespawn(dynamic))) {
                APILogger.Error($"Unable to despawn '{dynType}' as despawn event failed.");
                return;
            }

            // Trigger Hooks
            // NOTE(randomuserhi): Happens before remove to be accessible via Replay.TryGet during hook
            if (Replay.DespawnHooks.ContainsKey(dynType)) {
                try {
                    Replay.DespawnHooks[dynType]?.Invoke(Now, dynamic);
                } catch (Exception ex) {
                    FailRecording($"Despawn hook {dynType}({dynamic.id})", ex);
                }
            }

            state.dynamics[dynType].RemoveNoChecks(dynamic.id);
        }

        private Stopwatch stopwatch = new Stopwatch();
        private readonly RecordingDiagnostics diagnostics = new();

        private int bufferShrinkTick = 0; // tick count to check when to clear buffers
        private int peakInUse = 0;
        private void Tick() {
            if (pool.InUse > peakInUse) peakInUse = pool.InUse;
            if (++bufferShrinkTick > 100) {
                bufferShrinkTick = 0;
                pool.Shrink(Mathf.Max(50, peakInUse));
                peakInUse = 0;
            }

            stopwatch.Restart();
            long allocatedBefore = GC.GetAllocatedBytesForCurrentThread();
            if (fs == null) throw new ReplaySnapshotNotInitialized();

            // Invoke tick processes
            SnapshotManager.Invoke("Recorder tick", Replay.OnTick);
            if (!Active) return;

            // Prepare time
            long now = Now;
            Interlocked.Exchange(ref health.DurationMs, now);
            if (now > uint.MaxValue) {
                Dispose();
                throw new ReplayInvalidTimestamp($"ReplayRecorder does not support replays longer than {uint.MaxValue}ms.");
            }

            // Clear write buffer
            buffer.Clear();
            buffer.Reserve(sizeof(int), true); // reserve space for size of buffer

            bool success;
            try {
                success = state.Write(now, buffer);
            } catch (Exception ex) {
                success = false;
                FailRecording($"Tick at {now}ms", ex);
            }

            if (success && Active) {
                // insert size of buffer to start
                int index = 0;
                BitHelper.WriteBytes(buffer.Count - sizeof(int), buffer._array, ref index);

                QueueBuffer();
            }
            stopwatch.Stop();
            diagnostics.Tick(stopwatch.Elapsed.TotalMilliseconds, GC.GetAllocatedBytesForCurrentThread() - allocatedBefore, queuedBytes);

            const float alpha = 0.9f;
            tickTime = alpha * tickTime + (1.0f - alpha) * (float)stopwatch.Elapsed.TotalMilliseconds;
        }
        internal float tickTime = 1.0f;
        internal long queuedBytes => diskWrites?.PendingBytes ?? 0;

        internal void Dispose() {
            if (closing) return;
            closing = true;
            if (recordingError == null) health.Phase = RecordingPhase.Saving;
            APILogger.Debug("Ending Replay...");
            try {
                if (fs != null && headers.Complete && recordingError == null) {
                    buffer.Clear();
                    buffer.Reserve(sizeof(int), true);
                    // End-game objects may already be torn down: capture queued events without polling them.
                    if (state.Write(Now, buffer, includeDynamics: false)) {
                        int index = 0;
                        BitHelper.WriteBytes(buffer.Count - sizeof(int), buffer._array, ref index);
                        QueueBuffer();
                    }
                }
            } catch (Exception ex) {
                recordingError = ex.Message;
                APILogger.Error($"Failed to capture final replay events: {ex}");
            }
            try {
                // Waiting is restricted to teardown; ordinary recording ticks never wait for I/O.
                diskWrites?.CompleteAsync().GetAwaiter().GetResult();
            } catch (Exception ex) {
                recordingError = ex.Message;
                APILogger.Error($"Replay queue failed: {ex}");
            }
            if (!headers.Complete && recordingError == null) recordingError = "Recording ended before level metadata was complete.";
            try {
                // Retain accepted frames even after capture fails, without claiming completion.
                container?.Flush().GetAwaiter().GetResult();
                string report = diagnostics.Report(diskWrites?.WrittenBytes ?? 0, container?.PhysicalBytes ?? 0, SessionId, recordingError);
                APILogger.Warn($"REPLAY DIAGNOSTICS: {report}");
                container?.WriteDiagnostics(report).GetAwaiter().GetResult();
                if (headers.Complete && recordingError == null) {
                    container?.Complete((uint)Now).GetAwaiter().GetResult();
                }
                Interlocked.Exchange(ref health.Bytes, container?.PhysicalBytes ?? 0);
                fs?.Flush(true);
            } catch (Exception ex) {
                recordingError = ex.Message;
                APILogger.Error($"Replay write failed: {ex}");
            } finally {
                fs?.Dispose();
                fs = null;
                state.Clear();
            }
            try {
                liveWrites?.CompleteAsync().GetAwaiter().GetResult();
            } catch (Exception ex) {
                APILogger.Error($"Live replay delivery failed: {ex}");
            }
            if (headers.Complete && recordingError == null) {
                health.Phase = RecordingPhase.Saved;
                APILogger.Warn($"REPLAY SAVED: {health.Path}");
            }

            Destroy(gameObject);
        }

        // NOTE(randomuserhi): Keeps track of players aware that live view is in use
        private HashSet<ulong> alertedPlayers = new HashSet<ulong>();

        // NOTE(randomuserhi): Keep track of logged spectators
        internal HashSet<HSteamNetConnection> spectators = new HashSet<HSteamNetConnection>();

        public float tickRate = 1f / 20f;
        internal void MarkerAdded() {
            ++health.Markers;
            APILogger.Warn($"Replay marker {health.Markers} at {Now / 1000d:0.0}s");
        }
        private float timer = 0;
        private void Update() {
            SnapshotManager.Guard("Recorder update", UpdateRecording);
        }
        [HideFromIl2Cpp]
        private void UpdateRecording() {
            var writeError = diskWrites?.Error ?? container?.Error;
            if (writeError != null && recordingError == null) {
                FailRecording("Background disk writer", writeError);
            }
            if (!Active || !headers.Complete) {
                return;
            }

            float rate;
            if (ConfigManager.MarkerKey != KeyCode.None && Input.GetKeyDown(ConfigManager.MarkerKey)) {
                ReplayMarker.Add($"Marker {health.Markers + 1}");
            }
            // Change tick rate based on state:
            switch (DramaManager.CurrentStateEnum) {
            case DRAMA_State.Encounter:
            case DRAMA_State.Survival:
            case DRAMA_State.IntentionalCombat:
            case DRAMA_State.Combat:
                rate = 1f / 20f;
                break;
            default:
                rate = 1f / 10f;
                break;
            }
            if (tickRate != rate) {
                timer = 0;
                tickRate = rate;
            }

            timer += Time.deltaTime;
            if (timer > tickRate) {
                timer = 0;

                // Check if all players are alerted of live view
                if (HostClient.Main.socket != null && HostClient.Main.readyConnections.Count > 0) {
                    const int maxLen = 50;

                    foreach (HSteamNetConnection connection in HostClient.Main.readyConnections.Keys) {
                        if (!spectators.Add(connection)) continue;

                        string message = $"[{HostClient.Main.socket.currentConnections[connection].name}] is spectating.";
                        APILogger.Warn(message);
                        if (!ConfigManager.DisableLeaveJoinMessages) {
                            while (message.Length > maxLen) {
                                PlayerChatManager.WantToSentTextMessage(PlayerManager.GetLocalPlayerAgent(), message.Substring(0, maxLen).Trim());
                                message = message.Substring(maxLen).Trim();
                            }
                            PlayerChatManager.WantToSentTextMessage(PlayerManager.GetLocalPlayerAgent(), message);
                        }
                    }

                    if (PlayerManager.PlayerAgentsInLevel.Count > 1) {
                        bool allAlerted = true;
                        foreach (PlayerAgent player in PlayerManager.PlayerAgentsInLevel) {
                            if (!alertedPlayers.Contains(player.Owner.Lookup) && player.Owner.IsInGame) {
                                allAlerted = false;
                                break;
                            }
                        }

                        if (!allAlerted) {
                            foreach (PlayerAgent player in PlayerManager.PlayerAgentsInLevel) {
                                if (!alertedPlayers.Contains(player.Owner.Lookup) && player.Owner.IsInGame) {
                                    alertedPlayers.Add(player.Owner.Lookup);
                                }
                            }

                            string message = "GTFOReplay Live View is in use. This allows the spectating user to see all item and enemy locations which may be considered cheating.";
                            while (message.Length > maxLen) {
                                PlayerChatManager.WantToSentTextMessage(PlayerManager.GetLocalPlayerAgent(), message.Substring(0, maxLen).Trim());
                                message = message.Substring(maxLen).Trim();
                            }
                            PlayerChatManager.WantToSentTextMessage(PlayerManager.GetLocalPlayerAgent(), message);
                        }
                    }
                }

                Tick();
            }
        }

        private void OnApplicationQuit() {
            SnapshotManager.Guard("Application quit", Dispose);
        }
    }
}
