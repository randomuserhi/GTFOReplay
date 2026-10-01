using API;
using HarmonyLib;
using Il2CppInterop.Runtime.Attributes;
using Player;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using ReplayRecorder.Exceptions;
using ReplayRecorder.Snapshot;
using System.Diagnostics;
using System.Linq.Expressions;
using System.Reflection;

namespace ReplayRecorder {
    public static partial class Replay {
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
                m.GetCustomAttribute<ReplayDespawnHook>() != null ||
                m.GetCustomAttribute<ReplayOnPlayerSpawn>() != null ||
                m.GetCustomAttribute<ReplayOnPlayerDespawn>() != null ||
                m.GetCustomAttribute<ReplayPluginLoad>() != null ||
                m.GetCustomAttribute<ReplayOnStartRecording>() != null)
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
                        } else if (method.GetCustomAttribute<ReplayOnPlayerSpawn>() != null) {
                            type = nameof(ReplayOnPlayerSpawn);
                            ReplayPlayerManager.OnPlayerSpawn += (Action<PlayerAgent>)CreateCompatibleDelegate(method, typeof(Action<PlayerAgent>));
                        } else if (method.GetCustomAttribute<ReplayOnPlayerDespawn>() != null) {
                            type = nameof(ReplayOnPlayerDespawn);
                            ReplayPlayerManager.OnPlayerDespawn += (Action<int>)CreateCompatibleDelegate(method, typeof(Action<int>));
                        } else if (method.GetCustomAttribute<ReplayPluginLoad>() != null) {
                            type = nameof(ReplayPluginLoad);
                            OnPluginLoad += (Action)method.CreateDelegate(typeof(Action));
                        } else if (method.GetCustomAttribute<ReplayOnStartRecording>() != null) {
                            type = nameof(ReplayOnStartRecording);
                            OnStartRecording += (Action<string>)method.CreateDelegate(typeof(Action<string>));
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
            Assembly? assembly = new StackTrace()?.GetFrame(1)?.GetMethod()?.ReflectedType?.Assembly;
            if (assembly == null) throw new Exception("Unable to find assembly.");

            AccessTools.GetTypesFromAssembly(assembly).Do(delegate (Type t) {
                if (t.GetCustomAttribute<ReplayData>() != null) {
                    RegisterType(t);
                }
                RegisterMethods(t);
            });
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
        /// Trigged once when the game loads (Same as when a created monobehaviour's Start function would run). 
        /// 
        /// Synonymous to attribute [ReplayPluginLoad].
        /// </summary>
        public static Action? OnPluginLoad;

        /// <summary>
        /// Triggered once after a recording file and its session have been initialized,
        /// before headers are complete. Receives the recording file path.
        /// Synonymous with attribute [ReplayOnStartRecording].
        /// </summary>
        public static Action<string>? OnStartRecording;

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
