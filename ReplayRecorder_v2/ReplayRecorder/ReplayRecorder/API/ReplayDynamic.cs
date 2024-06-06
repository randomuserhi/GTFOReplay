/// ReplayDynamic.cs
/// 
/// Internal event types used for representing spawn events for dynamic types.

using ReplayRecorder.API.Attributes;
using ReplayRecorder.Snapshot;

namespace ReplayRecorder.API {
    /// <summary>
    /// Internal spawn event data type
    /// </summary>
    [ReplayData("ReplayRecorder.Spawn", "0.0.1")]
    internal class ReplaySpawn : ReplayEvent {
        private ReplayDynamic dynamic;
        private ushort type;

        public override string? Debug => $"{dynamic.GetType().FullName}({type}) {dynamic.id}";

        public ReplaySpawn(ReplayDynamic dynamic) {
            this.dynamic = dynamic;
            type = SnapshotManager.types[dynamic.GetType()];
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(type, buffer);
            BitHelper.WriteBytes(dynamic.id, buffer);
            dynamic.Spawn(buffer);
        }
    }

    /// <summary>
    /// Internal despawn event data type
    /// </summary>
    [ReplayData("ReplayRecorder.Despawn", "0.0.1")]
    internal class ReplayDespawn : ReplayEvent {
        private ReplayDynamic dynamic;
        private ushort type;

        public override string? Debug => $"{dynamic.GetType().FullName}({type}) {dynamic.id}";

        public ReplayDespawn(ReplayDynamic dynamic) {
            this.dynamic = dynamic;
            type = SnapshotManager.types[dynamic.GetType()];
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(type, buffer);
            BitHelper.WriteBytes(dynamic.id, buffer);
            dynamic.Despawn(buffer);
        }
    }

    /// <summary>
    /// Represents a dynamic data type.
    /// 
    /// Dynamic data types are data structures that change over time and are thus polled each tick for changes.
    /// If a change is detected, data is written to the replay file.
    /// </summary>
    public abstract class ReplayDynamic : IEquatable<ReplayDynamic> {
        internal bool remove = false;
        //internal bool init = false;

        /// <summary>
        /// Debug string to print to console when debug is enabled.
        /// </summary>
        public virtual string? Debug => null;

        public readonly int id;

        /// <summary>
        /// If True, the data has changed and an update needs to be written this tick.
        /// </summary>
        public abstract bool IsDirty { get; }

        /// <summary>
        /// If True, this dynamic should be polled.
        /// </summary>  
        public abstract bool Active { get; }

        public ReplayDynamic(int id) {
            this.id = id;
        }

        /// <summary>
        /// Internal write to include a header for each dynamic type.
        /// </summary>
        /// <param name="buffer"></param>
        internal virtual void _Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(id, buffer);
        }

        /// <summary>
        /// Write this datastructure.
        /// 
        /// Is called each tick when the dynamic is marked as dirty.
        /// </summary>
        /// <param name="buffer">Buffer to write data to.</param>
        public virtual void Write(ByteBuffer buffer) { }

        /// <summary>
        /// Write spawn data.
        /// 
        /// Is called when the dynamic is first spawned.
        /// </summary>
        /// <param name="buffer">Buffer to write data to.</param>
        public virtual void Spawn(ByteBuffer buffer) { }

        /// <summary>
        /// Write despawn data.
        /// 
        /// Is called when the dynamic is despawned.
        /// </summary>
        /// <param name="buffer">Buffer to write data to.</param>
        public virtual void Despawn(ByteBuffer buffer) { }

        public static bool operator ==(ReplayDynamic? lhs, ReplayDynamic? rhs) {
            if (lhs is null) {
                if (rhs is null) {
                    return true;
                }
                return false;
            }
            return lhs.Equals(rhs);
        }
        public static bool operator !=(ReplayDynamic? lhs, ReplayDynamic? rhs) => !(lhs == rhs);

        public override bool Equals(object? obj) => Equals(obj as ReplayDynamic);
        public bool Equals(ReplayDynamic? other) {
            if (other is null) {
                return false;
            }

            if (ReferenceEquals(this, other)) {
                return true;
            }

            if (GetType() != other.GetType()) {
                return false;
            }

            return id == other.id;
        }

        public override int GetHashCode() {
            return GetType().GetHashCode() ^ id.GetHashCode();
        }
    }
}
