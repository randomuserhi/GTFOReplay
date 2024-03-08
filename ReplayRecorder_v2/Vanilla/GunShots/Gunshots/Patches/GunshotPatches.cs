using Gear;
using HarmonyLib;
using Player;
using ReplayRecorder;
using UnityEngine;

namespace Vanilla.Player.Gunshots.Patches {
    [HarmonyPatch]
    internal static class GunshotPatches {
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

        private static PlayerAgent? owner = null;
        private static float damage = 0;
        private static bool sentry = false;
        private static bool autoTrack = true;

        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.FireBullet))]
        [HarmonyPrefix]
        private static void Prefix_SentryGunFire(SentryGunInstance_Firing_Bullets __instance, bool doDamage, bool targetIsTagged) {
            damage = __instance.m_archetypeData.GetSentryDamage(__instance.m_core.Owner, 0.01f, targetIsTagged);
            owner = __instance.m_core.Owner;
            sentry = true;
        }
        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.FireBullet))]
        [HarmonyPostfix]
        private static void Postfix_SentryGunFire() {
            damage = 0;
            owner = null;
            sentry = false;
        }

        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.UpdateFireShotgunSemi))]
        [HarmonyPrefix]
        private static void Prefix_SentryShotgunFire(SentryGunInstance_Firing_Bullets __instance, bool isMaster, bool targetIsTagged) {
            damage = __instance.m_archetypeData.GetSentryDamage(__instance.m_core.Owner, 0.01f, targetIsTagged);
            owner = __instance.m_core.Owner;
            sentry = true;
        }
        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.UpdateFireShotgunSemi))]
        [HarmonyPostfix]
        private static void Postfix_SentryShotgunFire() {
            damage = 0;
            owner = null;
            sentry = false;
        }

        [HarmonyPatch(typeof(BulletWeapon), nameof(BulletWeapon.Fire))]
        [HarmonyPrefix]
        private static void Prefix_BulletWeaponFire(BulletWeapon __instance) {
            damage = __instance.ArchetypeData.GetDamageWithBoosterEffect(__instance.Owner, __instance.ItemDataBlock.inventorySlot);
            owner = __instance.Owner;
        }
        [HarmonyPatch(typeof(BulletWeapon), nameof(BulletWeapon.Fire))]
        [HarmonyPostfix]
        private static void Postfix_BulletWeaponFire(BulletWeapon __instance) {
            damage = 0;
            owner = null;
        }

        [HarmonyPatch(typeof(Shotgun), nameof(Shotgun.Fire))]
        [HarmonyPrefix]
        private static void Prefix_ShotgunFire(Shotgun __instance) {
            damage = __instance.ArchetypeData.GetDamageWithBoosterEffect(__instance.Owner, __instance.ItemDataBlock.inventorySlot);
            owner = __instance.Owner;
        }
        [HarmonyPatch(typeof(Shotgun), nameof(Shotgun.Fire))]
        [HarmonyPostfix]
        private static void Postfix_ShotgunFire() {
            damage = 0;
            owner = null;
        }

        [HarmonyPatch(typeof(BulletWeaponSynced), nameof(BulletWeaponSynced.Fire))]
        [HarmonyPrefix]
        private static void Prefix_BulletWeaponSyncFire(BulletWeaponSynced __instance) {
            autoTrack = false;
            damage = __instance.ArchetypeData.GetDamageWithBoosterEffect(__instance.Owner, __instance.ItemDataBlock.inventorySlot);
            owner = __instance.Owner;

            byte dimensionIndex = (byte)__instance.Owner.m_dimensionIndex;

            Transform alignTransform = __instance.MuzzleAlign;
            Vector3 fireDir = __instance.Owner.TargetLookDir;
            Vector3 vector = alignTransform.position;
            float maxRayDist = __instance.MaxRayDist;

            if (__instance.ArchetypeData.PiercingBullets) {
                int num2 = 5;
                int num3 = 0;
                bool flag = false;
                float num4 = 0f;
                int num5 = 0;
                while (!flag && num3 < num2 && maxRayDist > 0f && num5 < __instance.ArchetypeData.PiercingDamageCountLimit) {
                    if (Physics.Raycast(vector, fireDir, out RaycastHit hit, maxRayDist, LayerManager.MASK_BULLETWEAPON_RAY)) {
                        GameObject target = hit.collider.gameObject;
                        IDamageable? dam = null;
                        ColliderMaterial tempColliderInfo = target.GetComponent<ColliderMaterial>();
                        if (tempColliderInfo != null) {
                            dam = tempColliderInfo.Damageable;
                        }
                        if (dam == null) {
                            dam = target.GetComponent<IDamageable>();
                        }
                        bool hitEnemy = dam != null;
                        if (hitEnemy) {
                            num5++;
                        }
                        Replay.Trigger(new rGunshot(owner, damage, vector, hit.point, sentry));
                        flag = !hit.collider.gameObject.IsInLayerMask(LayerManager.MASK_BULLETWEAPON_PIERCING_PASS);
                        vector = hit.point + fireDir * 0.1f;
                        num4 += hit.distance;
                        maxRayDist -= hit.distance;
                    } else {
                        flag = true;
                    }
                    num3++;
                }
            } else if (Physics.Raycast(vector, fireDir, out RaycastHit hit, maxRayDist, LayerManager.MASK_BULLETWEAPON_RAY)) {
                Replay.Trigger(new rGunshot(owner, damage, vector, hit.point, sentry));
            }
        }
        [HarmonyPatch(typeof(BulletWeaponSynced), nameof(BulletWeaponSynced.Fire))]
        [HarmonyPostfix]
        private static void Postfix_BulletWeaponSyncFire() {
            damage = 0;
            autoTrack = true;
            owner = null;
        }

        [HarmonyPatch(typeof(ShotgunSynced), nameof(ShotgunSynced.Fire))]
        [HarmonyPrefix]
        private static void Prefix_ShotgunSyncFire(ShotgunSynced __instance) {
            autoTrack = false;
            damage = __instance.ArchetypeData.GetDamageWithBoosterEffect(__instance.Owner, __instance.ItemDataBlock.inventorySlot);
            owner = __instance.Owner;

            byte dimensionIndex = (byte)__instance.Owner.m_dimensionIndex;

            for (int i = 0; i < __instance.ArchetypeData.ShotgunBulletCount; i++) {
                float f = __instance.m_segmentSize * (float)i;
                float angOffsetX = 0f;
                float angOffsetY = 0f;
                if (i > 0) {
                    angOffsetX += (float)__instance.ArchetypeData.ShotgunConeSize * Mathf.Cos(f);
                    angOffsetY += (float)__instance.ArchetypeData.ShotgunConeSize * Mathf.Sin(f);
                }
                float randomSpread = __instance.ArchetypeData.ShotgunBulletSpread;
                Vector3 fireDir = __instance.Owner.TargetLookDir;
                float maxRayDist = __instance.MaxRayDist;

                Transform alignTransform = __instance.MuzzleAlign;
                Vector3 vector = alignTransform.position;

                Vector3 up = alignTransform.up;
                Vector3 right = alignTransform.right;
                if (Mathf.Abs(angOffsetX) > 0f) {
                    fireDir = Quaternion.AngleAxis(angOffsetX, up) * fireDir;
                }
                if (Mathf.Abs(angOffsetY) > 0f) {
                    fireDir = Quaternion.AngleAxis(angOffsetY, right) * fireDir;
                }
                if (randomSpread > 0f) {
                    Vector2 insideUnitCircle = UnityEngine.Random.insideUnitCircle;
                    insideUnitCircle *= randomSpread;
                    fireDir = Quaternion.AngleAxis(insideUnitCircle.x, up) * fireDir;
                    fireDir = Quaternion.AngleAxis(insideUnitCircle.y, right) * fireDir;
                }

                if (__instance.ArchetypeData.PiercingBullets) {
                    int num2 = 5;
                    int num3 = 0;
                    bool flag = false;
                    float num4 = 0f;
                    int num5 = 0;
                    while (!flag && num3 < num2 && maxRayDist > 0f && num5 < __instance.ArchetypeData.PiercingDamageCountLimit) {
                        if (Physics.Raycast(vector, fireDir, out RaycastHit hit, maxRayDist, LayerManager.MASK_BULLETWEAPON_RAY)) {
                            GameObject target = hit.collider.gameObject;
                            IDamageable? dam = null;
                            ColliderMaterial tempColliderInfo = target.GetComponent<ColliderMaterial>();
                            if (tempColliderInfo != null) {
                                dam = tempColliderInfo.Damageable;
                            }
                            if (dam == null) {
                                dam = target.GetComponent<IDamageable>();
                            }
                            bool hitEnemy = dam != null;
                            if (hitEnemy) {
                                num5++;
                            }
                            Replay.Trigger(new rGunshot(owner, damage, vector, hit.point, sentry));
                            flag = !hit.collider.gameObject.IsInLayerMask(LayerManager.MASK_BULLETWEAPON_PIERCING_PASS);
                            vector = hit.point + fireDir * 0.1f;
                            num4 += hit.distance;
                            maxRayDist -= hit.distance;
                        } else {
                            flag = true;
                        }
                        num3++;
                    }
                } else if (Physics.Raycast(vector, fireDir, out RaycastHit hit, maxRayDist, LayerManager.MASK_BULLETWEAPON_RAY)) {
                    Replay.Trigger(new rGunshot(owner, damage, vector, hit.point, sentry));
                }
            }
        }
        [HarmonyPatch(typeof(ShotgunSynced), nameof(ShotgunSynced.Fire))]
        [HarmonyPostfix]
        private static void Postfix_ShotgunSyncFire() {
            damage = 0;
            autoTrack = true;
            owner = null;
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
            if (!autoTrack) return;

            // NOTE(randomuserhi): glushot is used to ignore cfoam since it also uses weapon ray cast
            if (__result && !glueShot) {
                if (owner == null) throw new NullReferenceException("Owner of gunshot was not found.");

                Replay.Trigger(new rGunshot(owner, damage, originPos, weaponRayData.rayHit.point, sentry));
            }
        }
    }
}
