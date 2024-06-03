using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.Map.BulkheadController {
    internal class rBulkheadController {
        public LG_BulkheadDoorController_Core core;

        public int id;
        public Vector3 position => core.transform.position;
        public Quaternion rotation => core.transform.rotation;
        public byte dimensionIndex => (byte)core.SpawnNode.m_dimension.DimensionIndex;

        public rBulkheadController(LG_BulkheadDoorController_Core controller) {
            id = controller.GetInstanceID();
            core = controller;
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.Map.BulkheadControllers", "0.0.1")]
    internal class rBulkheadControllers : ReplayHeader {
        [HarmonyPatch]
        private class Patches {
            [HarmonyPatch(typeof(LG_BulkheadDoorController_Core), nameof(LG_BulkheadDoorController_Core.Setup))]
            [HarmonyPostfix]
            private static void Setup(LG_BulkheadDoorController_Core __instance) {
                rBulkheadController controller = new rBulkheadController(__instance);
                bulkheadControllers.Add(controller.id, controller);
            }
        }

        [ReplayOnElevatorStop]
        private static void Trigger() {
            Replay.Trigger(new rBulkheadControllers());
            bulkheadControllers.Clear();
        }

        [ReplayInit]
        private static void Init() {
            bulkheadControllers.Clear();
        }

        internal static Dictionary<int, rBulkheadController> bulkheadControllers = new Dictionary<int, rBulkheadController>();

        private static LG_LayerType[] layers = new LG_LayerType[] {
            LG_LayerType.MainLayer,
            LG_LayerType.SecondaryLayer,
            LG_LayerType.ThirdLayer
        };
        public override void Write(ByteBuffer buffer) {
            // TODO(randomuserhi): Throw error on too many containers
            BitHelper.WriteBytes((ushort)bulkheadControllers.Count, buffer);

            foreach (rBulkheadController controllers in bulkheadControllers.Values) {
                BitHelper.WriteBytes(controllers.id, buffer);
                BitHelper.WriteBytes(controllers.dimensionIndex, buffer);
                BitHelper.WriteBytes(controllers.position, buffer);
                BitHelper.WriteHalf(controllers.rotation, buffer);

                var connectedDoors = controllers.core.m_connectedBulkheadDoors;
                foreach (LG_LayerType layerType in layers) {
                    if (connectedDoors.ContainsKey(layerType)) {
                        BitHelper.WriteBytes(true, buffer);
                        BitHelper.WriteBytes(connectedDoors[layerType].Gate.GetInstanceID(), buffer);
                    } else {
                        BitHelper.WriteBytes(false, buffer);
                    }
                }
            }
        }
    }
}
