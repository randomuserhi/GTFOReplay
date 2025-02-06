using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.Player {
    [ReplayData("Vanilla.Player.Stats", "0.0.3")]
    public class rPlayerStats : ReplayDynamic {
        public PlayerAgent player;

        public override bool Active => player != null && player.Owner != null;
        public override bool IsDirty => health != oldHealth ||
                                        infection != oldInfection ||
                                        primaryAmmo != oldPrimaryAmmo ||
                                        secondaryAmmo != oldSecondaryAmmo ||
                                        toolAmmo != oldToolAmmo ||
                                        consumableAmmo != oldConsumableAmmo ||
                                        resourceAmmo != oldResourceAmmo ||
                                        stamina != oldStamina;

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
                float actualRelInPack = ammo.RelInPack * 5.0f / 6.0f; // NOTE(randomuserhi): Scale properly to account for 6 uses
                return (byte)(byte.MaxValue * actualRelInPack);
            }
        }

        private byte _stamina = byte.MaxValue;
        private byte stamina {
            get {
                if (player.IsLocallyOwned) {
                    return (byte)(byte.MaxValue * (Mathf.Clamp01(player.Stamina.m_currentStamina) / 1.0f));
                } else {
                    return _stamina;
                }
            }
        }

        private byte oldHealth = 255;
        private byte oldInfection = 255;
        private byte oldPrimaryAmmo = 255;
        private byte oldSecondaryAmmo = 255;
        private byte oldToolAmmo = 255;
        private byte oldConsumableAmmo = 255;
        private byte oldResourceAmmo = 255;
        private byte oldStamina = 255;

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
            BitHelper.WriteBytes(stamina, buffer);

            if (stamina != oldStamina && !player.Owner.IsBot) {
                Sync.Trigger(id, stamina);
            }

            oldHealth = health;
            oldInfection = infection;
            oldPrimaryAmmo = primaryAmmo;
            oldSecondaryAmmo = secondaryAmmo;
            oldToolAmmo = toolAmmo;
            oldConsumableAmmo = consumableAmmo;
            oldResourceAmmo = resourceAmmo;
            oldStamina = stamina;
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }

        private static class Sync {
            const string eventName = "Vanilla.Player.Stats.Stamina";

            [ReplayPluginLoad]
            private static void Load() {
                RNet.Register(eventName, OnReceive);
            }

            private static ByteBuffer packet = new ByteBuffer();

            public static void Trigger(int id, byte stamina) {
                ByteBuffer packet = Sync.packet;
                packet.Clear();

                BitHelper.WriteBytes(id, packet);
                BitHelper.WriteBytes(stamina, packet);

                RNet.Trigger(eventName, packet);
            }

            private static void OnReceive(ulong sender, ArraySegment<byte> packet) {
                int index = 0;

                int player = BitHelper.ReadInt(packet, ref index);
                byte stamina = BitHelper.ReadByte(packet, ref index);

                if (Replay.TryGet<rPlayerStats>(player, out var stats)) {
                    stats._stamina = stamina;
                }
            }
        }
    }
}
