using API;
using Il2CppInterop.Runtime.Attributes;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Exceptions;
using ReplayRecorder.Snapshot;
using System.Diagnostics.CodeAnalysis;
using System.Linq.Expressions;
using System.Reflection;

namespace ReplayRecorder {
    public static class Replay {
        private static Delegate CreateCompatibleDelegate(MethodInfo methodInfo, Type delegateType) {
            var methodParams = methodInfo.GetParameters();
            var delegateInvoke = delegateType.GetMethod("Invoke")!;
            var delegateParams = delegateInvoke.GetParameters();

            var parameters = delegateParams
                .Select(p => Expression.Parameter(p.ParameterType, p.Name))
                .ToArray();

            var arguments = methodParams
                .Select((mp, i) => Expression.Convert(parameters[i], mp.ParameterType))
                .ToArray();

            var call = Expression.Call(null, methodInfo, arguments);

            var lambda = Expression.Lambda(delegateType, call, parameters);

            return lambda.Compile();
        }

        private static void RegisterMethods(Type t) {
            foreach (MethodInfo method in t.GetMethods(Utils.AnyBindingFlags).Where(m =>
                m.GetCustomAttribute<ReplayOnExpeditionEnd>() != null ||
                m.GetCustomAttribute<ReplayInit>() != null ||
                m.GetCustomAttribute<ReplayTick>() != null ||
                m.GetCustomAttribute<ReplayOnHeaderCompletion>() != null ||
                m.GetCustomAttribute<ReplayOnGameplayStart>() != null ||
                m.GetCustomAttribute<ReplayOnElevatorStop>() != null ||
                m.GetCustomAttribute<ReplayHook>() != null ||
                m.GetCustomAttribute<ReplaySpawnHook>() != null ||
                m.GetCustomAttribute<ReplayDespawnHook>() != null)
            ) {
                if (method.IsStatic) {
                    try {
                        string type = nameof(ReplayOnExpeditionEnd);

                        ReplayHook? hook = method.GetCustomAttribute<ReplayHook>();
                        ReplaySpawnHook? spawnHook = method.GetCustomAttribute<ReplaySpawnHook>();
                        ReplayDespawnHook? despawnHook = method.GetCustomAttribute<ReplayDespawnHook>();

                        if (hook != null) {
                            type = nameof(ReplayHook);

                            if (hook.type.IsAssignableTo(typeof(ReplayEvent))) {
                                Action<long, ReplayEvent> action = (Action<long, ReplayEvent>)CreateCompatibleDelegate(method, typeof(Action<long, ReplayEvent>));
                                if (!EventHooks.ContainsKey(hook.type)) {
                                    EventHooks.Add(hook.type, action);
                                } else {
                                    EventHooks[hook.type] += action;
                                }
                            } else if (hook.type.IsAssignableTo(typeof(ReplayDynamic))) {
                                Action<long, ReplayDynamic> action = (Action<long, ReplayDynamic>)CreateCompatibleDelegate(method, typeof(Action<long, ReplayDynamic>));
                                if (hook.triggerOnlyWhenDirty) {
                                    if (!DirtyDynamicHooks.ContainsKey(hook.type)) {
                                        DirtyDynamicHooks.Add(hook.type, action);
                                    } else {
                                        DirtyDynamicHooks[hook.type] += action;
                                    }
                                } else {
                                    if (!DynamicHooks.ContainsKey(hook.type)) {
                                        DynamicHooks.Add(hook.type, action);
                                    } else {
                                        DynamicHooks[hook.type] += action;
                                    }
                                }
                            } else {
                                APILogger.Error($"Failed to register method '{method}': Type '{hook.type}' is not a valid ReplayDynamic / ReplayEvent.");
                            }
                        } else if (spawnHook != null) {
                            type = nameof(ReplaySpawnHook);
                            if (spawnHook.type.IsAssignableTo(typeof(ReplayDynamic))) {
                                Action<long, ReplayDynamic> action = (Action<long, ReplayDynamic>)CreateCompatibleDelegate(method, typeof(Action<long, ReplayDynamic>));
                                if (!SpawnHooks.ContainsKey(spawnHook.type)) {
                                    SpawnHooks.Add(spawnHook.type, action);
                                } else {
                                    SpawnHooks[spawnHook.type] += action;
                                }
                            } else {
                                APILogger.Error($"Failed to register method '{method}': Type '{spawnHook.type}' is not a valid ReplayDynamic.");
                            }
                        } else if (despawnHook != null) {
                            type = nameof(ReplayDespawnHook);
                            if (despawnHook.type.IsAssignableTo(typeof(ReplayDynamic))) {
                                Action<long, ReplayDynamic> action = (Action<long, ReplayDynamic>)CreateCompatibleDelegate(method, typeof(Action<long, ReplayDynamic>));
                                if (!DespawnHooks.ContainsKey(despawnHook.type)) {
                                    DespawnHooks.Add(despawnHook.type, action);
                                } else {
                                    DespawnHooks[despawnHook.type] += action;
                                }
                            } else {
                                APILogger.Error($"Failed to register method '{method}': Type '{despawnHook.type}' is not a valid ReplayDynamic.");
                            }
                        } else if (method.GetCustomAttribute<ReplayInit>() != null) {
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
                    } catch (Exception ex) {
                        APILogger.Error($"Failed to register method '{method}': {ex}");
                    }
                } else {
                    APILogger.Error($"Replay attributes can only be applied to static methods. '{method}' is not static.");
                }
            }
        }

        /// <summary>
        /// Registers all attributes in the calling assembly.
        /// </summary>
        public static void RegisterAll() {
            foreach (Type t in Assembly.GetCallingAssembly().GetTypes()) {
                if (t.GetCustomAttribute<ReplayData>() != null) {
                    RegisterType(t);
                }
                RegisterMethods(t);
            }
        }

        /// <summary>
        /// Registers all attributes for a given type recursively (includes nested children).
        /// </summary>
        /// <param name="type"></param>
        public static void RegisterAll(Type type) {
            foreach (Type t in type.GetNestedTypes(Utils.AnyBindingFlags)) {
                if (type.GetCustomAttribute<ReplayData>() != null) {
                    RegisterType(t);
                }
                RegisterMethods(t);
                RegisterAll(t);
            }
        }

        /// <summary>
        /// Register a ReplayData type.
        /// </summary>
        /// <param name="type"></param>
        /// <exception cref="ReplayTypeNotCompatible">The provided type was not marked with the ReplayData attribute.</exception>
        public static void RegisterType(Type type) {
            ReplayData? dataInfo = type.GetCustomAttribute<ReplayData>();
            if (dataInfo == null) {
                throw new ReplayTypeNotCompatible($"Type '{type}' is not a valid ReplayData type.");
            }

            SnapshotManager.types.RegisterType(dataInfo, type);
        }

        /// <summary>
        /// </summary>
        /// <typeparam name="T">The dynamic type to configure.</typeparam>
        /// <param name="tickRate">The frequency that this type gets recorded at. E.g 1 - every tick, 2 - every other tick, 3 - every third tick etc...</param>
        /// <param name="max">The maximum number of dynamic updates that can be written each tick.</param>
        [HideFromIl2Cpp]
        public static void Configure<T>(int tickRate = 1, int max = int.MaxValue) where T : ReplayDynamic => SnapshotManager.GetInstance().Configure<T>(tickRate, max);

        /// <summary>
        /// Triggers an event to be written next tick.
        /// </summary>
        /// <param name="e"></param>
        /// <returns>True if the event was succesfully triggered, otherwise false.</returns>
        [HideFromIl2Cpp]
        public static bool Trigger(ReplayEvent e) => SnapshotManager.GetInstance().Trigger(e);

        /// <summary>
        /// Triggers a header to be written.
        /// </summary>
        /// <param name="header"></param>
        [HideFromIl2Cpp]
        public static void Trigger(ReplayHeader header) => SnapshotManager.GetInstance().Trigger(header);

        /// <summary>
        /// Checks if the provided dynamic is already being tracked.
        /// </summary>
        /// <param name="dynamic"></param>
        /// <returns></returns>
        [HideFromIl2Cpp]
        public static bool Has(ReplayDynamic dynamic) => SnapshotManager.GetInstance().Has(dynamic);

        /// <summary>
        /// Checks if the provided dynamic is already being tracked.
        /// </summary>
        /// <typeparam name="T">Type of dynamic.</typeparam>
        /// <param name="id">id of dynamic to check.</param>
        /// <returns></returns>
        [HideFromIl2Cpp]
        public static bool Has<T>(int id) where T : ReplayDynamic => SnapshotManager.GetInstance().Has(typeof(T), id);

        /// <summary>
        /// Gets a tracked dynamic by id.
        /// </summary>
        /// <typeparam name="T">Type of dynamic.</typeparam>
        /// <param name="id">id of dynamic to get.</param>
        /// <returns></returns>
        [HideFromIl2Cpp]
        public static T Get<T>(int id) where T : ReplayDynamic => (T)SnapshotManager.GetInstance().Get(typeof(T), id);

        /// <summary>
        /// Attempts to get a tracked dynamic by id.
        /// </summary>
        /// <typeparam name="T">Type of dynamic.</typeparam>
        /// <param name="id">id of dynamic to get.</param>
        /// <param name="dynamic">dynamic found.</param>
        /// <returns>True if the dynamic exists and was obtained, otherwise False.</returns>
        [HideFromIl2Cpp]
        public static bool TryGet<T>(int id, [NotNullWhen(true)] out T dynamic) where T : ReplayDynamic {
            if (Has<T>(id)) {
                dynamic = Get<T>(id);
                return true;
            }
            dynamic = null!;
            return false;
        }

        /// <summary>
        /// Triggers despawn events for all dynamics in the given collection.
        /// </summary>
        /// 
        [HideFromIl2Cpp]
        public static void Clear<T>() where T : ReplayDynamic => SnapshotManager.GetInstance().Clear(typeof(T));

        /// <summary>
        /// Triggers a spawn event for a given dynamic, and begins tracking it.
        /// </summary>
        /// <param name="dynamic">Dynamic to spawn and track.</param>
        /// <param name="errorOnDuplicate">If True, an exception will be raised when spawning the same dynamic twice. Otherwise, silently discard.</param>
        [HideFromIl2Cpp]
        public static void Spawn(ReplayDynamic dynamic, bool errorOnDuplicate = true) => SnapshotManager.GetInstance().Spawn(dynamic, errorOnDuplicate);

        /// <summary>
        /// Triggers a despawn event for a given dynamic, and stops tracking it.
        /// </summary>
        /// <param name="dynamic">Dynamic to despawn and no longer track.</param>
        /// <param name="errorOnNotFound">If True, an exception will be raised when despawning a non-existant dynamic. Otherwise, silently discard.</param>
        [HideFromIl2Cpp]
        public static void Despawn(ReplayDynamic dynamic, bool errorOnNotFound = true) => SnapshotManager.GetInstance().Despawn(dynamic, errorOnNotFound);

        /// <summary>
        /// Tries to despawn a dynamic.
        /// </summary>
        /// <typeparam name="T">Type of dynamic.</typeparam>
        /// <param name="id">id of dynamic.</param>
        /// <returns>True if the dynamic existed and was despawned, otherwise false.</returns>
        [HideFromIl2Cpp]
        public static bool TryDespawn<T>(int id) where T : ReplayDynamic {
            if (Has<T>(id)) {
                Despawn(Get<T>(id));
                return true;
            }
            return false;
        }

        /// <summary>
        /// The current tick rate that snapshots are taken at.
        /// </summary>
        public static float tickRate => SnapshotManager.GetInstance().tickRate;

        /// <summary>
        /// If True, the replay header has completed being written, and snapshots will now be taken every tick.
        /// </summary>
        public static bool Ready => SnapshotManager.Ready;

        /// <summary>
        /// If True, the replay recorder is running and data is being written.
        /// </summary>
        public static bool Active => SnapshotManager.Active;

        /// <summary>
        /// Triggered on expedition end.
        /// 
        /// Synonymous to attribute [ReplayOnExpeditionEnd].
        /// </summary>
        public static Action? OnExpeditionEnd;

        /// <summary>
        /// Triggered on expedition start. 
        /// 
        /// Synonymous to attribute [ReplayInit].
        /// </summary>
        public static Action? OnExpeditionStart;

        /// <summary>
        /// Triggered when elevator ride begins to end. Not when gameplay necessarily starts. 
        /// 
        /// Synonymous to attribute [ReplayOnElevatorStop].
        /// </summary>
        public static Action? OnElevatorStop;

        /// <summary>
        /// Triggered when players are dropped from elevator and gameplay begins. 
        /// 
        /// Synonymous to attribute [ReplayOnGameplayStart].
        /// </summary>
        public static Action? OnGameplayStart;

        /// <summary>
        /// Triggered when all headers have been written to the replay file. 
        /// 
        /// Synonymous to attribute [ReplayOnHeaderCompletion].
        /// </summary>
        public static Action? OnHeaderCompletion;

        /// <summary>
        /// Trigged each snapshot tick prior any data writes. 
        /// 
        /// Synonymous to attribute [ReplayTick].
        /// </summary>
        public static Action? OnTick;

        /// <summary>
        /// Actions that trigger when a given event is triggered. 
        /// 
        /// Synonymous to attribute [ReplayEventHook].
        /// </summary>
        public static Dictionary<Type, Action<long, ReplayEvent>?> EventHooks = new Dictionary<Type, Action<long, ReplayEvent>?>();

        /// <summary>
        /// Actions that trigger for a given dynamic on spawn. 
        /// 
        /// Synonymous to attribute [ReplayDynamicHook].
        /// </summary>
        public static Dictionary<Type, Action<long, ReplayDynamic>?> SpawnHooks = new Dictionary<Type, Action<long, ReplayDynamic>?>();

        /// <summary>
        /// Actions that trigger for a given dynamic on despawn. 
        /// 
        /// Synonymous to attribute [ReplayDynamicHook].
        /// </summary>
        public static Dictionary<Type, Action<long, ReplayDynamic>?> DespawnHooks = new Dictionary<Type, Action<long, ReplayDynamic>?>();

        /// <summary>
        /// Actions that trigger for a given dynamic each tick. 
        /// 
        /// Synonymous to attribute [ReplayDynamicHook].
        /// </summary>
        public static Dictionary<Type, Action<long, ReplayDynamic>?> DynamicHooks = new Dictionary<Type, Action<long, ReplayDynamic>?>();

        /// <summary>
        /// Actions that trigger for a given dynamic whenever it is dirty. 
        /// 
        /// Synonymous to attribute [ReplayDynamicHook].
        /// </summary>
        public static Dictionary<Type, Action<long, ReplayDynamic>?> DirtyDynamicHooks = new Dictionary<Type, Action<long, ReplayDynamic>?>();
    }
}
