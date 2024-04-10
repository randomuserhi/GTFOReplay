using API;
using Il2CppInterop.Runtime.Attributes;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Exceptions;
using ReplayRecorder.Snapshot;
using System.Diagnostics.CodeAnalysis;
using System.Reflection;

namespace ReplayRecorder {
    public static class Replay {
        private static void RegisterMethods(Type t) {
            foreach (MethodInfo method in t.GetMethods(Utils.AnyBindingFlags).Where(m =>
                m.GetCustomAttribute<ReplayReset>() != null ||
                m.GetCustomAttribute<ReplayInit>() != null ||
                m.GetCustomAttribute<ReplayTick>() != null ||
                m.GetCustomAttribute<ReplayOnHeaderCompletion>() != null ||
                m.GetCustomAttribute<ReplayOnGameplayStart>() != null ||
                m.GetCustomAttribute<ReplayOnElevatorStop>() != null)
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
                    } else if (method.GetCustomAttribute<ReplayTick>() != null) {
                        type = nameof(ReplayTick);
                        OnTick += (Action)method.CreateDelegate(typeof(Action));
                    } else if (method.GetCustomAttribute<ReplayOnElevatorStop>() != null) {
                        type = nameof(ReplayOnElevatorStop);
                        OnElevatorStop += (Action)method.CreateDelegate(typeof(Action));
                    } else {
                        OnExpeditionEnd += (Action)method.CreateDelegate(typeof(Action));
                    }
                    APILogger.Debug($"Registered {type}: '{t.FullName}.{method.Name}'");
                } else {
                    APILogger.Error($"Replay attributes can only be applied to static methods. '{method}' is not static.");
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

            SnapshotManager.types.RegisterType(dataInfo, type);
        }

        [HideFromIl2Cpp]
        public static void Configure<T>(int tickRate = 1, int max = int.MaxValue) where T : ReplayDynamic => SnapshotManager.GetInstance().Configure<T>(tickRate, max);
        [HideFromIl2Cpp]
        public static void Trigger(ReplayEvent e) => SnapshotManager.GetInstance().Trigger(e);
        [HideFromIl2Cpp]
        public static void Trigger(ReplayHeader header) => SnapshotManager.GetInstance().Trigger(header);
        [HideFromIl2Cpp]
        public static bool Has(ReplayDynamic dynamic) => SnapshotManager.GetInstance().Has(dynamic);
        [HideFromIl2Cpp]
        public static bool Has<T>(int id) where T : ReplayDynamic => SnapshotManager.GetInstance().Has(typeof(T), id);
        [HideFromIl2Cpp]
        public static T Get<T>(int id) where T : ReplayDynamic => (T)SnapshotManager.GetInstance().Get(typeof(T), id);
        [HideFromIl2Cpp]
        public static bool TryGet<T>(int id, [MaybeNullWhen(false)] out T dynamic) where T : ReplayDynamic {
            if (Has<T>(id)) {
                dynamic = Get<T>(id);
                return true;
            }
            dynamic = null;
            return false;
        }
        [HideFromIl2Cpp]
        public static void Spawn(ReplayDynamic dynamic, bool errorOnDuplicate = true) => SnapshotManager.GetInstance().Spawn(dynamic, errorOnDuplicate);
        [HideFromIl2Cpp]
        public static void Despawn(ReplayDynamic dynamic, bool errorOnNotFound = true) => SnapshotManager.GetInstance().Despawn(dynamic, errorOnNotFound);
        [HideFromIl2Cpp]
        public static bool TryDespawn<T>(int id) where T : ReplayDynamic {
            if (Has<T>(id)) {
                Despawn(Get<T>(id));
                return true;
            }
            return false;
        }

        public static bool Ready => SnapshotManager.Ready;
        public static bool Active => SnapshotManager.Active;

        public static Action? OnExpeditionEnd;
        public static Action? OnExpeditionStart;
        public static Action? OnElevatorStop;
        public static Action? OnGameplayStart;
        public static Action? OnHeaderCompletion;
        public static Action? OnTick;
    }
}
