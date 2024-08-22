using Agents;
using API;
using Enemies;
using HarmonyLib;
using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using SNetwork;
using UnityEngine;
using Vanilla.Mines;

namespace Vanilla.StatTracker {
    [HarmonyPatch]
    [ReplayData("Vanilla.StatTracker.Damage", "0.0.1")]
    internal class rDamage : ReplayEvent {
        [HarmonyPatch]
        private static class Patches {
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
            [HarmonyPrefix]
            public static void Prefix_PlayerReceiveFallDamage(Dam_PlayerDamageBase __instance, pMiniDamageData data) {
                if (!SNet.IsMaster) return;

                float damage = data.damage.Get(__instance.HealthMax);
                Replay.Trigger(new rDamage(__instance.Owner, __instance.Owner, rDamage.Type.Fall, Mathf.Min(__instance.Health, damage)));
            }

            [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ReceiveTentacleAttackDamage))]
            [HarmonyPrefix]
            public static void Prefix_PlayerReceiveTentacleAttackDamage(Dam_PlayerDamageBase __instance, pMediumDamageData data) {
                if (!SNet.IsMaster) return;
                if (!__instance.Owner.Alive) return;

                float damage = data.damage.Get(__instance.HealthMax);
                if (data.source.TryGet(out Agent source)) {
                    damage = AgentModifierManager.ApplyModifier(source, AgentModifier.MeleeDamage, damage);
                }
                damage = AgentModifierManager.ApplyModifier(__instance.Owner, AgentModifier.MeleeResistance, damage);
                Replay.Trigger(new rDamage(__instance.Owner, source, rDamage.Type.Tongue, Mathf.Min(__instance.Health, damage)));
            }

