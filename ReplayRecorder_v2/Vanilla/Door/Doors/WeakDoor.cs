using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;

namespace Vanilla.Map.Doors {
    [ReplayData("Vanilla.Map.WeakDoor", "0.0.1")]
    internal class rWeakDoor : ReplayDynamic {
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

        private byte health => (byte)(byte.MaxValue * destruction.m_health / door.m_healthMax);
        private byte prevHealth = byte.MaxValue;

        private LockType GetLockType(int slot) {
            if (door.m_weakLocks == null || slot < 0 || slot >= door.m_weakLocks.Length) {
                return LockType.None;
            }

            LG_WeakLock weakLock = door.m_weakLocks[slot];

            LockType type = LockType.None;
            if (weakLock != null && weakLock.IsLocked()) {
                switch (weakLock.m_lockType) {
                case eWeakLockType.Melee:
                    type = LockType.Melee;
                    break;
                case eWeakLockType.Hackable:
                    type = LockType.Hackable;
                    break;
                }
            }
            return type;
        }

        // NOTE(randomuserhi): Only assume doors have 2 locks
        private byte lock0 => (byte)GetLockType(0);
        private byte _lock0 = (byte)LockType.None;
        private byte lock1 => (byte)GetLockType(1);
        private byte _lock1 = (byte)LockType.None;

        public rWeakDoor(LG_WeakDoor door) : base(door.Gate.GetInstanceID()) {
            this.door = door;

            LG_WeakDoor_Destruction? _d = door.m_destruction.TryCast<LG_WeakDoor_Destruction>();
            if (_d == null) throw new NoDoorDestructionComp($"Failed to get 'LG_WeakDoor_Destruction'.");
            destruction = _d;
        }

        public override void Write(ByteBuffer buffer) {
            prevHealth = health;
            _lock0 = lock0;
            _lock1 = lock1;

            BitHelper.WriteBytes(prevHealth, buffer);
            BitHelper.WriteBytes(_lock0, buffer);
            BitHelper.WriteBytes(_lock1, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            _lock0 = lock0;
            _lock1 = lock1;

            BitHelper.WriteHalf(door.m_healthMax, buffer);
            BitHelper.WriteBytes(_lock0, buffer);
            BitHelper.WriteBytes(_lock1, buffer);
        }
    }
}
