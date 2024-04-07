using Agents;
using HarmonyLib;
using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using SNetwork;
using Vanilla.Mine;
using Vanilla.Specification;

namespace Vanilla.StatTracker.Damage {
    [HarmonyPatch]
    internal class Patches {
        private static bool sentry = false;
        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.FireBullet))]
        [HarmonyPrefix]
        private static void Prefix_SentryGunFire(SentryGunInstance_Firing_Bullets __instance, bool doDamage, bool targetIsTagged) {
            sentry = true;
        }
        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.FireBullet))]
        [HarmonyPostfix]
        private static void Postfix_SentryGunFire() {
            sentry = false;
        }
        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.UpdateFireShotgunSemi))]
        [HarmonyPrefix]
        private static void Prefix_SentryShotgunFire(SentryGunInstance_Firing_Bullets __instance, bool isMaster, bool targetIsTagged) {
            sentry = true;
        }
        [HarmonyPatch(typeof(SentryGunInstance_Firing_Bullets), nameof(SentryGunInstance_Firing_Bullets.UpdateFireShotgunSemi))]
        [HarmonyPostfix]
        private static void Postfix_SentryShotgunFire() {
            sentry = false;
        }

        [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ReceiveFallDamage))]
        [HarmonyPostfix]
        public static void Postfix_PlayerReceiveFallDamage(Dam_PlayerDamageBase __instance, pMiniDamageData data) {
            if (!SNet.IsMaster) return;

            Replay.Trigger(new rDamage(__instance.Owner, __instance.Owner, rDamage.Type.Fall, data.damage.Get(__instance.HealthMax)));
        }

        [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ReceiveTentacleAttackDamage))]
        [HarmonyPostfix]
        public static void Postfix_PlayerReceiveTentacleAttackDamage(Dam_PlayerDamageBase __instance, pMediumDamageData data) {
            if (!SNet.IsMaster) return;

            float damage = data.damage.Get(__instance.HealthMax);
            if (data.source.TryGet(out Agent source)) {
                damage = AgentModifierManager.ApplyModifier(source, AgentModifier.MeleeDamage, damage);
            }
            damage = AgentModifierManager.ApplyModifier(__instance.Owner, AgentModifier.MeleeResistance, damage);
            Replay.Trigger(new rDamage(__instance.Owner, source, rDamage.Type.Tongue, damage));
        }

        [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ReceiveShooterProjectileDamage))]
        [HarmonyPostfix]
        public static void Postfix_PlayerReceiveShooterProjectileDamage(Dam_PlayerDamageBase __instance, pMediumDamageData data) {
            if (!SNet.IsMaster) return;

            float damage = data.damage.Get(__instance.HealthMax);
            if (data.source.TryGet(out Agent source)) {
                damage = AgentModifierManager.ApplyModifier(source, AgentModifier.StandardWeaponDamage, damage);
            }
            damage = AgentModifierManager.ApplyModifier(__instance.Owner, AgentModifier.ProjectileResistance, damage);
            Replay.Trigger(new rDamage(__instance.Owner, __instance.Owner, rDamage.Type.Projectile, damage));
        }

        [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ReceiveExplosionDamage))]
        [HarmonyPostfix]
        public static void Postfix_PlayerReceiveExplosionDamage(Dam_PlayerDamageBase __instance, pExplosionDamageData data) {
            if (!SNet.IsMaster) return;

            Replay.Trigger(new rDamage(__instance.Owner, __instance.Owner, rDamage.Type.Explosive, data.damage.Get(__instance.HealthMax)));
        }

        [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ReceiveMeleeDamage))]
        [HarmonyPostfix]
        public static void Postfix_PlayerReceiveMeleeDamage(Dam_PlayerDamageBase __instance, pFullDamageData data) {
            if (!SNet.IsMaster) return;

            if (data.source.TryGet(out Agent source)) {
                Replay.Trigger(new rDamage(__instance.Owner, source, rDamage.Type.Melee, AgentModifierManager.ApplyModifier(source, AgentModifier.MeleeDamage, data.damage.Get(__instance.DamageMax))));
            }
        }

        [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ReceiveBulletDamage))]
        [HarmonyPostfix]
        public static void Postfix_PlayerReceiveBulletDamage(Dam_PlayerDamageBase __instance, pBulletDamageData data) {
            if (!SNet.IsMaster) return;

            if (data.source.TryGet(out Agent source)) {
                ushort gear = 0;
                PlayerAgent? player = source.TryCast<PlayerAgent>();
                if (player != null) {
                    // Get weapon used
                    ItemEquippable currentEquipped = player.Inventory.WieldedItem;
                    if (currentEquipped.IsWeapon && currentEquipped.CanReload) {
                        gear = GTFOSpecification.GetGear(currentEquipped.GearIDRange.PublicGearName);
                    }
                }
                Replay.Trigger(new rDamage(__instance.Owner, source, rDamage.Type.Bullet, data.damage.Get(__instance.HealthMax), gear, sentry));
            }
        }

        [HarmonyPatch(typeof(Dam_EnemyDamageBase), nameof(Dam_EnemyDamageBase.ReceiveExplosionDamage))]
        [HarmonyPostfix]
        public static void Postfix_EnemyReceiveExplosionDamage(Dam_EnemyDamageBase __instance, pExplosionDamageData data) {
            if (!SNet.IsMaster) return;

            if (MineManager.currentDetonateEvent != null) {
                Replay.Trigger(new rDamage(__instance.Owner, MineManager.currentDetonateEvent.id, rDamage.Type.Explosive, data.damage.Get(__instance.HealthMax)));
            }
        }

        [HarmonyPatch(typeof(Dam_EnemyDamageBase), nameof(Dam_EnemyDamageBase.ReceiveMeleeDamage))]
        [HarmonyPostfix]
        public static void Postfix_EnemyReceiveMeleeDamage(Dam_EnemyDamageBase __instance, pFullDamageData data) {
            if (!SNet.IsMaster) return;

            if (data.source.TryGet(out Agent source)) {
                Replay.Trigger(new rDamage(__instance.Owner, source, rDamage.Type.Melee, AgentModifierManager.ApplyModifier(source, AgentModifier.MeleeDamage, data.damage.Get(__instance.DamageMax))));
            }
        }

        [HarmonyPatch(typeof(Dam_EnemyDamageBase), nameof(Dam_EnemyDamageBase.ReceiveBulletDamage))]
        [HarmonyPostfix]
        public static void Postfix_EnemyReceiveBulletDamage(Dam_EnemyDamageBase __instance, pBulletDamageData data) {
            if (!SNet.IsMaster) return;

            if (data.source.TryGet(out Agent source)) {
                ushort gear = 0;
                PlayerAgent? player = source.TryCast<PlayerAgent>();
                if (player != null) {
                    // Get weapon used
                    ItemEquippable currentEquipped = player.Inventory.WieldedItem;
                    if (currentEquipped.IsWeapon && currentEquipped.CanReload) {
                        gear = GTFOSpecification.GetGear(currentEquipped.GearIDRange.PublicGearName);
                    }
                }
                float damage = AgentModifierManager.ApplyModifier(__instance.Owner, AgentModifier.ProjectileResistance, data.damage.Get(__instance.HealthMax));
                Replay.Trigger(new rDamage(__instance.Owner, source, rDamage.Type.Bullet, damage, gear, sentry, data.staggerMulti.Get(10f)));
            }
        }
    }

    [ReplayData("Vanilla.StatTracker.Damage", "0.0.1")]
    internal class rDamage : ReplayEvent {
        public enum Type {
            Bullet,
            Explosive,
            Melee,
            Projectile,
            Tongue,
            Fall
        }

        private Type type;

        private int source;
        private ushort target;

        private ushort gear;
        private bool sentry;

        private float damage;
        private float staggerMulti;

        public rDamage(Agent target, Agent source, Type type, float damage, ushort gear = 0, bool sentry = false, float staggerMulti = 0) {
            this.type = type;
            this.source = source.GlobalID;
            this.target = target.GlobalID;
            this.gear = gear;
            this.damage = damage;
            this.staggerMulti = staggerMulti;
            this.sentry = sentry;
        }

        public rDamage(Agent target, int source, Type type, float damage, ushort gear = 0, bool sentry = false, float staggerMulti = 0) {
            this.type = type;
            this.source = source;
            this.target = target.GlobalID;
            this.gear = gear;
            this.damage = damage;
            this.staggerMulti = staggerMulti;
            this.sentry = sentry;
        }

        public rDamage(ushort target, int source, Type type, float damage, ushort gear = 0, bool sentry = false, float staggerMulti = 0) {
            this.type = type;
            this.source = source;
            this.target = target;
            this.gear = gear;
            this.damage = damage;
            this.staggerMulti = staggerMulti;
            this.sentry = sentry;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes((byte)type, buffer);
            BitHelper.WriteBytes(source, buffer);
            BitHelper.WriteBytes(target, buffer);
            BitHelper.WriteHalf(damage, buffer);
            BitHelper.WriteBytes(gear, buffer);
            BitHelper.WriteBytes(sentry, buffer);
            BitHelper.WriteHalf(staggerMulti, buffer);
        }
    }
}
