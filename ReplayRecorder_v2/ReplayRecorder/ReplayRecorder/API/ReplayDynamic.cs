using ReplayRecorder.API.Attributes;
using ReplayRecorder.Snapshot;

namespace ReplayRecorder.API {
    [ReplayData("ReplayRecorder.Spawn", "0.0.1")]
    internal class ReplaySpawn : ReplayEvent {
        private ReplayDynamic dynamic;
        private ushort type;

        public override string? Debug => $"{dynamic.GetType().FullName}({type}) {dynamic.Id}";

        public ReplaySpawn(ReplayDynamic dynamic) {
            this.dynamic = dynamic;
            type = SnapshotManager.types[dynamic.GetType()];
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(type, buffer);
            BitHelper.WriteBytes(dynamic.Id, buffer);
            dynamic.Spawn(buffer);
        }
    }

    [ReplayData("ReplayRecorder.Despawn", "0.0.1")]
    internal class ReplayDespawn : ReplayEvent {
        private ReplayDynamic dynamic;
        private ushort type;

        public override string? Debug => $"{dynamic.GetType().FullName}({type}) {dynamic.Id}";

        public ReplayDespawn(ReplayDynamic dynamic) {
            this.dynamic = dynamic;
            type = SnapshotManager.types[dynamic.GetType()];
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(type, buffer);
            BitHelper.WriteBytes(dynamic.Id, buffer);
            dynamic.Despawn(buffer);
        }
    }

    public abstract class ReplayDynamic : IEquatable<ReplayDynamic> {
        internal bool remove = false;
        //internal bool init = false;

        public virtual string? Debug => null;

        public abstract int Id { get; }
        public abstract bool IsDirty { get; }
        public abstract bool Active { get; }

        internal virtual void _Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(Id, buffer);
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

            return Id == other.Id;
        }

        public override int GetHashCode() {
            return GetType().GetHashCode() ^ Id.GetHashCode();
        }
    }
}
