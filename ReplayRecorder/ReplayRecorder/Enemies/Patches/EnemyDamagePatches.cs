using Agents;
using API;
using Enemies;
using HarmonyLib;
using Player;
using ReplayRecorder.Mines.Patches;
using ReplayRecorder.Player;

namespace ReplayRecorder.Enemies.Patches {
    [HarmonyPatch]
    class EnemyDamagePatches {
        [HarmonyPatch(typeof(Dam_EnemyDamageBase), nameof(Dam_EnemyDamageBase.ReceiveBulletDamage))]
        [HarmonyPrefix]
        private static void Prefix_BulletDamage(Dam_EnemyDamageBase __instance, pBulletDamageData data) {
            //if (!SNet.IsMaster) return;

            EnemyAgent owner = __instance.Owner;

            // Record damage data
            Agent sourceAgent;
            if (data.source.TryGet(out sourceAgent)) {
                float damage = AgentModifierManager.ApplyModifier(owner, AgentModifier.ProjectileResistance, data.damage.Get(__instance.HealthMax));
                //bool willDie = __instance.Health <= 0 && damage > 0;

                PlayerAgent? p = sourceAgent.TryCast<PlayerAgent>();
                if (p == null) // Check damage was done by a player
                {
                    APILogger.Debug($"Could not find PlayerAgent, damage was done by agent of type: {sourceAgent.m_type}.");
                    return;
                }

                if (!PlayerSentry.sentryShot) // Damage done by weapon
                {
                    EnemyDamage.OnBulletDamage(__instance.Owner, p, damage);
                } else if (PlayerSentry.sentryName != null) // Damage done by sentry
                  {
                    EnemyDamage.OnBulletDamage(__instance.Owner, p, damage, true);
                } else APILogger.Debug($"Sentry name was null, this should not happen.");
            } else APILogger.Debug($"Unable to find source agent.");
        }

        [HarmonyPatch(typeof(Dam_EnemyDamageBase), nameof(Dam_EnemyDamageBase.ReceiveMeleeDamage))]
        [HarmonyPrefix]
        private static void Prefix_MeleeDamage(Dam_EnemyDamageBase __instance, pFullDamageData data) {
            //if (!SNet.IsMaster) return;

            EnemyAgent owner = __instance.Owner;

            // Record damage data
            Agent sourceAgent;
            if (data.source.TryGet(out sourceAgent)) {
                float num = data.damage.Get(__instance.DamageMax);
                float damage = AgentModifierManager.ApplyModifier(owner, AgentModifier.MeleeResistance, num);
                if (owner.Locomotion.CurrentStateEnum == ES_StateEnum.Hibernate) {
                    damage *= data.sleeperMulti.Get(10f);
                }

                PlayerAgent? p = sourceAgent.TryCast<PlayerAgent>();
                if (p == null) // Check damage was done by a player
                {
                    if (ConfigManager.Debug) APILogger.Debug($"Could not find PlayerAgent, damage was done by agent of type: {sourceAgent.m_type}.");
                    return;
                }

                // Get weapon used
                ItemEquippable currentEquipped = p.Inventory.WieldedItem;
                if (!currentEquipped.IsWeapon && !currentEquipped.CanReload) {
                    EnemyDamage.OnMeleeDamage(__instance.Owner, p, damage);
                } else APILogger.Debug($"Currently equipped is not a melee weapon, this should not happen.\nIsWeapon: {currentEquipped.IsWeapon}\nCanReload: {currentEquipped.CanReload}");
            } else APILogger.Debug($"Unable to find source agent.");
        }

        [HarmonyPatch(typeof(Dam_EnemyDamageBase), nameof(Dam_EnemyDamageBase.ReceiveExplosionDamage))]
        [HarmonyPrefix]
        public static void Prefix_ExplosionDamage(Dam_EnemyDamageBase __instance, pExplosionDamageData data) {
            if (!SNetwork.SNet.IsMaster) return;

            if (MinePatches.currentMine != null) {
                float damage = data.damage.Get(__instance.HealthMax);
                // NOTE(randomuserhi): When player disconnects and their mine blows up enemies, this creates a race condition
                //                     since the player no longer exists for the owner (slot index) to be valid
                //                     This isn't an issue for other damage types since they require the owner to be connected
                //                     but for mines this is not the case.
                //                     To fix this, store the owner as an instanceID instead.
                PlayerAgent p = PlayerManager.PlayerAgentsInLevel[MinePatches.currentMine.owner];
                if (MinePatches.currentMine.player != null) {
                    p = MinePatches.currentMine.player;
                }
                EnemyDamage.OnMineDamage(__instance.Owner, p, damage);
            } else APILogger.Debug($"Unable to find source mine for explosion damage.");
        }
    }
}
