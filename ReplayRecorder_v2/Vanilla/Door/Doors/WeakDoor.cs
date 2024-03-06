using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;

namespace Vanilla.Map.Doors {
    [ReplayData("Vanilla.Map.WeakDoor", "0.0.1")]
    internal class rWeakDoor : ReplayDynamic {
        private LG_WeakDoor door;
        private LG_WeakDoor_Destruction destruction;

        private int id;
        public override int Id => id;
        public override string? Debug => $"{Id} - {destruction.m_health}/{door.m_healthMax}";

        public override bool Active => door != null;
        public override bool IsDirty => health != prevHealth;

        private byte health => (byte)(byte.MaxValue * destruction.m_health / door.m_healthMax);
        private byte prevHealth = byte.MaxValue;

        public rWeakDoor(LG_WeakDoor door) {
            id = door.GetInstanceID();
            this.door = door;

            LG_WeakDoor_Destruction? _d = door.m_destruction.TryCast<LG_WeakDoor_Destruction>();
            if (_d == null) throw new NoDoorDestructionComp($"Failed to get 'LG_WeakDoor_Destruction'.");
            destruction = _d;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(health, buffer);

            prevHealth = health;
        }

        public override void Spawn(ByteBuffer buffer) {
            BitHelper.WriteHalf(door.m_healthMax, buffer);
        }
    }
}
