using API;
using Il2CppInterop.Runtime.Attributes;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Exceptions;
using ReplayRecorder.Snapshot;
using System.Reflection;
using UnityEngine;

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
                    APILogger.Debug($"Registered {type}: '{t.FullName}.{method.Name}'");
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

            SnapshotManager.types.RegisterType(dataInfo, type);
        }

        [HideFromIl2Cpp]
        public static void Trigger(ReplayEvent e) => SnapshotManager.GetInstance().Trigger(e);
        [HideFromIl2Cpp]
        public static void Trigger(ReplayHeader header) => SnapshotManager.GetInstance().Trigger(header);
        [HideFromIl2Cpp]
        public static void Spawn(ReplayDynamic dynamic, eDimensionIndex dimensionIndex, Vector3 position) => SnapshotManager.GetInstance().Spawn(dynamic, (byte)dimensionIndex, position);
        [HideFromIl2Cpp]
        public static void Spawn(ReplayDynamic dynamic, eDimensionIndex dimensionIndex, Vector3 position, Quaternion rotation) => SnapshotManager.GetInstance().Spawn(dynamic, (byte)dimensionIndex, position, rotation);
        [HideFromIl2Cpp]
        public static void Spawn(ReplayDynamic dynamic, byte dimensionIndex, Vector3 position) => SnapshotManager.GetInstance().Spawn(dynamic, dimensionIndex, position);
        [HideFromIl2Cpp]
        public static void Spawn(ReplayDynamic dynamic, byte dimensionIndex, Vector3 position, Quaternion rotation) => SnapshotManager.GetInstance().Spawn(dynamic, dimensionIndex, position, rotation);
        [HideFromIl2Cpp]
        public static void Spawn(ReplayDynamic dynamic, bool errorOnDuplicate, eDimensionIndex dimensionIndex, Vector3 position) => SnapshotManager.GetInstance().Spawn(dynamic, errorOnDuplicate, (byte)dimensionIndex, position);
        [HideFromIl2Cpp]
        public static void Spawn(ReplayDynamic dynamic, bool errorOnDuplicate, eDimensionIndex dimensionIndex, Vector3 position, Quaternion rotation) => SnapshotManager.GetInstance().Spawn(dynamic, errorOnDuplicate, (byte)dimensionIndex, position, rotation);
        [HideFromIl2Cpp]
        public static void Spawn(ReplayDynamic dynamic, bool errorOnDuplicate, byte dimensionIndex, Vector3 position) => SnapshotManager.GetInstance().Spawn(dynamic, errorOnDuplicate, dimensionIndex, position);
        [HideFromIl2Cpp]
        public static void Spawn(ReplayDynamic dynamic, bool errorOnDuplicate, byte dimensionIndex, Vector3 position, Quaternion rotation) => SnapshotManager.GetInstance().Spawn(dynamic, errorOnDuplicate, dimensionIndex, position, rotation);
        [HideFromIl2Cpp]
        public static void Spawn(ReplayDynamic dynamic, bool errorOnDuplicate = true) => SnapshotManager.GetInstance().Spawn(dynamic, errorOnDuplicate);
        [HideFromIl2Cpp]
        public static void Despawn(Type dynType, int id, bool errorOnNotFound = true) => SnapshotManager.GetInstance().Despawn(dynType, id, errorOnNotFound);
        [HideFromIl2Cpp]
        public static void Despawn(ReplayDynamic dynamic, bool errorOnNotFound = true) => SnapshotManager.GetInstance().Despawn(dynamic, errorOnNotFound);

        public static Action? OnExpeditionEnd;
        public static Action? OnExpeditionStart;
        public static Action? OnGameplayStart;
        public static Action? OnHeaderCompletion;
    }
}