            [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ReceiveShooterProjectileDamage))]
            [HarmonyPrefix]
            public static void Prefix_PlayerReceiveShooterProjectileDamage(Dam_PlayerDamageBase __instance, pMediumDamageData data) {
                if (!SNet.IsMaster) return;
                if (!__instance.Owner.Alive) return;

                float damage = data.damage.Get(__instance.HealthMax);
                if (data.source.TryGet(out Agent source)) {
                    damage = AgentModifierManager.ApplyModifier(source, AgentModifier.StandardWeaponDamage, damage);
                }
                damage = AgentModifierManager.ApplyModifier(__instance.Owner, AgentModifier.ProjectileResistance, damage);
                Replay.Trigger(new rDamage(__instance.Owner, __instance.Owner, rDamage.Type.Projectile, Mathf.Min(__instance.Health, damage)));
            }

            [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ReceiveExplosionDamage))]
            [HarmonyPrefix]
            public static void Prefix_PlayerReceiveExplosionDamage(Dam_PlayerDamageBase __instance, pExplosionDamageData data) {
                if (!SNet.IsMaster) return;
                if (!__instance.Owner.Alive) return;

                if (MineManager.currentDetonateEvent != null) {
                    float damage = data.damage.Get(__instance.HealthMax);
                    Replay.Trigger(new rDamage(__instance.Owner, MineManager.currentDetonateEvent.id, rDamage.Type.Explosive, Mathf.Min(__instance.Health, damage)));
                }
            }

            [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ReceiveMeleeDamage))]
            [HarmonyPrefix]
            public static void Prefix_PlayerReceiveMeleeDamage(Dam_PlayerDamageBase __instance, pFullDamageData data) {
                if (!SNet.IsMaster) return;
                if (!__instance.Owner.Alive) return;

                if (data.source.TryGet(out Agent source)) {
                    float damage = AgentModifierManager.ApplyModifier(source, AgentModifier.MeleeDamage, data.damage.Get(__instance.DamageMax));
                    Replay.Trigger(new rDamage(__instance.Owner, source, rDamage.Type.Melee, Mathf.Min(__instance.Health, damage)));
                }
            }

            [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ReceiveBulletDamage))]
            [HarmonyPrefix]
            public static void Prefix_PlayerReceiveBulletDamage(Dam_PlayerDamageBase __instance, pBulletDamageData data) {
                if (!SNet.IsMaster) return;
                if (!__instance.Owner.Alive) return;

                if (data.source.TryGet(out Agent source)) {
                    Identifier gear = Identifier.unknown;
                    PlayerAgent? player = source.TryCast<PlayerAgent>();
                    if (player != null) {
                        if (!sentry) {
                            // Get weapon used
                            ItemEquippable currentEquipped = player.Inventory.WieldedItem;
                            if (currentEquipped.IsWeapon && currentEquipped.CanReload) {
                                gear = Identifier.From(currentEquipped);
                            }
                        } else {
                            // Get sentry used
                            gear = Identifier.From(PlayerBackpackManager.GetItem(player.Owner, InventorySlot.GearClass));
                        }
                    }
                    float damage = data.damage.Get(__instance.HealthMax);
                    APILogger.Debug($"{__instance.Owner.Owner.NickName} was hit by {source.Cast<PlayerAgent>().Owner.NickName} -> {damage}");
                    Replay.Trigger(new rDamage(__instance.Owner, source, rDamage.Type.Bullet, Mathf.Min(__instance.Health, damage), gear, sentry));
                }
            }

            [HarmonyPatch(typeof(Dam_PlayerDamageLocal), nameof(Dam_PlayerDamageLocal.ReceiveBulletDamage))]
            [HarmonyPrefix]
            public static void Prefix_PlayerLocalReceiveBulletDamage(Dam_PlayerDamageBase __instance, pBulletDamageData data) {
                if (!SNet.IsMaster) return;
                if (!__instance.Owner.Alive) return;

                if (data.source.TryGet(out Agent source)) {
                    Identifier gear = Identifier.unknown;
                    PlayerAgent? player = source.TryCast<PlayerAgent>();
                    if (player != null) {
                        if (!sentry) {
                            // Get weapon used
                            ItemEquippable currentEquipped = player.Inventory.WieldedItem;
                            if (currentEquipped.IsWeapon && currentEquipped.CanReload) {
                                gear = Identifier.From(currentEquipped);
                            }
                        } else {
                            // Get sentry used
                            gear = Identifier.From(PlayerBackpackManager.GetItem(player.Owner, InventorySlot.GearClass));
                        }
                    }
                    float damage = data.damage.Get(__instance.HealthMax);
                    APILogger.Debug($"{__instance.Owner.Owner.NickName} was hit by {source.Cast<PlayerAgent>().Owner.NickName} -> {damage}");
                    Replay.Trigger(new rDamage(__instance.Owner, source, rDamage.Type.Bullet, Mathf.Min(__instance.Health, damage), gear, sentry));
                }
            }

            [HarmonyPatch(typeof(Dam_PlayerDamageLocal), nameof(Dam_PlayerDamageLocal.ReceiveExplosionDamage))]
            [HarmonyPrefix]
            public static void Prefix_PlayerLocalReceiveExplosionDamage(Dam_PlayerDamageBase __instance, pExplosionDamageData data) {
                if (!SNet.IsMaster) return;
                if (!__instance.Owner.Alive) return;

                APILogger.Debug($"local explosive");
                if (MineManager.currentDetonateEvent != null) {
                    float damage = data.damage.Get(__instance.HealthMax);
                    Replay.Trigger(new rDamage(__instance.Owner, MineManager.currentDetonateEvent.id, rDamage.Type.Explosive, Mathf.Min(__instance.Health, damage)));
                }
            }

            [HarmonyPatch(typeof(Dam_EnemyDamageBase), nameof(Dam_EnemyDamageBase.ReceiveExplosionDamage))]
            [HarmonyPrefix]
            public static void Prefix_EnemyReceiveExplosionDamage(Dam_EnemyDamageBase __instance, pExplosionDamageData data) {
                if (!SNet.IsMaster) return;
                if (!__instance.Owner.Alive) return;

                if (MineManager.currentDetonateEvent != null) {
                    float damage = data.damage.Get(__instance.HealthMax);
                    float stagger = damage;
                    float remainingStaggerDamage = __instance.Owner.EnemyBalancingData.Health.DamageUntilHitreact - __instance.m_damBuildToHitreact;
                    if (remainingStaggerDamage < 0) remainingStaggerDamage = 0;

                    damage = Mathf.Min(__instance.Health, damage);
                    stagger = HandlePouncerStagger(__instance, damage, Mathf.Min(remainingStaggerDamage, stagger));
                    Replay.Trigger(new rDamage(__instance.Owner, MineManager.currentDetonateEvent.id, rDamage.Type.Explosive, damage, false, stagger));
                } else {
                    APILogger.Error("Unable to find detonation event. This should not happen.");
                }
            }

            [HarmonyPatch(typeof(Dam_EnemyDamageBase), nameof(Dam_EnemyDamageBase.ReceiveMeleeDamage))]
            [HarmonyPrefix]
            public static void Prefix_EnemyReceiveMeleeDamage(Dam_EnemyDamageBase __instance, pFullDamageData data) {
                if (!SNet.IsMaster) return;
                if (!__instance.Owner.Alive) return;

                if (data.source.TryGet(out Agent source)) {
                    Identifier gear = Identifier.unknown;
                    PlayerAgent? player = source.TryCast<PlayerAgent>();
                    if (player != null) {
                        // Get weapon used
                        ItemEquippable currentEquipped = player.Inventory.WieldedItem;
                        if (currentEquipped.IsWeapon && currentEquipped.CanReload) {
                            gear = Identifier.From(currentEquipped);
                        }
                    }

                    float damage = AgentModifierManager.ApplyModifier(source, AgentModifier.MeleeDamage, data.damage.Get(__instance.DamageMax));
                    float stagger = damage * data.staggerMulti.Get(10f);
                    float remainingStaggerDamage = __instance.Owner.EnemyBalancingData.Health.DamageUntilHitreact - __instance.m_damBuildToHitreact;
                    if (remainingStaggerDamage < 0) remainingStaggerDamage = 0;

                    damage = Mathf.Min(__instance.Health, damage);
                    stagger = HandlePouncerStagger(__instance, damage, Mathf.Min(remainingStaggerDamage, stagger));
                    Replay.Trigger(new rDamage(__instance.Owner, source, rDamage.Type.Melee, damage, gear, false, stagger));
                }
            }

            [HarmonyPatch(typeof(Dam_EnemyDamageBase), nameof(Dam_EnemyDamageBase.ReceiveBulletDamage))]
            [HarmonyPrefix]
            public static void Prefix_EnemyReceiveBulletDamage(Dam_EnemyDamageBase __instance, pBulletDamageData data) {
                if (!SNet.IsMaster) return;
                if (!__instance.Owner.Alive) return;

                if (data.source.TryGet(out Agent source)) {
                    Identifier gear = Identifier.unknown;
                    PlayerAgent? player = source.TryCast<PlayerAgent>();
                    if (player != null) {
                        if (!sentry) {
                            // Get weapon used
                            ItemEquippable currentEquipped = player.Inventory.WieldedItem;
                            if (currentEquipped.IsWeapon && currentEquipped.CanReload) {
                                gear = Identifier.From(currentEquipped);
                            }
                        } else {
                            // Get sentry used
                            gear = Identifier.From(PlayerBackpackManager.GetItem(player.Owner, InventorySlot.GearClass));
                        }
                    }
                    float damage = AgentModifierManager.ApplyModifier(__instance.Owner, AgentModifier.ProjectileResistance, data.damage.Get(__instance.HealthMax));
                    float stagger = damage * data.staggerMulti.Get(10f);
                    float remainingStaggerDamage = __instance.Owner.EnemyBalancingData.Health.DamageUntilHitreact - __instance.m_damBuildToHitreact;
                    if (remainingStaggerDamage < 0) remainingStaggerDamage = 0;

                    damage = Mathf.Min(__instance.Health, damage);
                    stagger = HandlePouncerStagger(__instance, damage, Mathf.Min(remainingStaggerDamage, stagger));
                    Replay.Trigger(new rDamage(__instance.Owner, source, rDamage.Type.Bullet, damage, gear, sentry, stagger));
                }
            }

            private static float HandlePouncerStagger(Dam_EnemyDamageBase __instance, float damage, float stagger) {
                PouncerBehaviour? pouncerBehaviour = __instance.Owner.GetComponent<PouncerBehaviour>();
                // Not a pouncer
                if (pouncerBehaviour == null) return stagger;

                if (pouncerBehaviour.CurrentState.ENUM_ID == pouncerBehaviour.Dash.ENUM_ID || pouncerBehaviour.CurrentState.ENUM_ID == pouncerBehaviour.Charge.ENUM_ID) {
                    return damage;
                } else {
                    // Cannot be staggered when not in dash state
                    return 0;
                }
            }
        }

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

        private Identifier gear;
        private bool sentry;

        private float damage;
        private float staggerDamage;

        public rDamage(Agent target, Agent source, Type type, float damage, Identifier gear, bool sentry = false, float staggerMulti = 0) {
            this.type = type;
            this.source = source.GlobalID;
            this.target = target.GlobalID;
            this.gear = gear;
            this.damage = damage;
            this.staggerDamage = staggerMulti;
            this.sentry = sentry;
        }

        public rDamage(Agent target, int source, Type type, float damage, Identifier gear, bool sentry = false, float staggerMulti = 0) {
            this.type = type;
            this.source = source;
            this.target = target.GlobalID;
            this.gear = gear;
            this.damage = damage;
            this.staggerDamage = staggerMulti;
            this.sentry = sentry;
        }

        public rDamage(ushort target, int source, Type type, float damage, Identifier gear, bool sentry = false, float staggerMulti = 0) {
            this.type = type;
            this.source = source;
            this.target = target;
            this.gear = gear;
            this.damage = damage;
            this.staggerDamage = staggerMulti;
            this.sentry = sentry;
        }

        public rDamage(Agent target, Agent source, Type type, float damage, bool sentry = false, float staggerMulti = 0) {
            this.type = type;
            this.source = source.GlobalID;
            this.target = target.GlobalID;
            gear = Identifier.unknown;
            this.damage = damage;
            this.staggerDamage = staggerMulti;
            this.sentry = sentry;
        }

        public rDamage(Agent target, int source, Type type, float damage, bool sentry = false, float staggerMulti = 0) {
            this.type = type;
            this.source = source;
            this.target = target.GlobalID;
            gear = Identifier.unknown;
            this.damage = damage;
            this.staggerDamage = staggerMulti;
            this.sentry = sentry;
        }

        public rDamage(ushort target, int source, Type type, float damage, bool sentry = false, float staggerMulti = 0) {
            this.type = type;
            this.source = source;
            this.target = target;
            gear = Identifier.unknown;
            this.damage = damage;
            this.staggerDamage = staggerMulti;
            this.sentry = sentry;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes((byte)type, buffer);
            BitHelper.WriteBytes(source, buffer);
            BitHelper.WriteBytes(target, buffer);
            BitHelper.WriteHalf(damage, buffer);
            BitHelper.WriteBytes(gear, buffer);
            BitHelper.WriteBytes(sentry, buffer);
            BitHelper.WriteHalf(staggerDamage, buffer);
        }
    }
}
