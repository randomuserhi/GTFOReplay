using API;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Snapshot.Exceptions;
using System.Text;

namespace ReplayRecorder.Snapshot.Types {
    internal class SnapshotTypeManager {
        public readonly HashSet<Type> dynamics = new HashSet<Type>();
        public readonly HashSet<Type> events = new HashSet<Type>();
        public readonly HashSet<Type> headers = new HashSet<Type>();

        private Dictionary<string, Type> typenameMap = new Dictionary<string, Type>();
        private Dictionary<Type, ushort> typeMap = new Dictionary<Type, ushort>();
        private Dictionary<Type, string> versionMap = new Dictionary<Type, string>();

        private ushort staticType = 0;

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

        public void RegisterType(ReplayData data, Type type) {
            string typename = Clean(data.Typename);

            if (typenameMap.ContainsKey(typename)) {
                throw new ReplayDuplicateTypeName($"Typename '{typename}' already exists.");
            }
            if (typeMap.ContainsKey(type)) {
                throw new ReplayDuplicateType($"Type '{type.FullName}' already exists.");
            }
            if (staticType == ushort.MaxValue) {
                throw new ReplayTypeOverflow($"Could not assign type '{typename}' as there are no more indicies that can be assigned.");
            }
            string t;
            if (typeof(ReplayDynamic).IsAssignableFrom(type)) {
                t = "Dynamic";
                dynamics.Add(type);
            } else if (typeof(ReplayEvent).IsAssignableFrom(type)) {
                t = "Event";
                events.Add(type);
            } else if (typeof(ReplayHeader).IsAssignableFrom(type)) {
                t = "Header";
                headers.Add(type);
            } else {
                throw new ReplayIncompatibleType($"Type '{type.FullName}' is not a Dynamic, Event or Header.");
            }

            ushort id = staticType++;
            typenameMap.Add(typename, type);
            typeMap.Add(type, id);
            versionMap.Add(type, data.Version);

            APILogger.Debug($"Registered {t}: '{typename}' => {type.FullName}[{id}]");
        }

        public void Write(ByteBuffer buffer) {
            StringBuilder debug = new StringBuilder();

            BitHelper.WriteBytes("0.0.1", buffer);
            BitHelper.WriteBytes((ushort)typenameMap.Count, buffer);
            debug.AppendLine($"\n\tTypeMap[{typenameMap.Count}]:");
            foreach (KeyValuePair<string, Type> pair in typenameMap) {
                debug.AppendLine($"\t{typeMap[pair.Value]} => {pair.Key}({versionMap[pair.Value]}) [{pair.Value.FullName}]");
                BitHelper.WriteBytes(typeMap[pair.Value], buffer);
                BitHelper.WriteBytes(pair.Key, buffer);
                BitHelper.WriteBytes(versionMap[pair.Value], buffer);
            }

            APILogger.Debug(debug.ToString());
        }
    }
}
