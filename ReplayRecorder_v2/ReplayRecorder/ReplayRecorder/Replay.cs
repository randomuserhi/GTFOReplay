using API;
using ReplayRecorder.API;
using ReplayRecorder.Exceptions;
using ReplayRecorder.Snapshot;
using System.Reflection;

namespace ReplayRecorder {
    public static class Replay {
        private static void RegisterMethods(Type t) {
            foreach (MethodInfo method in t.GetMethods(Utils.AnyBindingFlags).Where(m =>
                m.GetCustomAttribute<ReplayReset>() != null ||
                m.GetCustomAttribute<ReplayInit>() != null ||
                m.GetCustomAttribute<ReplayOnHeaderCompletion>() != null ||
                m.GetCustomAttribute<ReplayOnGameplayStart>() != null)
            ) {
                if (method.IsStatic) {
                    string type = nameof(ReplayReset);
                    if (method.GetCustomAttribute<ReplayInit>() != null) {
                        type = nameof(ReplayInit);
                        OnExpeditionStart += (Action)method.CreateDelegate(typeof(Action));
                    } else if (method.GetCustomAttribute<ReplayOnHeaderCompletion>() != null) {
                        type = nameof(ReplayOnHeaderCompletion);
                        OnHeaderCompletion += (Action)method.CreateDelegate(typeof(Action));
                    } else if (method.GetCustomAttribute<ReplayOnGameplayStart>() != null) {
                        type = nameof(ReplayOnGameplayStart);
                        OnGameplayStart += (Action)method.CreateDelegate(typeof(Action));
                    } else {
                        OnExpeditionEnd += (Action)method.CreateDelegate(typeof(Action));
                    }
                    APILogger.Debug($"Registered: '{t.FullName}.{method.Name}' => {type}");
                } else {
                    APILogger.Error($"[ReplayReset] / [ReplayInit] can only be applied to static methods. '{method}' is not static.");
                }
            }
        }

        public static void RegisterAll() {
            foreach (Type t in Assembly.GetCallingAssembly().GetTypes()) {
                if (t.GetCustomAttribute<ReplayData>() != null) {
                    RegisterType(t);
                }
                RegisterMethods(t);
            }
        }

        public static void RegisterAll(Type type) {
            foreach (Type t in type.GetNestedTypes(Utils.AnyBindingFlags)) {
                if (type.GetCustomAttribute<ReplayData>() != null) {
                    RegisterType(t);
                }
                RegisterMethods(t);
                RegisterAll(t);
            }
        }

        public static void RegisterType(Type type) {
            ReplayData? dataInfo = type.GetCustomAttribute<ReplayData>();
            if (dataInfo == null) {
                throw new ReplayTypeNotCompatible($"Type '{type}' is not a valid ReplayData type.");
            }

            SnapshotManager.types.RegisterType(dataInfo.Typename, type);
        }

        public static void Trigger(ReplayEvent e) => SnapshotManager.GetInstance().Trigger(e);
        public static void Trigger(ReplayHeader header) => SnapshotManager.GetInstance().Trigger(header);
        public static void Spawn(ReplayDynamic dynamic) => SnapshotManager.GetInstance().Spawn(dynamic);
        public static void Despawn(ReplayDynamic dynamic) => SnapshotManager.GetInstance().Despawn(dynamic);

        public static Action? OnExpeditionEnd;
        public static Action? OnExpeditionStart;
        public static Action? OnGameplayStart;
        public static Action? OnHeaderCompletion;
    }
}
