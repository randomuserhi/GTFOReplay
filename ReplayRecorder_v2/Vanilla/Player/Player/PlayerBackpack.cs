using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using Vanilla.Specification;

namespace Vanilla.Player {
    [ReplayData("Vanilla.Player.Backpack", "0.0.1")]
    internal class rPlayerBackpack : ReplayDynamic {
        public PlayerAgent agent;

        private ushort GetSlotId(InventorySlot slot) {
            try {
                if (PlayerBackpackManager.TryGetItem(agent.Owner, slot, out BackpackItem bpItem)) {
                    if (bpItem.Instance != null) {
                        ItemEquippable item = bpItem.Instance.Cast<ItemEquippable>();
                        if (item.GearIDRange != null) {
                            return GTFOSpecification.GetGear(item.GearIDRange.PublicGearName);
                        } else if (item.ItemDataBlock != null) {
                            return GTFOSpecification.GetItem(item.ItemDataBlock.persistentID);
                        }
                    }
                }
            } catch { }
            return 0;
        }

        private ushort lastMelee = 0;
        private ushort melee => GetSlotId(InventorySlot.GearMelee);

        private ushort lastPrimary = 0;
        private ushort primary => GetSlotId(InventorySlot.GearStandard);

        private ushort lastSpecial = 0;
        private ushort special => GetSlotId(InventorySlot.GearSpecial);

        private ushort lastTool = 0;
        private ushort tool => GetSlotId(InventorySlot.GearClass);

        private ushort lastPack = 0;
        private ushort pack => GetSlotId(InventorySlot.ResourcePack);

        private ushort lastConsumable = 0;
        private ushort consumable => GetSlotId(InventorySlot.Consumable);

        public override bool Active {
            get {
                if (agent == null && Replay.Has<rPlayerBackpack>(id)) {
                    Replay.Despawn(Replay.Get<rPlayerBackpack>(id));
                }
                return agent != null;
            }
        }
        public override bool IsDirty =>
            melee != lastMelee ||
            primary != lastPrimary ||
            special != lastSpecial ||
            tool != lastTool ||
            pack != lastPack ||
            consumable != lastConsumable;

        public rPlayerBackpack(PlayerAgent player) : base(player.GlobalID) {
            this.agent = player;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(melee, buffer);
            BitHelper.WriteBytes(primary, buffer);
            BitHelper.WriteBytes(special, buffer);
            BitHelper.WriteBytes(tool, buffer);
            BitHelper.WriteBytes(pack, buffer);
            BitHelper.WriteBytes(consumable, buffer);

            lastMelee = melee;
            lastPrimary = primary;
            lastSpecial = special;
            lastTool = tool;
            lastPack = pack;
            lastConsumable = consumable;
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }
}
