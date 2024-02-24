using API;
using ReplayRecorder.API;
using ReplayRecorder.Snapshot.Exceptions;

namespace ReplayRecorder.Snapshot.Types {
    internal class SnapshotTypeManager {
        public readonly HashSet<Type> dynamics = new HashSet<Type>();
        public readonly HashSet<Type> events = new HashSet<Type>();
        public readonly HashSet<Type> headers = new HashSet<Type>();

        private Dictionary<string, Type> typenameMap = new Dictionary<string, Type>();
        private Dictionary<Type, ushort> typeMap = new Dictionary<Type, ushort>();

        public enum Const {
            HeaderEnd
        }
        private ushort staticType = 256;

        public bool Contains(Type type) {
            return typeMap.ContainsKey(type);
        }

        public ushort this[Type type] {
            get {
                if (typeMap.ContainsKey(type)) {
                    return typeMap[type];
                } else {
                    throw new ReplayTypeDoesNotExist($"Type '{type.FullName}' does not exist.");
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

        private string Clean(string typename) {
            return typename.Replace(" ", "").Trim();
        }

        public void RegisterType(string typename, Type type) {
            typename = Clean(typename);

            if (typenameMap.ContainsKey(typename)) {
                throw new ReplayDuplicateTypeName($"Typename '{typename}' already exists.");
            }
            if (typeMap.ContainsKey(type)) {
                throw new ReplayDuplicateType($"Type '{type.FullName}' already exists.");
            }
            if (staticType == ushort.MaxValue) {
                throw new ReplayTypeOverflow($"Could not assign type '{typename}' as there are no more indicies that can be assigned.");
            }
            if (typeof(ReplayDynamic).IsAssignableFrom(type)) {
                dynamics.Add(type);
            } else if (typeof(ReplayEvent).IsAssignableFrom(type)) {
                events.Add(type);
            } else if (typeof(ReplayHeader).IsAssignableFrom(type)) {
                headers.Add(type);
            } else {
                throw new ReplayIncompatibleType($"Type '{type.FullName}' is not a Dynamic, Event or Header.");
            }

            ushort id = staticType++;
            typenameMap.Add(typename, type);
            typeMap.Add(type, id);

            APILogger.Debug($"Registered: '{typename}' => {type.FullName}[{id}]");
        }

        public void Write(FileStream fs) {
            BitHelper.WriteBytes((ushort)typenameMap.Count, fs);
            foreach (KeyValuePair<string, Type> pair in typenameMap) {
                BitHelper.WriteBytes(pair.Key, fs);
                BitHelper.WriteBytes(typeMap[pair.Value], fs);
            }
        }
    }
}
