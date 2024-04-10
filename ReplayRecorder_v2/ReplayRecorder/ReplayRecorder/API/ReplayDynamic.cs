using ReplayRecorder.API.Attributes;
using ReplayRecorder.Snapshot;

namespace ReplayRecorder.API {
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

    public abstract class ReplayDynamic : IEquatable<ReplayDynamic> {
        internal bool remove = false;
        //internal bool init = false;

        public virtual string? Debug => null;

        public readonly int id;
        public abstract bool IsDirty { get; }
        public abstract bool Active { get; }

        public ReplayDynamic(int id) {
            this.id = id;
        }

        internal virtual void _Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(id, buffer);
        }
        public virtual void Write(ByteBuffer buffer) { }

        public virtual void Spawn(ByteBuffer buffer) { }

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
