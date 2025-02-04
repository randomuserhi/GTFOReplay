using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;

namespace Vanilla.Player {
    [ReplayData("Vanilla.Player.Backpack", "0.0.2")]
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

        private Identifier GetVanityItem(ClothesType type) {
            try {
                PlayerBackpack backpack = PlayerBackpackManager.GetBackpack(agent.Owner);
                if (backpack != null) {
                    return Identifier.Vanity(backpack.m_vanityItems[(int)type]);
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

        private Identifier lastHackingTool = Identifier.unknown;
        private Identifier hackingTool => GetSlotId(InventorySlot.HackingTool);

        private Identifier lastVanityHelmet = Identifier.unknown;
        private Identifier vanityHelmet => GetVanityItem(ClothesType.Helmet);

        private Identifier lastVanityTorso = Identifier.unknown;
        private Identifier vanityTorso => GetVanityItem(ClothesType.Torso);

        private Identifier lastVanityLegs = Identifier.unknown;
        private Identifier vanityLegs => GetVanityItem(ClothesType.Legs);

        private Identifier lastVanityBackpack = Identifier.unknown;
        private Identifier vanityBackpack => GetVanityItem(ClothesType.Backpack);

        private Identifier lastVanityPallete = Identifier.unknown;
        private Identifier vanityPallete => GetVanityItem(ClothesType.Palette);

        public override bool Active => agent != null && agent.Owner != null;
        public override bool IsDirty =>
            melee != lastMelee ||
            primary != lastPrimary ||
            special != lastSpecial ||
            tool != lastTool ||
            pack != lastPack ||
            consumable != lastConsumable ||
            heavyItem != lastHeavyItem ||
            hackingTool != lastHackingTool ||
            vanityHelmet != lastVanityHelmet ||
            vanityTorso != lastVanityTorso ||
            vanityLegs != lastVanityLegs ||
            vanityBackpack != lastVanityBackpack ||
            vanityPallete != lastVanityPallete;

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
            lastHackingTool = hackingTool;
            lastVanityHelmet = vanityHelmet;
            lastVanityTorso = vanityTorso;
            lastVanityLegs = vanityLegs;
            lastVanityBackpack = vanityBackpack;
            lastVanityPallete = vanityPallete;

            BitHelper.WriteBytes(lastMelee, buffer);
            BitHelper.WriteBytes(lastPrimary, buffer);
            BitHelper.WriteBytes(lastSpecial, buffer);
            BitHelper.WriteBytes(lastTool, buffer);
            BitHelper.WriteBytes(lastPack, buffer);
            BitHelper.WriteBytes(lastConsumable, buffer);
            BitHelper.WriteBytes(lastHeavyItem, buffer);
            BitHelper.WriteBytes(lastHackingTool, buffer);

            BitHelper.WriteBytes(lastVanityHelmet, buffer);
            BitHelper.WriteBytes(lastVanityTorso, buffer);
            BitHelper.WriteBytes(lastVanityLegs, buffer);
            BitHelper.WriteBytes(lastVanityBackpack, buffer);
            BitHelper.WriteBytes(lastVanityPallete, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }
}
