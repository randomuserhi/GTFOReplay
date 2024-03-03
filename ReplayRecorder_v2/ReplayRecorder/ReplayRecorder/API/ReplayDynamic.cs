using ReplayRecorder.API.Attributes;
using ReplayRecorder.Snapshot;

namespace ReplayRecorder.API {
    [ReplayData("ReplayRecorder.Spawn", "0.0.1")]
    internal class ReplaySpawn : ReplayEvent {
        private ReplayDynamic dynamic;
        private ushort type;

        public override string? Debug => $"{dynamic.GetType().FullName}({type})";

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

        public override string? Debug => $"{dynamic.GetType().FullName}({type})";

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

    public abstract class ReplayDynamic {
        internal bool remove = false;

        public virtual string? Debug => null;

        public abstract int Id { get; }
        public abstract bool IsDirty { get; }

        internal virtual void _Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(Id, buffer);
        }
        public virtual void Write(ByteBuffer buffer) { }

        public virtual void Spawn(ByteBuffer buffer) { }

        public virtual void Despawn(ByteBuffer buffer) { }
    }
}
