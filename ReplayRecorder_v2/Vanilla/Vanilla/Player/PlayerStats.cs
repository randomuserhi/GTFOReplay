using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;

namespace Vanilla.Player {
    [ReplayData("Vanilla.Player.Stats", "0.0.1")]
    internal class rPlayerStats : ReplayDynamic {
        public PlayerAgent player;

        public override bool Active {
            get {
                if (player == null && Replay.Has<rPlayerStats>(id)) {
                    Replay.Despawn(Replay.Get<rPlayerStats>(id));
                }
                return player != null;
            }
        }
        public override bool IsDirty => health != oldHealth ||
                                        infection != oldInfection ||
                                        primaryAmmo != oldPrimaryAmmo ||
                                        secondaryAmmo != oldSecondaryAmmo ||
                                        toolAmmo != oldToolAmmo ||
                                        consumableAmmo != oldConsumableAmmo ||
                                        resourceAmmo != oldResourceAmmo;

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
                    ItemEquippable? itemEquippable = item.Instance.TryCast<ItemEquippable>();
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
                    if (PlayerBackpackManager.TryGetItem(player.Owner, InventorySlot.GearClass, out BackpackItem item)) {
                        SentryGunInstance? sentry = item.Instance.TryCast<SentryGunInstance>();
                        if (sentry != null) {
                            int bulletsInPack = (int)(sentry.m_ammo / ammo.CostOfBullet);
                            return (byte)(byte.MaxValue * (float)bulletsInPack * ammo.BulletsToRelConv);
                        }
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

        public rPlayerStats(PlayerAgent player) : base(player.GlobalID) {
            this.player = player;
            backpack = PlayerBackpackManager.GetBackpack(player.Owner);
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(health, buffer);
            BitHelper.WriteBytes(infection, buffer);
            BitHelper.WriteBytes(primaryAmmo, buffer);
            BitHelper.WriteBytes(secondaryAmmo, buffer);
            BitHelper.WriteBytes(toolAmmo, buffer);
            BitHelper.WriteBytes(consumableAmmo, buffer);
            BitHelper.WriteBytes(resourceAmmo, buffer);

            oldHealth = health;
            oldInfection = infection;
            oldPrimaryAmmo = primaryAmmo;
            oldSecondaryAmmo = secondaryAmmo;
            oldToolAmmo = toolAmmo;
            oldConsumableAmmo = consumableAmmo;
            oldResourceAmmo = resourceAmmo;
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }
}
