using Player;

namespace ReplayRecorder.Player {
    internal class PlayerStatus : DynamicProperty {
        private PlayerAgent player;
        private byte health => (byte)(byte.MaxValue * player.Damage.Health / player.Damage.HealthMax);
        private byte infection => (byte)(byte.MaxValue * player.Damage.Infection);

        private PlayerBackpack backpack;
        private byte primaryAmmo {
            get {
                InventorySlotAmmo ammo = backpack.AmmoStorage.GetInventorySlotAmmo(AmmoType.Standard);
                if (backpack.TryGetBackpackItem(InventorySlot.GearStandard, out BackpackItem item)) {
                    ItemEquippable? itemEquippable = item.Instance.TryCast<ItemEquippable>();
                    if (itemEquippable != null) {
                        return (byte)(byte.MaxValue * (float)(ammo.BulletsInPack + itemEquippable.GetCurrentClip()) * ammo.BulletsToRelConv);
                    }
                }
                return (byte)(byte.MaxValue * ammo.RelInPack);
            }
        }
        private byte secondaryAmmo {
            get {
                InventorySlotAmmo ammo = backpack.AmmoStorage.GetInventorySlotAmmo(AmmoType.Special);
                if (backpack.TryGetBackpackItem(InventorySlot.GearSpecial, out BackpackItem item)) {
                    ItemEquippable? itemEquippable = item.TryCast<ItemEquippable>();
                    if (itemEquippable != null) {
                        return (byte)(byte.MaxValue * (float)(ammo.BulletsInPack + itemEquippable.GetCurrentClip()) * ammo.BulletsToRelConv);
                    }
                }
                return (byte)(byte.MaxValue * ammo.RelInPack);
            }
        }
        private byte toolAmmo {
            get {
                InventorySlotAmmo ammo = backpack.AmmoStorage.GetInventorySlotAmmo(AmmoType.Class);
                if (backpack.IsDeployed(InventorySlot.GearClass)) {
                    if (PlayerSentry.sentries.ContainsKey(player.Owner.Lookup)) {
                        int bulletsInPack = (int)(PlayerSentry.sentries[player.Owner.Lookup].sentry.m_ammo / ammo.CostOfBullet);
                        return (byte)(byte.MaxValue * (float)bulletsInPack * ammo.BulletsToRelConv);
                    }
                }
                return (byte)(byte.MaxValue * ammo.RelInPack);
            }
        }
        private byte consumableAmmo {
            get {
                InventorySlotAmmo ammo = backpack.AmmoStorage.GetInventorySlotAmmo(AmmoType.CurrentConsumable);
                return (byte)(byte.MaxValue * ammo.RelInPack);
            }
        }
        private byte resourceAmmo {
            get {
                InventorySlotAmmo ammo = backpack.AmmoStorage.GetInventorySlotAmmo(AmmoType.ResourcePackRel);
                return (byte)(byte.MaxValue * ammo.RelInPack);
            }
        }

        private byte oldHealth = 255;
        private byte oldInfection = 255;
        private byte oldPrimaryAmmo = 255;
        private byte oldSecondaryAmmo = 255;
        private byte oldToolAmmo = 255;
        private byte oldConsumableAmmo = 255;
        private byte oldResourceAmmo = 255;

        public PlayerStatus(int instance, PlayerAgent player) : base(Type.PlayerStatus, instance) {
            this.player = player;
            backpack = PlayerBackpackManager.GetBackpack(player.Owner);
        }

        protected override bool IsSerializable() {
            return player != null && (
                health != oldHealth ||
                infection != oldInfection ||
                primaryAmmo != oldPrimaryAmmo ||
                secondaryAmmo != oldSecondaryAmmo ||
                toolAmmo != oldToolAmmo ||
                consumableAmmo != oldConsumableAmmo ||
                resourceAmmo != oldResourceAmmo
                );
        }

        private const int SizeOfHeader = 7;
        private static byte[] buffer = new byte[SizeOfHeader];
        public override void Serialize(FileStream fs) {
            base.Serialize(fs);

            int index = 0;
            BitHelper.WriteBytes(health, buffer, ref index);
            BitHelper.WriteBytes(infection, buffer, ref index);
            BitHelper.WriteBytes(primaryAmmo, buffer, ref index);
            BitHelper.WriteBytes(secondaryAmmo, buffer, ref index);
            BitHelper.WriteBytes(toolAmmo, buffer, ref index);
            BitHelper.WriteBytes(consumableAmmo, buffer, ref index);
            BitHelper.WriteBytes(resourceAmmo, buffer, ref index);

            oldHealth = health;
            oldInfection = infection;
            oldPrimaryAmmo = primaryAmmo;
            oldSecondaryAmmo = secondaryAmmo;
            oldToolAmmo = toolAmmo;
            oldConsumableAmmo = consumableAmmo;
            oldResourceAmmo = resourceAmmo;

            fs.Write(buffer);
        }
    }
}
