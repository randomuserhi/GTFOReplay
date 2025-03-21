﻿using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using SNetwork;

namespace Vanilla.StaticItems {
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

        public rDoor(Type type, LG_Door_Sync sync, LG_Gate gate, MonoBehaviourExtended mono, int serialNumber, bool isCheckpoint = false) {
            id = sync.m_stateReplicator.Replicator.Key;
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

    [HarmonyPatch]
    [ReplayData("Vanilla.Map.DoorStatusChange", "0.0.1")]
    internal class rDoorStatusChange : Id {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(LG_WeakDoor), nameof(LG_WeakDoor.OnSyncDoorStateChange))]
            [HarmonyPrefix]
            private static void Weak_DoorStateChange(LG_WeakDoor __instance, pDoorState state) {
                if (DoorReplayManager.doorStatus(__instance.LastStatus) != DoorReplayManager.doorStatus(state.status))
                    Replay.Trigger(new rDoorStatusChange(__instance.m_sync.Cast<LG_Door_Sync>().m_stateReplicator.Replicator.Key, state.status));
            }

            [HarmonyPatch(typeof(LG_SecurityDoor), nameof(LG_SecurityDoor.OnSyncDoorStatusChange))]
            [HarmonyPrefix]
            private static void Security_DoorStateChange(LG_SecurityDoor __instance, pDoorState state) {
                if (DoorReplayManager.doorStatus(__instance.LastStatus) != DoorReplayManager.doorStatus(state.status))
                    Replay.Trigger(new rDoorStatusChange(__instance.m_sync.Cast<LG_Door_Sync>().m_stateReplicator.Replicator.Key, state.status));
            }
        }

        private byte status;

        public rDoorStatusChange(int id, eDoorStatus status) : base(id) {
            this.status = DoorReplayManager.doorStatus(status);
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes(status, buffer);
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.Map.WeakDoor.Punch", "0.0.1")]
    internal class rDoorPunch : Id {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(LG_WeakDoor_Destruction), nameof(LG_WeakDoor_Destruction.TriggerPunchEffect))]
            [HarmonyPostfix]
            private static void WeakDoor_Punch(LG_WeakDoor_Destruction __instance) {
                LG_WeakDoor? weakDoor = __instance.m_core.TryCast<LG_WeakDoor>();
                if (weakDoor == null) return;
                Replay.Trigger(new rDoorPunch(weakDoor.m_sync.Cast<LG_Door_Sync>().m_stateReplicator.Replicator.Key));
            }
        }

        public rDoorPunch(int id) : base(id) {
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.Map.WeakDoor", "0.0.1")]
    internal class rWeakDoor : ReplayDynamic {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(LG_WeakDoor), nameof(LG_WeakDoor.Setup))]
            [HarmonyPostfix]
            private static void WeakDoor_Setup(LG_WeakDoor __instance, LG_Gate gate) {
                DoorReplayManager.doors.Add(new rDoor(rDoor.Type.WeakDoor, __instance.m_sync.Cast<LG_Door_Sync>()!, gate, __instance, __instance.m_serialNumber, __instance.IsCheckpointDoor));
                DoorReplayManager.weakDoors.Add(new rWeakDoor(__instance));
            }

            [HarmonyPatch(typeof(LG_SecurityDoor), nameof(LG_SecurityDoor.Setup))]
            [HarmonyPostfix]
            private static void SecurityDoor_Setup(LG_SecurityDoor __instance, LG_Gate gate) {
                DoorReplayManager.doors.Add(new rDoor(rDoor.Type.SecurityDoor, __instance.m_sync.Cast<LG_Door_Sync>()!, gate, __instance, __instance.m_serialNumber, __instance.IsCheckpointDoor));
            }

            // Write map data once all loaded (elevator ride stops when level is finished loading)
            [HarmonyPatch(typeof(GS_ReadyToStopElevatorRide), nameof(GS_ReadyToStopElevatorRide.Enter))]
            [HarmonyPostfix]
            private static void StopElevatorRide() {
                Replay.Trigger(new rDoors(DoorReplayManager.doors));
            }
        }

        private enum LockType {
            None,
            Melee,
            Hackable
        }

        private LG_WeakDoor door;
        private LG_WeakDoor_Destruction destruction;

        public override string? Debug => $"{id} - {destruction.m_health}/{door.m_healthMax}";

        public override bool Active => door != null;
        public override bool IsDirty => health != prevHealth || _lock0 != lock0 || _lock1 != lock1;

        private float damageTaken = 0;
        private byte _health = byte.MaxValue;
        private byte health {
            get {
                if (SNet.IsMaster) {
                    return (byte)(byte.MaxValue * destruction.m_health / door.m_healthMax);
                } else {
                    return _health;
                }
            }
        }
        private byte prevHealth = byte.MaxValue;

        private LockType GetLockType(int slot) {
            if (door.m_weakLocks == null || slot < 0 || slot >= door.m_weakLocks.Length) {
                return LockType.None;
            }

            LG_WeakLock weakLock = door.m_weakLocks[slot];

            LockType type = LockType.None;
            if (weakLock != null) {
                bool isLocked = weakLock.m_stateReplicator.State.status != eWeakLockStatus.Unlocked && weakLock.m_stateReplicator.State.status != eWeakLockStatus.LockMelterApplied;
                if (isLocked) {
                    switch (weakLock.m_lockType) {
                    case eWeakLockType.Melee:
                        type = LockType.Melee;
                        break;
                    case eWeakLockType.Hackable:
                        type = LockType.Hackable;
                        break;
                    }
                }
            }
            return type;
        }

        // NOTE(randomuserhi): Only assume doors have 2 locks
        private byte lock0 => (byte)GetLockType(0);
        private byte _lock0 = (byte)LockType.None;
        private byte lock1 => (byte)GetLockType(1);
        private byte _lock1 = (byte)LockType.None;

        public rWeakDoor(LG_WeakDoor door) : base(door.m_sync.Cast<LG_Door_Sync>().m_stateReplicator.Replicator.Key) {
            this.door = door;
            damageTaken = door.m_healthMax;

            LG_WeakDoor_Destruction? _d = door.m_destruction.TryCast<LG_WeakDoor_Destruction>();
            if (_d == null) throw new NoDoorDestructionComp($"Failed to get 'LG_WeakDoor_Destruction'.");
            destruction = _d;
        }

        public override void Write(ByteBuffer buffer) {
            prevHealth = health;
            _lock0 = lock0;
            _lock1 = lock1;

            BitHelper.WriteBytes(prevHealth, buffer);

            if (door.m_buttonAligns[0].transform.localPosition.z < 0) {
                BitHelper.WriteBytes(_lock0, buffer);
                BitHelper.WriteBytes(_lock1, buffer);
            } else {
                BitHelper.WriteBytes(_lock1, buffer);
                BitHelper.WriteBytes(_lock0, buffer);
            }

            if (SNet.IsMaster) {
                Sync.Trigger(id, health);
            }
        }

        public override void Spawn(ByteBuffer buffer) {
            _lock0 = lock0;
            _lock1 = lock1;

            BitHelper.WriteHalf(door.m_healthMax, buffer);

            if (door.m_buttonAligns[0].transform.localPosition.z < 0) {
                BitHelper.WriteBytes(_lock0, buffer);
                BitHelper.WriteBytes(_lock1, buffer);
            } else {
                BitHelper.WriteBytes(_lock1, buffer);
                BitHelper.WriteBytes(_lock0, buffer);
            }
        }

        private static class Sync {
            const string eventName = "Vanilla.Map.WeakDoor";

            [ReplayPluginLoad]
            private static void Load() {
                RNet.Register(eventName, OnReceive);
            }

            private static ByteBuffer packet = new ByteBuffer();

            public static void Trigger(int id, byte health) {
                ByteBuffer packet = Sync.packet;
                packet.Clear();

                BitHelper.WriteBytes(id, packet);
                BitHelper.WriteBytes(health, packet);

                RNet.Trigger(eventName, packet);
            }

            private static void OnReceive(ulong sender, ArraySegment<byte> packet) {
                int index = 0;

                int id = BitHelper.ReadInt(packet, ref index);
                byte health = BitHelper.ReadByte(packet, ref index);

                if (Replay.TryGet<rWeakDoor>(id, out rWeakDoor door)) {
                    door._health = health;
                }
            }
        }
    }
}
