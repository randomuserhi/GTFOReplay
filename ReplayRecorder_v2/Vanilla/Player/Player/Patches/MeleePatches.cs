using Gear;
using HarmonyLib;
using Player;
using ReplayRecorder;

namespace Vanilla.Player.Patches {
    [HarmonyPatch]
    internal static class MeleePatches {
        [HarmonyPatch(typeof(MeleeWeaponThirdPerson), nameof(MeleeWeaponThirdPerson.ReceiveClassItemSync))]
        [HarmonyPrefix]
        private static void OnSpawn(MeleeWeaponThirdPerson __instance, PlayerInventoryBase.pSimpleItemSyncData data) {
            rPlayerMelee.Mode mode = rPlayerMelee.Mode.Idle;
            if (data.inFireMode) { // swing
                Replay.Trigger(new rPlayerMeleeSwing(__instance.Owner));
                return;
            } else if (data.inAimMode) { // charge
                if (__instance.IsCharging) {
                    return; // Already charging
                }
                mode = rPlayerMelee.Mode.Charge;
            }
            Replay.Trigger(new rPlayerMelee(__instance.Owner, mode));
        }

        [HarmonyPatch(typeof(PlayerSync), nameof(PlayerSync.IncomingGenericInteract))]
        [HarmonyPostfix]
        public static void onThirdPersonShove(PlayerSync __instance, pGenericInteractAnimation data) {
            if (data.Type == pGenericInteractAnimation.TypeEnum.MeleeShove) {
                Replay.Trigger(new rPlayerMeleeShove(__instance.m_agent));
            }
        }

        [HarmonyPatch(typeof(MWS_ChargeUp), nameof(MWS_ChargeUp.Enter))]
        [HarmonyPostfix]
        private static void onCharge() {
            Replay.Trigger(new rPlayerMelee(PlayerManager.GetLocalPlayerAgent(), rPlayerMelee.Mode.Charge));
        }

        [HarmonyPatch(typeof(MWS_ChargeUp), nameof(MWS_ChargeUp.Exit))]
        [HarmonyPostfix]
        private static void onChargeExit() {
            Replay.Trigger(new rPlayerMelee(PlayerManager.GetLocalPlayerAgent(), rPlayerMelee.Mode.Idle));
        }

        [HarmonyPatch(typeof(MWS_AttackSwingBase), nameof(MWS_AttackSwingBase.Enter))]
        [HarmonyPostfix]
        private static void onSwing() {
            Replay.Trigger(new rPlayerMeleeSwing(PlayerManager.GetLocalPlayerAgent()));
        }

        [HarmonyPatch(typeof(MWS_Push), nameof(MWS_Push.Enter))]
        [HarmonyPostfix]
        private static void onShove() {
            Replay.Trigger(new rPlayerMeleeShove(PlayerManager.GetLocalPlayerAgent()));
        }
    }
}
