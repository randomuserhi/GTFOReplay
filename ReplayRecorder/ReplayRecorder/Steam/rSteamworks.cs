extern alias GTFO;

using API;
using HarmonyLib;
using ReplayRecorder.BepInEx;
using SNetwork;
using Steamworks;
using System.Collections.Concurrent;

namespace ReplayRecorder {
    public class ConcurrentHashSet<T> : ConcurrentDictionary<T, byte>
    where T : notnull {
        const byte DummyByte = byte.MinValue;

        public bool Contains(T item) => ContainsKey(item);
        public bool Add(T item) => TryAdd(item, DummyByte);
        public bool Remove(T item) => TryRemove(item, out _);
    }
}

namespace ReplayRecorder.Steam {
    [HarmonyPatch]
    internal static class rSteamworks {
        public delegate void OnInit();
        public delegate void OnDispose();

        public static OnInit? onInit = null;
        public static OnDispose? onDispose = null;

        private static bool initialized = false;
        [HarmonyPatch(typeof(SteamManager), nameof(SteamManager.PostSetup))]
        [HarmonyPrefix]
        private static void Prefix_Setup() {
            SteamPacketIO.Guard("Steam setup", Setup);
        }
        private static void Setup() {
            if (ConfigManager.DisableSteamAPI) return;
            if (initialized) return;

            if (!SteamAPI.Init()) {
                APILogger.Error("Failed to start SteamAPI.");
                return;
            }
            if (!GameServer.Init(0x7f000001, 0, 0, EServerMode.eServerModeNoAuthentication, "0.0.0.1")) {
                APILogger.Error("Failed to start GameServer");
                SteamAPI.Shutdown();
                return;
            }
            initialized = true;
            SteamNetworkingUtils.InitRelayNetworkAccess();

            /*SteamNetworkingUtils.SetDebugOutputFunction(ESteamNetworkingSocketsDebugOutputType.k_ESteamNetworkingSocketsDebugOutputType_Everything, (type, message) => {
                APILogger.Debug($"[STEAMWORKS] {type}: {message}");
            });*/

            /*unsafe {
                int bufferSize = 10 * 1024 * 1024;
                int* bufferSize_ptr = &bufferSize;
                if (!SteamNetworkingUtils.SetConfigValue(ESteamNetworkingConfigValue.k_ESteamNetworkingConfig_SendBufferSize, ESteamNetworkingConfigScope.k_ESteamNetworkingConfig_Global, IntPtr.Zero, ESteamNetworkingConfigDataType.k_ESteamNetworkingConfig_Int32, (IntPtr)bufferSize_ptr)) {
                    APILogger.Warn("Failed to increase SendBufferSize!");
                }
            }*/

            APILogger.Debug("Initialized Steamworks!");

            if (onInit != null) foreach (OnInit handler in onInit.GetInvocationList()) SteamPacketIO.Guard($"Steam init/{handler.Method.Name}", () => handler());
        }

        [HarmonyPatch(typeof(SteamManager), nameof(SteamManager.Update))]
        [HarmonyPrefix]
        private static void Prefix_Update() {
            if (ConfigManager.DisableSteamAPI || !initialized) return;
            try {
                SteamAPI.RunCallbacks();
                SteamNetworkingSockets.RunCallbacks();
            } catch (Exception error) {
                SteamPacketIO.Report("Steam update", error);
                Postfix_OnQuit();
            }
        }

        [HarmonyPatch(typeof(SNet_Core_STEAM), nameof(SNet_Core_STEAM.OnQuit))]
        [HarmonyPostfix]
        private static void Postfix_OnQuit() {
            if (!initialized) return;
            initialized = false;

            if (onDispose != null) foreach (OnDispose handler in onDispose.GetInvocationList()) SteamPacketIO.Guard($"Steam dispose/{handler.Method.Name}", () => handler());

            SteamPacketIO.Guard("Steam shutdown", SteamAPI.Shutdown);
            SteamPacketIO.Guard("Steam server shutdown", GameServer.Shutdown);

            APILogger.Debug("Shutdown Steamworks!");
        }
    }
}
