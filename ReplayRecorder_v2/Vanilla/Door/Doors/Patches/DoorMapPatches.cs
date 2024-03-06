using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;

namespace Vanilla.Map.Doors.Patches {
    [HarmonyPatch]
    internal class DoorMapPatches {
        [HarmonyPatch(typeof(LG_WeakDoor), nameof(LG_WeakDoor.Setup))]
        [HarmonyPostfix]
        private static void WeakDoor_Setup(LG_WeakDoor __instance, LG_Gate gate) {
            DoorReplayManager.doors.Add(new rDoor(rDoor.Type.WeakDoor, gate, __instance, __instance.m_serialNumber, __instance.IsCheckpointDoor));
            DoorReplayManager.weakDoors.Add(new rWeakDoor(__instance));
        }

        [HarmonyPatch(typeof(LG_SecurityDoor), nameof(LG_SecurityDoor.Setup))]
        [HarmonyPostfix]
        private static void SecurityDoor_Setup(LG_SecurityDoor __instance, LG_Gate gate) {
            DoorReplayManager.doors.Add(new rDoor(rDoor.Type.SecurityDoor, gate, __instance, __instance.m_serialNumber, __instance.IsCheckpointDoor));
        }

        // Write map data once all loaded (elevator ride stops when level is finished loading)
        [HarmonyPatch(typeof(GS_ReadyToStopElevatorRide), nameof(GS_ReadyToStopElevatorRide.Enter))]
        [HarmonyPostfix]
        private static void StopElevatorRide() {
            Replay.Trigger(new rDoors(DoorReplayManager.doors));
        }
    }
}
