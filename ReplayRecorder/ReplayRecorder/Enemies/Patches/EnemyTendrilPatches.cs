using Enemies;
using HarmonyLib;

namespace ReplayRecorder.Enemies.Patches {
    [HarmonyPatch]
    internal class EnemyTendrilPatches {

        [HarmonyPatch(typeof(ScoutAntenna), nameof(ScoutAntenna.DetailUpdate))]
        [HarmonyPostfix]
        private static void Postfix_ScoutAntennaDetail(ScoutAntenna __instance) {
            int instance = __instance.GetInstanceID();
            if (__instance.m_detection == null || __instance.m_detection.State == eDetectionState.Idle) {
                EnemyTendrils.DespawnTendril(instance);
            } else {
                EnemyTendrils.SpawnTendril(instance, __instance, __instance.m_detection.m_owner);
            }
        }

        [HarmonyPatch(typeof(ScoutAntenna), nameof(ScoutAntenna.Remove))]
        [HarmonyPostfix]
        private static void Postfix_ScoutAntennaRemove(ScoutAntenna __instance) {
            int instance = __instance.GetInstanceID();
            EnemyTendrils.DespawnTendril(instance);
        }
    }
}
