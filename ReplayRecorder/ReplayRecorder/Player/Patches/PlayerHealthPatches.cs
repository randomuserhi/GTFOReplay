using HarmonyLib;

namespace ReplayRecorder.Player.Patches {
    [HarmonyPatch]
    class PlayerHealthPatches {
        /*[HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.Health), MethodType.Setter)]
        [HarmonyPostfix]
        private static void Postfix_SetHealth(Dam_EnemyDamageBase __instance) {

        }*/
    }
}
