﻿using HarmonyLib;
using Player;

namespace Vanilla.Player.Patches {
    [HarmonyPatch]
    internal class ModelPatches {
        // Force animations to play

        [HarmonyPatch(typeof(PLOC_Downed), nameof(PLOC_Downed.Enter))]
        [HarmonyPrefix]
        private static void OnDowned(PLOC_Downed __instance) {
            if (__instance.m_owner.IsLocallyOwned && !__instance.m_owner.Owner.IsBot) {
                __instance.m_owner.AnimatorBody.Play("Dead", 1);
            }
        }

        [HarmonyPatch(typeof(PLOC_Downed), nameof(PLOC_Downed.OnPlayerRevived))]
        [HarmonyPrefix]
        private static void OnRevive(PLOC_Downed __instance) {
            if (__instance.m_owner.IsLocallyOwned && !__instance.m_owner.Owner.IsBot) {
                __instance.m_owner.AnimatorBody.Play("Revive", 1);
            }
        }

        [HarmonyPatch(typeof(PlayerAgent), nameof(PlayerAgent.Update))]
        [HarmonyPrefix]
        private static void OnUpdate(PlayerAgent __instance) {
            __instance.m_movingCuller.CullBucket.Show();
        }
    }
}