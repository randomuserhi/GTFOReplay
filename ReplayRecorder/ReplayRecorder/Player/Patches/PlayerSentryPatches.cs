using API;
using HarmonyLib;
using SNetwork;

namespace ReplayRecorder.Player.Patches {
    [HarmonyPatch]
    internal class PlayerSentryPatches {
        [HarmonyPatch(typeof(SentryGunInstance), nameof(SentryGunInstance.OnSpawn))]
        [HarmonyPostfix]
        private static void OnSpawn(SentryGunInstance __instance, pGearSpawnData spawnData) {
            if (spawnData.owner.TryGetPlayer(out SNet_Player player)) {
                PlayerSentry.SpawnSentry(player, __instance, spawnData.position);
            } else APILogger.Error($"Sentry had no player as owner.");
        }

        [HarmonyPatch(typeof(SentryGunInstance), nameof(SentryGunInstance.OnDespawn))]
        [HarmonyPostfix]
        private static void OnDespawn(SentryGunInstance __instance) {
            PlayerSentry.DespawnSentry(__instance);
        }

        private static bool CompatabilityLayer_HelAutoSentryFix_Installed = false;
        public static void CompatabilityLayer_HelAutoSentryFix() {
            CompatabilityLayer_HelAutoSentryFix_Installed = true;
            HelSentryFix.SentryFirePatches.anySentryFire_Prefix += _Prefix_SentryGunFire;
            HelSentryFix.SentryFirePatches.anySentryFire_Postfix += (SentryGunInstance_Firing_Bullets _, bool _, bool _) => {
                _Postfix_SentryGunFire();
            };
        }
        private static void _Prefix_SentryGunFire(SentryGunInstance_Firing_Bullets __instance, bool doDamage, bool targetIsTagged) {
            if (!doDamage) return;

            PlayerSentry.sentryName = __instance.ArchetypeData.PublicName;
            var instance = __instance.GetComponent<SentryGunInstance>();
            if (instance != null) {
                PlayerSentry.sentryName = instance.PublicName;
            } else APILogger.Debug($"Could not find sentry gun instance, this should not happen.");
            PlayerSentry.sentryShot = true;
        }
        private static void _Postfix_SentryGunFire() {
            PlayerSentry.sentryName = null;
            PlayerSentry.sentryShot = false;
        }

        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.FireBullet))]
        [HarmonyPrefix]
        private static void Prefix_SentryGunFiringBullet(SentryGunInstance_Firing_Bullets __instance, bool doDamage, bool targetIsTagged) {
            if (CompatabilityLayer_HelAutoSentryFix_Installed) return;
            _Prefix_SentryGunFire(__instance, doDamage, targetIsTagged);
        }
        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.FireBullet))]
        [HarmonyPostfix]
        private static void Postfix_SentryGunFiringBullet() {
            if (CompatabilityLayer_HelAutoSentryFix_Installed) return;
            _Postfix_SentryGunFire();
        }

        // Special case for shotgun sentry
        private static bool shotgunSentryShot = false;
        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.UpdateFireShotgunSemi))]
        [HarmonyPrefix]
        private static void Prefix_ShotgunSentryFiring(SentryGunInstance_Firing_Bullets __instance, bool isMaster, bool targetIsTagged) {
            if (CompatabilityLayer_HelAutoSentryFix_Installed) return;

            if (!isMaster) return;
            if (!(Clock.Time > __instance.m_fireBulletTimer)) return;

            shotgunSentryShot = true;
            _Postfix_SentryGunFire();
        }
        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.UpdateFireShotgunSemi))]
        [HarmonyPostfix]
        private static void Postfix_ShotgunSentryFiring() {
            if (CompatabilityLayer_HelAutoSentryFix_Installed) return;

            if (!shotgunSentryShot) return;

            shotgunSentryShot = false;
            _Postfix_SentryGunFire();
        }
    }
}
