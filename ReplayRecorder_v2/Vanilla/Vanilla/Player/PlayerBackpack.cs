using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;

namespace Vanilla.Player {
    [ReplayData("Vanilla.Player.Backpack", "0.0.1")]
    internal class rPlayerBackpack : ReplayDynamic {
        public PlayerAgent agent;

        private Identifier GetSlotId(InventorySlot slot) {
            try {
                if (PlayerBackpackManager.TryGetItem(agent.Owner, slot, out BackpackItem bpItem)) {
                    if (bpItem.Instance != null) {
                        ItemEquippable item = bpItem.Instance.Cast<ItemEquippable>();
                        return Identifier.From(item);
                    }
                }
            } catch { }
            return Identifier.unknown;
        }

        private Identifier lastMelee = Identifier.unknown;
        private Identifier melee => GetSlotId(InventorySlot.GearMelee);

        private Identifier lastPrimary = Identifier.unknown;
        private Identifier primary => GetSlotId(InventorySlot.GearStandard);

        private Identifier lastSpecial = Identifier.unknown;
        private Identifier special => GetSlotId(InventorySlot.GearSpecial);

        private Identifier lastTool = Identifier.unknown;
        private Identifier tool => GetSlotId(InventorySlot.GearClass);

        private Identifier lastPack = Identifier.unknown;
        private Identifier pack => GetSlotId(InventorySlot.ResourcePack);

        private Identifier lastConsumable = Identifier.unknown;
        private Identifier consumable => GetSlotId(InventorySlot.Consumable);

        private Identifier lastHeavyItem = Identifier.unknown;
        private Identifier heavyItem => GetSlotId(InventorySlot.InLevelCarry);

        public override bool Active => agent != null;
        public override bool IsDirty =>
            melee != lastMelee ||
            primary != lastPrimary ||
            special != lastSpecial ||
            tool != lastTool ||
            pack != lastPack ||
            consumable != lastConsumable ||
            heavyItem != lastHeavyItem;

        public rPlayerBackpack(PlayerAgent player) : base(player.GlobalID) {
            this.agent = player;
        }

        public override void Write(ByteBuffer buffer) {
            lastMelee = melee;
            lastPrimary = primary;
            lastSpecial = special;
            lastTool = tool;
            lastPack = pack;
            lastConsumable = consumable;
            lastHeavyItem = heavyItem;

            BitHelper.WriteBytes(lastMelee, buffer);
            BitHelper.WriteBytes(lastPrimary, buffer);
            BitHelper.WriteBytes(lastSpecial, buffer);
            BitHelper.WriteBytes(lastTool, buffer);
            BitHelper.WriteBytes(lastPack, buffer);
            BitHelper.WriteBytes(lastConsumable, buffer);
            BitHelper.WriteBytes(lastHeavyItem, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }
}
