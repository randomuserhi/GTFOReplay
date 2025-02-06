using Agents;
using API;
using Gear;
using HarmonyLib;
using Player;
using ReplayRecorder;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using SNetwork;
using UnityEngine;
using Vanilla.Events;

namespace Vanilla.StatTracker {
    // TODO(randomuserhi): manage bots

    [HarmonyPatch]
    [ReplayData("Vanilla.Player.Gunshots.Info", "0.0.1")]
    internal class rGunshotInfo : Id {
        [HarmonyPatch]
        private static class Patches {
            private struct BulletInfo {
                public int hits;
                public int crits;
            }

            private static Vector3? lastHit = null;
            private static Identifier currentWeapon = Identifier.unknown;
            private static PlayerAgent? currentPlayer = null;
            private static BulletInfo currentBullet = new BulletInfo() {
                hits = 0,
                crits = 0
            };

            private static void TriggerBullet() {
                if (currentPlayer == null) return;

                if (currentBullet.hits > byte.MaxValue || currentBullet.crits > byte.MaxValue) {
                    APILogger.Warn($"Number of enemies hit / crit for this bullet exceeded maximum value of {byte.MaxValue}.");
                }
                Sync.Trigger(new rGunshotInfo(currentPlayer, currentWeapon, (byte)currentBullet.hits, (byte)currentBullet.crits));

                lastHit = null;
                currentBullet.crits = 0;
                currentBullet.hits = 0;
            }

            private static void PrepareWeapon(BulletWeapon weapon) {
                if (weapon.Owner == null) return;
                if (!SNet.IsMaster && weapon.Owner.Owner.IsBot) return;
                if (!weapon.Owner.Owner.IsBot && !weapon.Owner.IsLocallyOwned) return;

                if (rGunshot.CancelSyncedShot(weapon)) return;

                lastHit = null;

                currentPlayer = weapon.Owner;

                ItemEquippable currentEquipped = currentPlayer.Inventory.WieldedItem;
                if (currentEquipped.IsWeapon && currentEquipped.CanReload) {
                    currentWeapon = Identifier.From(currentEquipped);
                }
            }

            private static void ResetWeapon() {
                TriggerBullet();

                currentPlayer = null;
                currentWeapon = Identifier.unknown;
            }

            [HarmonyPatch(typeof(BulletWeapon), nameof(BulletWeapon.Fire))]
            [HarmonyPrefix]
            private static void Prefix_BulletWeaponFire(BulletWeapon __instance) {
                PrepareWeapon(__instance);
            }
            [HarmonyPatch(typeof(BulletWeapon), nameof(BulletWeapon.Fire))]
            [HarmonyPostfix]
            private static void Postfix_BulletWeaponFire(BulletWeapon __instance) {
                ResetWeapon();
            }

            [HarmonyPatch(typeof(Shotgun), nameof(Shotgun.Fire))]
            [HarmonyPrefix]
            private static void Prefix_ShotgunFire(Shotgun __instance) {
                PrepareWeapon(__instance);
            }
            [HarmonyPatch(typeof(Shotgun), nameof(Shotgun.Fire))]
            [HarmonyPostfix]
            private static void Postfix_ShotgunFire(Shotgun __instance) {
                ResetWeapon();
            }

            [HarmonyPatch(typeof(BulletWeaponSynced), nameof(BulletWeaponSynced.Fire))]
            [HarmonyPrefix]
            private static void Prefix_BulletWeaponSyncFire(BulletWeaponSynced __instance) {
                if (__instance.Owner == null || !__instance.Owner.Owner.IsBot) return;

                PrepareWeapon(__instance);
            }
            [HarmonyPatch(typeof(BulletWeaponSynced), nameof(BulletWeaponSynced.Fire))]
            [HarmonyPostfix]
            private static void Postfix_BulletWeaponSyncFire() {
                ResetWeapon();
            }

