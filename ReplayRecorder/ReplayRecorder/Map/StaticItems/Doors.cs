using UnityEngine;

using LevelGeneration;
using API;

namespace ReplayRecorder.Map
{
    public static partial class Map
    {
        public class rDoor : ISerializable
        {
            public static byte _id = 0;

            public enum Type
            {
                WeakDoor,
                SecurityDoor,
                BulkheadDoor,
                BulkheadDoorMain,
                ApexDoor
            }

            public Type type;

            public byte id = 0;

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

                id = _id++;

                this.gate = gate;

                this.healthMax = healthMax;
                position = gate.transform.position;
                rotation = gate.transform.rotation;

                size = gate.Type;
                this.type = type;

                // m_gate.m_linksTo.m_zone.m_settings.m_zoneData.IsCheckpointDoor;
                isCheckpoint = gate.IsCheckpointDoor;
            }

            public const int SizeOf = 4 + BitHelper.SizeOfVector3 + BitHelper.SizeOfHalfQuaternion;
            private static byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs)
            {
                /// Format:
                /// byte => type
                /// byte => size
                /// byte => healthMax
                /// position
                /// rotation
                
                int index = 0;
                BitHelper.WriteBytes(id, buffer, ref index);
                BitHelper.WriteBytes((byte)type, buffer, ref index);
                BitHelper.WriteBytes((byte)size, buffer, ref index);
                BitHelper.WriteBytes((byte)healthMax, buffer, ref index);

                BitHelper.WriteBytes(position, buffer, ref index);
                BitHelper.WriteHalf(rotation, buffer, ref index);

                fs.Write(buffer);
            }
        }

        public struct rDoorID : ISerializable
        {
            public byte id;

            public rDoorID(rDoor door)
            {
                id = door.id;
            }

            public void Serialize(FileStream fs)
            {
                fs.WriteByte(id);
            }
        }

        public static Dictionary<eDimensionIndex, List<rDoor>> doors = new Dictionary<eDimensionIndex, List<rDoor>>();

        public struct rDoorState : ISerializable
        {
            public byte id;
            public byte state;

            public rDoorState(rDoor door, eDoorStatus state)
            {
                id = door.id;
                switch (state)
                {
                    case eDoorStatus.Open:
                        this.state = 1;
                        break;
                    case eDoorStatus.GluedMax:
                        this.state = 2;
                        break;
                    case eDoorStatus.Destroyed:
                        this.state = 3;
                        break;
                    default:
                        this.state = 0;
                        break;
                }
            }

            public void Serialize(FileStream fs)
            {
                fs.WriteByte(id); 
                fs.WriteByte(state);
            }
        }

        public static void OnDoorStateChange(rDoor door, eDoorStatus state)
        {
            SnapshotManager.AddEvent(GameplayEvent.Type.DoorChangeState, new rDoorState(door, state));
        }

        public static void OnDoorDamage(rDoor door)
        {
            SnapshotManager.AddEvent(GameplayEvent.Type.DoorDamage, new rDoorID(door));
        }
    }
}
