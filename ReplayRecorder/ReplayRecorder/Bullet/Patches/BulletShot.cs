using Gear;
using HarmonyLib;
using Player;
using UnityEngine;

namespace ReplayRecorder.Bullets.Patches {
    [HarmonyPatch]
    class BulletPatches {
        private static bool glueShot = false;

        [HarmonyPatch(typeof(GlueGun), nameof(GlueGun.FireSingle))]
        [HarmonyPrefix]
        private static void Prefix_GlueGunFireSingle() {
            glueShot = true;
        }

        [HarmonyPatch(typeof(GlueGun), nameof(GlueGun.FireSingle))]
        [HarmonyPostfix]
        private static void Postfix_GlueGunFireSingle() {
            glueShot = false;
        }

        // Handle damage amount of bulletshot
        private static float damage = 0;

        #region damage patches

        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.FireBullet))]
        [HarmonyPrefix]
        private static void Prefix_SentryGunFire(SentryGunInstance_Firing_Bullets __instance, bool doDamage, bool targetIsTagged) {
            damage = __instance.m_archetypeData.GetSentryDamage(SentryGunInstance_Firing_Bullets.s_weaponRayData.owner, SentryGunInstance_Firing_Bullets.s_weaponRayData.rayHit.distance, targetIsTagged);
        }
        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.FireBullet))]
        [HarmonyPostfix]
        private static void Postfix_SentryGunFire() {
            damage = 0;
        }

        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.UpdateFireShotgunSemi))]
        [HarmonyPrefix]
        private static void Prefix_SentryShotgunFire(SentryGunInstance_Firing_Bullets __instance, bool isMaster, bool targetIsTagged) {
            damage = __instance.m_archetypeData.GetSentryDamage(SentryGunInstance_Firing_Bullets.s_weaponRayData.owner, SentryGunInstance_Firing_Bullets.s_weaponRayData.rayHit.distance, targetIsTagged);
        }
        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.UpdateFireShotgunSemi))]
        [HarmonyPostfix]
        private static void Postfix_SentryShotgunFire() {
            damage = 0;
        }

        [HarmonyPatch(typeof(BulletWeaponSynced), nameof(BulletWeaponSynced.Fire))]
        [HarmonyPrefix]
        private static void Prefix_BulletWeaponSyncFire(BulletWeaponSynced __instance) {
            ownerSlot = __instance.Owner.PlayerSlotIndex;
            damage = __instance.ArchetypeData.GetDamageWithBoosterEffect(__instance.Owner, __instance.ItemDataBlock.inventorySlot);
        }
        [HarmonyPatch(typeof(BulletWeaponSynced), nameof(BulletWeaponSynced.Fire))]
        [HarmonyPostfix]
        private static void Postfix_BulletWeaponSyncFire() {
            ownerSlot = -1;
            damage = 0;
        }

        [HarmonyPatch(typeof(ShotgunSynced), nameof(ShotgunSynced.Fire))]
        [HarmonyPrefix]
        private static void Prefix_ShotgunSyncFire(ShotgunSynced __instance) {
            ownerSlot = __instance.Owner.PlayerSlotIndex;
            damage = __instance.ArchetypeData.GetDamageWithBoosterEffect(__instance.Owner, __instance.ItemDataBlock.inventorySlot);
        }
        [HarmonyPatch(typeof(ShotgunSynced), nameof(ShotgunSynced.Fire))]
        [HarmonyPostfix]
        private static void Postfix_ShotgunSyncFire() {
            ownerSlot = -1;
            damage = 0;
        }

        [HarmonyPatch(typeof(BulletWeapon), nameof(BulletWeapon.Fire))]
        [HarmonyPrefix]
        private static void Prefix_BulletWeaponFire(BulletWeapon __instance) {
            damage = __instance.ArchetypeData.GetDamageWithBoosterEffect(__instance.Owner, __instance.ItemDataBlock.inventorySlot);
        }
        [HarmonyPatch(typeof(BulletWeapon), nameof(BulletWeapon.Fire))]
        [HarmonyPostfix]
        private static void Postfix_BulletWeaponFire() {
            damage = 0;
        }

        [HarmonyPatch(typeof(Shotgun), nameof(Shotgun.Fire))]
        [HarmonyPrefix]
        private static void Prefix_ShotgunFire(Shotgun __instance) {
            damage = __instance.ArchetypeData.GetDamageWithBoosterEffect(__instance.Owner, __instance.ItemDataBlock.inventorySlot);
        }
        [HarmonyPatch(typeof(Shotgun), nameof(Shotgun.Fire))]
        [HarmonyPostfix]
        private static void Postfix_ShotgunFire() {
            damage = 0;
        }

        #endregion

        public static uint id = 0;

        private static int ownerSlot = -1;
        public static int[] skip = new int[4] { 0, 0, 0, 0 };
        public static void Reset() {
            for (int i = 0; i < skip.Length; ++i) {
                skip[i] = 0;
            }
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
            // NOTE(randomuserhi): glushot is used to ignore cfoam since it also uses weapon ray cast
            if (__result && !glueShot) {
                PlayerAgent localPlayer = PlayerManager.GetLocalPlayerAgent();
                // NOTE(randomuserhi): I'm assuming all players are in the same dimension for this to work
                //                     It's better to patch all methods that call this and track what dimension the shot came from
                //                     that way, but I'm lazy.
                byte dimensionIndex = (byte)localPlayer.m_dimensionIndex;

                if (ownerSlot == -1) {
                    ownerSlot = localPlayer.PlayerSlotIndex;
                }

                if (skip[ownerSlot] >= 0) {
                    Bullet.OnBulletShot(id, damage, weaponRayData.rayHit.collider.gameObject.GetComponent<IDamageable>() != null, dimensionIndex, originPos, weaponRayData.rayHit.point);
                    skip[ownerSlot] = 0;
                } else {
                    --skip[ownerSlot];
                }
            }
        }
    }
}