            [HarmonyPatch(typeof(ShotgunSynced), nameof(ShotgunSynced.Fire))]
            [HarmonyPrefix]
            private static void Prefix_ShotgunSyncFire(ShotgunSynced __instance) {
                if (__instance.Owner == null || !__instance.Owner.Owner.IsBot) return;

                PrepareWeapon(__instance);
            }
            [HarmonyPatch(typeof(ShotgunSynced), nameof(ShotgunSynced.Fire))]
            [HarmonyPostfix]
            private static void Postfix_ShotgunSyncFire() {
                ResetWeapon();
            }

            [HarmonyPatch(typeof(Weapon), nameof(Weapon.CastWeaponRay),
            new Type[] {
                typeof(Transform),
                typeof(Weapon.WeaponHitData),
                typeof(Vector3),
                typeof(int)
            }, new ArgumentType[] {
                ArgumentType.Normal,
                ArgumentType.Ref,
                ArgumentType.Normal,
                ArgumentType.Normal
            })]
            [HarmonyPostfix]
            private static void Postfix_CastWeaponRay(bool __result, Transform alignTransform, Weapon.WeaponHitData weaponRayData, Vector3 originPos) {
                if (currentPlayer == null) return;

                if (lastHit != null && originPos != lastHit.Value) {
                    // New bullet instance from shotgun (lastHit doesnt match penetration origin, so must be shotgun)

                    TriggerBullet();
                }

                // Compute penetration hit origin to check if next ray is from penetration or not
                lastHit = Weapon.s_weaponRayData.rayHit.point + Weapon.s_weaponRayData.fireDir * 0.1f;
            }

            [HarmonyPatch(typeof(Dam_EnemyDamageLimb), nameof(Dam_EnemyDamageLimb.BulletDamage))]
            [HarmonyPrefix]
            public static void Prefix_EnemyLimbBulletDamage(Dam_EnemyDamageLimb __instance, Agent sourceAgent) {
                if (!__instance.m_base.Owner.Alive) return;
                if (currentPlayer == null) return;

                ++currentBullet.hits;
                if (__instance.m_type == eLimbDamageType.Weakspot) {
                    ++currentBullet.crits;
                }
            }
        }

        public Identifier gear;

        public byte numHits;
        public byte numCrits;

        public rGunshotInfo(PlayerAgent owner, Identifier gear, byte numHits, byte numCrits) : base(owner.GlobalID) {
            this.gear = gear;
            this.numHits = numHits;
            this.numCrits = numCrits;
        }

        public rGunshotInfo(ushort id, Identifier gear, byte numHits, byte numCrits) : base(id) {
            this.gear = gear;
            this.numHits = numHits;
            this.numCrits = numCrits;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);

            BitHelper.WriteBytes(gear, buffer);
            BitHelper.WriteBytes(numHits, buffer);
            BitHelper.WriteBytes(numCrits, buffer);
        }

        private static class Sync {
            const string eventName = "Vanilla.Player.Gunshots.Info";

            [ReplayPluginLoad]
            private static void Load() {
                RNet.Register(eventName, OnReceive);
            }

            private static ByteBuffer packet = new ByteBuffer();

            public static void Trigger(rGunshotInfo info) {
                Replay.Trigger(info);

                ByteBuffer packet = Sync.packet;
                packet.Clear();

                BitHelper.WriteBytes((ushort)info.id, packet);
                Identifier.WriteToRNetPacket(info.gear, packet);
                BitHelper.WriteBytes(info.numHits, packet);
                BitHelper.WriteBytes(info.numCrits, packet);

                RNet.Trigger(eventName, packet);
            }

            private static void OnReceive(ulong sender, ArraySegment<byte> packet) {
                int index = 0;

                ushort source = BitHelper.ReadUShort(packet, ref index);
                Identifier gear = Identifier.ReadFromRNetPacket(packet, ref index);
                byte numHits = BitHelper.ReadByte(packet, ref index);
                byte numCrits = BitHelper.ReadByte(packet, ref index);

                Replay.Trigger(new rGunshotInfo(source, gear, numHits, numCrits));
            }
        }
    }
}
