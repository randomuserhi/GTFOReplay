using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.StaticItems {
    internal class rDisinfectStation {
        public LG_DisinfectionStation core;

        public int id;
        public Vector3 position => core.transform.position;
        public Quaternion rotation => core.transform.rotation;
        public byte dimensionIndex => (byte)core.SpawnNode.m_dimension.DimensionIndex;
        public ushort serialNumber => (ushort)core.m_serialNumber;

        public rDisinfectStation(LG_DisinfectionStation disinfectStation) {
            id = disinfectStation.GetInstanceID();
            core = disinfectStation;
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.Map.DisinfectStations", "0.0.1")]
    internal class rDisinfectStations : ReplayHeader {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(LG_DisinfectionStation), nameof(LG_DisinfectionStation.Setup))]
            [HarmonyPostfix]
            private static void Setup(LG_DisinfectionStation __instance) {
                rDisinfectStation station = new rDisinfectStation(__instance);
                disinfectStations.Add(station.id, station);
            }
        }

        [ReplayOnElevatorStop]
        private static void Trigger() {
            Replay.Trigger(new rDisinfectStations());
            disinfectStations.Clear();
        }

        [ReplayInit]
        private static void Init() {
            disinfectStations.Clear();
        }

        internal static Dictionary<int, rDisinfectStation> disinfectStations = new Dictionary<int, rDisinfectStation>();

        public override void Write(ByteBuffer buffer) {
            // TODO(randomuserhi): Throw error on too many containers
            BitHelper.WriteBytes((ushort)disinfectStations.Count, buffer);

            foreach (rDisinfectStation station in disinfectStations.Values) {
                BitHelper.WriteBytes(station.id, buffer);
                BitHelper.WriteBytes(station.dimensionIndex, buffer);
                BitHelper.WriteBytes(station.position, buffer);
                BitHelper.WriteHalf(station.rotation, buffer);
                BitHelper.WriteBytes(station.serialNumber, buffer);
            }
        }
    }
}
