using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;

namespace Vanilla.Map.Doors.Patches {
    [HarmonyPatch]
    internal class Status {
        [HarmonyPatch(typeof(LG_WeakDoor), nameof(LG_WeakDoor.OnSyncDoorStateChange))]
        [HarmonyPrefix]
        private static void Weak_DoorStateChange(LG_WeakDoor __instance, pDoorState state) {
            if (DoorReplayManager.doorStatus(__instance.LastStatus) != DoorReplayManager.doorStatus(state.status))
                Replay.Trigger(new rDoorStatusChange(__instance.GetInstanceID(), state.status));
        }

        [HarmonyPatch(typeof(LG_SecurityDoor), nameof(LG_SecurityDoor.OnSyncDoorStatusChange))]
        [HarmonyPrefix]
        private static void Security_DoorStateChange(LG_SecurityDoor __instance, pDoorState state) {
            if (DoorReplayManager.doorStatus(__instance.LastStatus) != DoorReplayManager.doorStatus(state.status))
                Replay.Trigger(new rDoorStatusChange(__instance.GetInstanceID(), state.status));
        }
    }
}
