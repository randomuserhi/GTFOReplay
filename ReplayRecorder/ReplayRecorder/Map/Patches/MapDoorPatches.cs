using API;
using HarmonyLib;

using LevelGeneration;

namespace ReplayRecorder.Map.Patches {
    [HarmonyPatch]
    class MapDoorPatches {
        // Maps Unity InstanceID to rDoor
        public static Dictionary<int, Map.rDoor> doors = new Dictionary<int, Map.rDoor>();

        public static void Reset() {
            doors.Clear();
        }

        private static void AddDoorToMap(Map.rDoor door, LG_Gate gate) {
            APILogger.Debug("Added door.");
            Map.doors.Add(door);
        }

        [HarmonyPatch(typeof(LG_WeakDoor), nameof(LG_WeakDoor.OnSyncDoorStateChange))]
        [HarmonyPostfix]
        private static void Weak_DoorStateChange(LG_WeakDoor __instance, pDoorState state) {
            int instanceID = __instance.gameObject.GetInstanceID();
            if (!doors.ContainsKey(instanceID)) {
                APILogger.Error("Door does not exist in map data, this should not happen.");
                return;
            }
            Map.OnDoorStateChange(doors[instanceID], state.status);
        }

        [HarmonyPatch(typeof(LG_SecurityDoor), nameof(LG_SecurityDoor.OnSyncDoorStatusChange))]
        [HarmonyPostfix]
        private static void Security_DoorStateChange(LG_SecurityDoor __instance, pDoorState state) {
            int instanceID = __instance.gameObject.GetInstanceID();
            if (!doors.ContainsKey(instanceID)) {
                APILogger.Error("Door does not exist in map data, this should not happen.");
                return;
            }
            Map.OnDoorStateChange(doors[instanceID], state.status);
        }

        [HarmonyPatch(typeof(LG_WeakDoor), nameof(LG_WeakDoor.OnSyncDoorGotDamage))]
        [HarmonyPostfix]
        private static void DoorGotDamage(LG_WeakDoor __instance) {
            int instanceID = __instance.gameObject.GetInstanceID();
            if (!doors.ContainsKey(instanceID)) {
                APILogger.Error("Door does not exist in map data, this should not happen.");
                return;
            }
            Map.OnDoorDamage(doors[instanceID]);
        }

        [HarmonyPatch(typeof(LG_WeakDoor), nameof(LG_WeakDoor.Setup))]
        [HarmonyPostfix]
        private static void WeakDoor_Setup(LG_WeakDoor __instance, LG_Gate gate) {
            int instanceID = __instance.gameObject.GetInstanceID();

            Map.rDoor door = new Map.rDoor(__instance.m_healthMax, Map.rDoor.Type.WeakDoor, gate, __instance.gameObject);

            doors.Add(instanceID, door);
            AddDoorToMap(door, gate);
        }

        [HarmonyPatch(typeof(LG_SecurityDoor), nameof(LG_SecurityDoor.Setup))]
        [HarmonyPostfix]
        private static void SecurityDoor_Setup(LG_SecurityDoor __instance, LG_Gate gate) {
            int instanceID = __instance.gameObject.GetInstanceID();

            Map.rDoor.Type type = Map.rDoor.Type.SecurityDoor;
            if (gate.ForceApexGate)
                type = Map.rDoor.Type.ApexDoor;
            else if (gate.ForceBulkheadGate)
                type = Map.rDoor.Type.BulkheadDoor;
            else if (gate.ForceBulkheadGateMainPath)
                type = Map.rDoor.Type.BulkheadDoorMain;
            Map.rDoor door = new Map.rDoor(0, type, gate, __instance.gameObject);

            doors.Add(instanceID, door);
            AddDoorToMap(door, gate);
        }
    }
}
