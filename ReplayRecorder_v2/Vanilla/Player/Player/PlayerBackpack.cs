﻿using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using Vanilla.Specification;

namespace Vanilla.Player {
    [ReplayData("Vanilla.Player.Backpack", "0.0.1")]
    internal class rPlayerBackpack : ReplayDynamic {
        public PlayerAgent agent;

        int id;
        public override int Id => id;

        // NOTE(randomuserhi): Throws an error when a player joins -> I don't know how fatal this is...
        private ushort GetSlotId(InventorySlot slot) {
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

        public override bool Active {
            get {
                if (agent == null && Replay.Has<rPlayerBackpack>(Id)) {
                    Replay.Despawn(Replay.Get<rPlayerBackpack>(Id));
                }
                return agent != null;
            }
        }
        public override bool IsDirty =>
            primary != lastPrimary ||
            special != lastSpecial ||
            tool != lastTool ||
            pack != lastPack;

        public rPlayerBackpack(PlayerAgent player) {
            id = player.GlobalID;
            this.agent = player;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(melee, buffer);
            BitHelper.WriteBytes(primary, buffer);
            BitHelper.WriteBytes(special, buffer);
            BitHelper.WriteBytes(tool, buffer);
            BitHelper.WriteBytes(pack, buffer);

            lastMelee = melee;
            lastPrimary = primary;
            lastSpecial = special;
            lastTool = tool;
            lastPack = pack;
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }
}