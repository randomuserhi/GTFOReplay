using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;

namespace Vanilla.Map.Doors.Patches {
    [HarmonyPatch]
    internal class DoorStatusPatches {
        [HarmonyPatch(typeof(LG_WeakDoor), nameof(LG_WeakDoor.OnSyncDoorStateChange))]
        [HarmonyPostfix]
        private static void Weak_DoorStateChange(LG_WeakDoor __instance, pDoorState state) {
            Replay.Trigger(new rDoorStatusChange(__instance.GetInstanceID(), state.status));
        }

        [HarmonyPatch(typeof(LG_SecurityDoor), nameof(LG_SecurityDoor.OnSyncDoorStatusChange))]
        [HarmonyPostfix]
        private static void Security_DoorStateChange(LG_SecurityDoor __instance, pDoorState state) {
            Replay.Trigger(new rDoorStatusChange(__instance.GetInstanceID(), state.status));
        }
    }
}
