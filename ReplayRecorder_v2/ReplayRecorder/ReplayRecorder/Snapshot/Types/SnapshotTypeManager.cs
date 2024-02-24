using ReplayRecorder.API;
using ReplayRecorder.Snapshot.Exceptions;

namespace ReplayRecorder.Snapshot.Types {
    internal class SnapshotTypeManager : IWriteable {
        private Dictionary<string, Type> typenameMap = new Dictionary<string, Type>();
        private Dictionary<Type, ushort> typeMap = new Dictionary<Type, ushort>();
        private ushort staticType = 0;

        public ushort this[Type type] {
            get {
                if (typeMap.ContainsKey(type)) {
                    return typeMap[type];
                } else {
                    throw new ReplayTypeDoesNotExist($"Type '{type}' does not exist.");
                }
            }
        }
        public ushort this[string typename] {
            get {
                if (typenameMap.ContainsKey(typename)) {
                    return typeMap[typenameMap[typename]];
                } else {
                    throw new ReplayTypeDoesNotExist($"Type '{typename}' does not exist.");
                }
            }
        }

        public void RegisterType(string typename, Type type) {
            if (typenameMap.ContainsKey(typename)) {
                throw new ReplayDuplicateTypeName($"Typename '{typename}' already exists.");
            }
            if (typeMap.ContainsKey(type)) {
                throw new ReplayDuplicateType($"Type '{type}' already exists.");
            }
            if (staticType == ushort.MaxValue) {
                throw new ReplayTypeOverflow($"Could not assign type '{typename}' as there are no more indicies that can be assigned.");
            }
            ushort id = staticType++;
            typenameMap.Add(typename, type);
            typeMap.Add(type, id);
        }

        public void Write(FileStream fs) {
            BitHelper.WriteBytes((ushort)typenameMap.Count, fs);
            foreach (KeyValuePair<string, Type> pair in typenameMap) {
                BitHelper.WriteBytes(pair.Key, fs);
            }
        }
    }
}
