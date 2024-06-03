using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;

namespace Vanilla.Map.Doors {
    internal class rDoor {
        public enum Type {
            WeakDoor,
            SecurityDoor,
            BulkheadDoor,
            BulkheadDoorMain,
            ApexDoor
        }

        private int id;
        private LG_Gate gate;
        private MonoBehaviourExtended mono;
        private ushort serialNumber;
        private bool isCheckpoint;

        private Type type;
        private byte size;

        public rDoor(Type type, LG_Gate gate, MonoBehaviourExtended mono, int serialNumber, bool isCheckpoint = false) {
            id = gate.GetInstanceID();
            this.gate = gate;
            this.mono = mono;
            this.serialNumber = (ushort)serialNumber;
            this.type = type;
            this.isCheckpoint = isCheckpoint;

            if (this.type == Type.SecurityDoor) {
                if (gate.ForceApexGate)
                    this.type = Type.ApexDoor;
                else if (gate.ForceBulkheadGate)
                    this.type = Type.BulkheadDoor;
                else if (gate.ForceBulkheadGateMainPath)
                    this.type = Type.BulkheadDoorMain;
            }

            switch (gate.Type) {
            case LG_GateType.Medium: size = 1; break;
            case LG_GateType.Large: size = 2; break;
            default: size = 0; break;
            }
        }

        public void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(id, buffer);

            BitHelper.WriteBytes((byte)gate.m_progressionSourceArea.m_courseNode.m_dimension.DimensionIndex, buffer);
            BitHelper.WriteBytes(mono.transform.position, buffer);
            BitHelper.WriteHalf(mono.transform.rotation, buffer);

            BitHelper.WriteBytes(serialNumber, buffer);
            BitHelper.WriteBytes(isCheckpoint, buffer);
            BitHelper.WriteBytes((byte)type, buffer);
            BitHelper.WriteBytes(size, buffer);
        }
    }

    [ReplayData("Vanilla.Map.Doors", "0.0.1")]
    internal class rDoors : ReplayHeader {
        List<rDoor> doors;

        public rDoors(List<rDoor> doors) {
            this.doors = doors;
        }

        public override void Write(ByteBuffer buffer) {
            if (doors.Count > ushort.MaxValue) throw new TooManyDoors($"There were too many doors! {doors.Count} doors were found.");
            BitHelper.WriteBytes((ushort)doors.Count, buffer);
            foreach (rDoor door in doors) {
                door.Write(buffer);
            }
        }
    }

    public class NoDoorDestructionComp : Exception {
        public NoDoorDestructionComp(string message) : base(message) { }
    }

    public class TooManyDoors : Exception {
        public TooManyDoors(string message) : base(message) { }
    }

    internal static class DoorReplayManager {
        internal static List<rDoor> doors = new List<rDoor>();
        internal static List<rWeakDoor> weakDoors = new List<rWeakDoor>();

        [ReplayInit]
        private static void Init() {
            doors.Clear();
            weakDoors.Clear();
        }

        [ReplayOnHeaderCompletion]
        private static void WriteWeakDoors() {
            foreach (rWeakDoor weakDoor in weakDoors) {
                Replay.Spawn(weakDoor);
            }
        }

        public static byte doorStatus(eDoorStatus status) {
            switch (status) {
            case eDoorStatus.Open:
                return 1;
            case eDoorStatus.GluedMax:
                return 2;
            case eDoorStatus.Destroyed:
                return 3;
            default:
                return 0;
            }
        }
    }

    [ReplayData("Vanilla.Map.DoorStatusChange", "0.0.1")]
    internal class rDoorStatusChange : Id {
        private byte status;

        public rDoorStatusChange(int id, eDoorStatus status) : base(id) {
            this.status = DoorReplayManager.doorStatus(status);
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes(status, buffer);
        }
    }
}
