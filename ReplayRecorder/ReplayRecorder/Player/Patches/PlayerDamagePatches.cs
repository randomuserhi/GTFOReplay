using Agents;
using API;
using Enemies;
using HarmonyLib;
using Player;
using ReplayRecorder.Enemies;
using SNetwork;
using UnityEngine;

namespace ReplayRecorder.Player.Patches {
    [HarmonyPatch]
    class PlayerDamagePatches {
        [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ReceiveFallDamage))]
        [HarmonyPrefix]
        private static void ReceiveFallDamage(Dam_PlayerDamageBase __instance, pMiniDamageData data) {
            //if (!SNet.IsMaster) return;

            PlayerDamage.OnFallDamage(__instance.Owner, data.damage.Get(__instance.HealthMax));
        }

        [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ReceiveTentacleAttackDamage))]
        [HarmonyPrefix]
        private static void Prefix_ReceiveTentacleAttackDamage(Dam_PlayerDamageBase __instance, pMediumDamageData data) {
            //if (!SNet.IsMaster) return;

            if (data.source.TryGet(out Agent sourceAgent)) {
                // Get enemy agent
                EnemyAgent? e = sourceAgent.TryCast<EnemyAgent>();
                if (e == null) // Check damage was done by an enemy
                {
                    APILogger.Debug($"Could not find EnemyAgent, damage was done by agent of type: {sourceAgent.m_type.ToString()}.");
                    return;
                }

                float damage = data.damage.Get(__instance.HealthMax);
                damage = AgentModifierManager.ApplyModifier(sourceAgent, AgentModifier.MeleeDamage, damage);

                if (tongue != null)
                    PlayerDamage.OnTongueDamage(__instance.Owner, damage, e, tongue);
                else if (SNet.IsMaster) APILogger.Error("Could not find tongue player was hit by as master, this should not happen.");
            }

            tongue = null;
        }

        [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ReceiveMeleeDamage))]
        [HarmonyPrefix]
        private static void ReceiveMeleeDamage(Dam_PlayerDamageBase __instance, pFullDamageData data) {
            //if (!SNet.IsMaster) return;

            if (data.source.TryGet(out Agent sourceAgent)) {
                // Get enemy agent
                EnemyAgent? e = sourceAgent.TryCast<EnemyAgent>();
                if (e == null) // Check damage was done by an enemy
                {
                    APILogger.Debug($"Could not find EnemyAgent, damage was done by agent of type: {sourceAgent.m_type.ToString()}.");
                    return;
                }

                float damage = data.damage.Get(__instance.DamageMax);
                damage = AgentModifierManager.ApplyModifier(sourceAgent, AgentModifier.MeleeDamage, damage);

                PlayerDamage.OnMeleeDamage(__instance.Owner, damage, e);
            }
        }

        [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ReceiveShooterProjectileDamage))]
        [HarmonyPrefix]
        private static void ReceivePelletDamage(Dam_PlayerDamageBase __instance, pMediumDamageData data) {
            // TODO(randomuserhi): Get closest enemy agent to be owner of pellet
            //                     Use a sphere cast / spatial partition to do so
            //                     Then I can remove this IsMaster check
            if (!SNet.IsMaster) return;

            if (data.source.TryGet(out Agent sourceAgent)) {
                // Get enemy agent
                EnemyAgent? e = sourceAgent.TryCast<EnemyAgent>();
                if (e == null) // Check damage was done by an enemy
                {
                    APILogger.Debug($"Could not find EnemyAgent, damage was done by agent of type: {sourceAgent.m_type.ToString()}.");
                    return;
                }

                float damage = data.damage.Get(__instance.HealthMax);
                damage = AgentModifierManager.ApplyModifier(sourceAgent, AgentModifier.StandardWeaponDamage, damage);

                PlayerDamage.OnPelletDamage(__instance.Owner, damage, e);
            }
        }

        // Tracking dodged shooter pellets
        private static bool wasTargeting = false;
        private static ulong player = 0;
        [HarmonyPatch(typeof(ProjectileTargeting), nameof(ProjectileTargeting.Update))]
        [HarmonyPrefix]
        private static void Prefix_Update(ProjectileTargeting __instance) {
            // TODO(randomuserhi): Get closest enemy agent to be owner of pellet
            //                     Use a sphere cast / spatial partition to do so
            //                     Then I can remove this IsMaster check
            if (!SNet.IsMaster) return;

            int instanceID = __instance.gameObject.GetInstanceID();

            if (Enemy.pellets.ContainsKey(instanceID)) {
                wasTargeting = false;
                if (__instance.m_isTargeting && __instance.m_playerTarget != null) {
                    wasTargeting = true;
                    player = __instance.m_playerTarget.Owner.Lookup;
                }
            }
        }
        [HarmonyPatch(typeof(ProjectileTargeting), nameof(ProjectileTargeting.Update))]
        [HarmonyPostfix]
        private static void Postfix_Update(ProjectileTargeting __instance) {
            // TODO(randomuserhi): Get closest enemy agent to be owner of pellet
            //                     Use a sphere cast / spatial partition to do so
            //                     Then I can remove this IsMaster check
            if (!SNet.IsMaster) return;

            int instanceID = __instance.gameObject.GetInstanceID();

            if (Enemy.pellets.ContainsKey(instanceID)) {
                if (!__instance.m_isTargeting && wasTargeting) {
                    PlayerAgent target = __instance.m_playerTarget;
                    if (__instance.m_playerTarget != null && target.Owner.Lookup == player) {
                        PlayerDamage.OnPelletDodge(target, Enemy.pellets[instanceID].instance);
                    }
                }
            }
        }

        // Tracking dodged tongues
        private static MovingEnemyTentacleBase? tongue; // Tongue currently in use => used to work out which tongue hits the player
        [HarmonyPatch(typeof(MovingEnemyTentacleBase), nameof(MovingEnemyTentacleBase.OnAttackIsOut))]
        [HarmonyPrefix]
        private static void OnAttackIsOut(MovingEnemyTentacleBase __instance) {
            if (!SNet.IsMaster) return;

            tongue = __instance;

            PlayerAgent? target = __instance.PlayerTarget;

            bool flag = __instance.CheckTargetInAttackTunnel();
            if (target != null && target.Damage.IsSetup) {
                bool flag2;
                if (__instance.m_owner.EnemyBalancingData.UseTentacleTunnelCheck) {
                    flag2 = flag;
                } else {
                    Vector3 tipPos = __instance.GetTipPos();
                    flag2 = (target.TentacleTarget.position - tipPos).magnitude < __instance.m_owner.EnemyBalancingData.TentacleAttackDamageRadiusIfNoTunnelCheck;
                }
                if (!flag2) {
                    int instance = __instance.m_owner.GetInstanceID();
                    PlayerDamage.OnTongueDodge(target, instance, tongue);
                }
            }
        }
    }
}
