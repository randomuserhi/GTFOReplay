using ReplayRecorder.Snapshot.Exceptions;

namespace ReplayRecorder.Snapshot.Types {
    internal class SnapshotTypeManager {
        private Dictionary<string, uint> typenameMap = new Dictionary<string, uint>();
        private uint staticType = 0;

        public uint RegisterType(string typename) {
            if (typenameMap.ContainsKey(typename)) {
                throw new ReplayRecorderTypeOverflow($"Typename '{typename}' already exists.");
            }
            if (staticType == uint.MaxValue) {
                throw new ReplayRecorderTypeOverflow($"Could not assign type '{typename}' as there are no more indicies that can be assigned.");
            }
            return staticType++;
        }
    }
}
