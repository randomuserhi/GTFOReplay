using UnityEngine;

using LevelGeneration;
using API;

namespace ReplayRecorder.Map
{
    public static partial class Map
    {
        public class rDoor
        {
            public enum Type
            {
                WeakDoor,
                SecurityDoor,
                BulkheadDoor,
                BulkheadDoorMain,
                ApexDoor
            }

            public Type type;
            public LG_GateType size;
            public float healthMax;

            public Vector3 position;
            public Quaternion rotation;

            public bool isCheckpoint;

            public rMap.Location to;
            public rMap.Location from;

            public LG_Gate gate;

            public rDoor(float healthMax, Type type, LG_Gate gate)
            {
                if (gate.Type != LG_GateType.Small && 
                    gate.Type != LG_GateType.Medium &&
                    gate.Type != LG_GateType.Large)
                {
                    APILogger.Warn($"Weird gate type was created as a door: {gate.Type}");
                }

                this.gate = gate;

                this.healthMax = healthMax;
                position = gate.transform.position;
                rotation = gate.transform.rotation;

                size = gate.Type;
                this.type = type;

                // m_gate.m_linksTo.m_zone.m_settings.m_zoneData.IsCheckpointDoor;
                isCheckpoint = gate.IsCheckpointDoor;
            }
        }

        public static Dictionary<eDimensionIndex, List<rDoor>> doors = new Dictionary<eDimensionIndex, List<rDoor>>();
    }
}
